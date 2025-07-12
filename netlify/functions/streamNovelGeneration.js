// Real-time streaming novel generation with Server-Sent Events
exports.handler = async (event, context) => {
  console.log('🚀 Stream Novel Generation started');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { synopsis, genre, subgenre, wordCount } = JSON.parse(event.body);
    
    console.log('📖 Starting streaming generation:', { genre, subgenre, wordCount });

    // Initialize OpenAI
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Set up SSE headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    };

    // Create a readable stream for SSE
    let streamData = '';
    
    // Function to send SSE message
    const sendSSE = (event, data) => {
      streamData += `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    };

    // Step 1: Generate chapter outline
    sendSSE('progress', {
      phase: 'outlining',
      message: 'Analyzing synopsis and creating chapter structure...',
      progress: 10
    });

    const outlinePrompt = `You are a professional novel outliner. Based on the following synopsis, create a detailed chapter-by-chapter outline.

Synopsis: ${synopsis}
Genre: ${genre} - ${subgenre}
Target Length: ${wordCount}

Create 8-15 chapters (depending on length) with:
- Chapter title
- Chapter summary (2-3 sentences)
- Key events
- Character focus
- Setting

Return as JSON array: [{"title": "Chapter Title", "summary": "...", "keyEvents": ["event1", "event2"], "characters": ["char1"], "setting": "location"}]`;

    try {
      const outlineResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: outlinePrompt }],
        temperature: 0.7,
        max_tokens: 2000
      });

      const outlineText = outlineResponse.choices[0].message.content;
      const outline = JSON.parse(outlineText.replace(/```json\n?|\n?```/g, ''));
      
      sendSSE('outline_complete', {
        phase: 'outlining',
        message: `Created outline with ${outline.length} chapters`,
        progress: 25,
        outline: outline,
        chaptersOutlined: outline.length
      });

      // Step 2: Generate each chapter with streaming
      for (let i = 0; i < outline.length; i++) {
        const chapter = outline[i];
        const chapterNumber = i + 1;
        
        sendSSE('chapter_start', {
          phase: 'writing',
          currentChapter: chapterNumber,
          message: `Starting Chapter ${chapterNumber}: ${chapter.title}`,
          progress: 25 + (i / outline.length) * 70,
          chaptersWritten: i
        });

        const chapterPrompt = `Write Chapter ${chapterNumber} of a ${genre} ${subgenre} novel.

Chapter Outline:
Title: ${chapter.title}
Summary: ${chapter.summary}
Key Events: ${chapter.keyEvents?.join(', ')}
Characters: ${chapter.characters?.join(', ')}
Setting: ${chapter.setting}

Previous Context: ${i > 0 ? `Previous chapter summary: ${outline[i-1].summary}` : 'This is the opening chapter.'}

Write a complete chapter (2000-4000 words) with:
- Rich, immersive descriptions
- Strong character development
- Compelling dialogue
- "Show, don't tell" techniques
- Proper pacing and tension

Write the full chapter content:`;

        // Stream the chapter generation
        const chapterStream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: chapterPrompt }],
          temperature: 0.8,
          max_tokens: 4000,
          stream: true
        });

        let chapterContent = '';
        let wordCount = 0;
        
        for await (const chunk of chapterStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            chapterContent += content;
            wordCount = chapterContent.split(' ').length;
            
            // Send real-time chapter content
            sendSSE('chapter_content', {
              phase: 'writing',
              currentChapter: chapterNumber,
              chapterTitle: chapter.title,
              content: content,
              fullContent: chapterContent,
              wordCount: wordCount,
              progress: 25 + ((i + (chapterContent.length / 8000)) / outline.length) * 70
            });
          }
        }
        
        sendSSE('chapter_complete', {
          phase: 'writing',
          currentChapter: chapterNumber,
          chapterTitle: chapter.title,
          message: `Chapter ${chapterNumber} completed (${wordCount} words)`,
          progress: 25 + ((i + 1) / outline.length) * 70,
          chaptersWritten: i + 1,
          chapter: {
            number: chapterNumber,
            title: chapter.title,
            content: chapterContent,
            wordCount: wordCount,
            summary: chapter.summary
          }
        });
      }

      // Final completion
      sendSSE('novel_complete', {
        phase: 'complete',
        message: 'Novel generation complete!',
        progress: 100,
        totalChapters: outline.length,
        status: 'complete'
      });

      sendSSE('end', { message: 'Stream ended' });

    } catch (error) {
      console.error('❌ Generation error:', error);
      sendSSE('error', {
        phase: 'error',
        message: error.message,
        error: error.toString()
      });
    }

    return {
      statusCode: 200,
      headers,
      body: streamData
    };

  } catch (error) {
    console.error('❌ Stream setup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to start stream',
        details: error.message 
      })
    };
  }
};
