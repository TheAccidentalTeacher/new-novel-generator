// AutoGenerate Novel Function - Complete "Set It and Forget It" workflow
import { OpenAI } from 'openai';

export const handler = async function(event, context) {
  console.log('AutoGenerate function called with method:', event.httpMethod);
  console.log('Request body:', event.body);
  
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

  try {
    console.log('Parsing request body...');
    const requestData = JSON.parse(event.body || '{}');
    const { mode, jobId, synopsis, genre, subgenre, wordCount, userPreferences } = requestData;
    console.log('Request data parsed:', { mode, genre, subgenre, wordCount, synopsisLength: synopsis?.length });
    
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API key not found in environment variables'
        })
      };
    }
    
    const openai = new OpenAI({ apiKey });

    // Context Management System
    const contextManager = {
      maxTokens: 120000, // GPT-4o limit with safety margin
      
      compressChapter(chapter, level = 'medium') {
        const content = chapter.content || '';
        switch(level) {
          case 'light':
            return content.substring(0, Math.min(content.length, 2000));
          case 'medium':
            return content.substring(0, Math.min(content.length, 1000));
          case 'heavy':
            return content.substring(0, Math.min(content.length, 500));
          default:
            return content;
        }
      },
      
      buildContext(synopsis, outline, chapters, currentChapterNum) {
        let context = `SYNOPSIS:\n${synopsis}\n\n`;
        
        // Add outline
        if (outline && outline.length > 0) {
          context += `OUTLINE:\n`;
          outline.forEach((ch, i) => {
            context += `Chapter ${i + 1}: ${ch.title} - ${ch.summary}\n`;
          });
          context += '\n';
        }
        
        // Add previous chapters with compression
        if (chapters && chapters.length > 0) {
          context += `PREVIOUS CHAPTERS:\n`;
          chapters.forEach((ch, i) => {
            const chapterNum = i + 1;
            const distance = currentChapterNum - chapterNum;
            
            let compressionLevel = 'none';
            if (distance > 5) compressionLevel = 'heavy';
            else if (distance > 2) compressionLevel = 'medium';
            else if (distance > 0) compressionLevel = 'light';
            
            const content = compressionLevel === 'none' ? 
              ch.content : this.compressChapter(ch, compressionLevel);
              
            context += `=== Chapter ${chapterNum}: ${ch.title} ===\n${content}\n\n`;
          });
        }
        
        return context;
      }
    };

    // Progress Management
    const progressManager = {
      async updateProgress(jobId, phase, progress, details) {
        console.log(`Job ${jobId}: ${phase} - ${progress}% - ${details}`);
        // In a real implementation, this would update a database or cache
        // For now, we'll just log progress
      }
    };

    // Retry mechanism with exponential backoff
    const makeOpenAIRequest = async (params, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const completion = await openai.chat.completions.create(params);
          return completion;
        } catch (error) {
          console.log(`Attempt ${i + 1} failed:`, error.message);
          
          if (error.status === 429) { // Rate limit error
            const waitTime = Math.min(1000 * Math.pow(2, i), 30000);
            console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          if (i === retries - 1) throw error;
        }
      }
    };

    // Handle different modes
    switch(mode) {
      case 'test':
        console.log('Test mode - returning success');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'success',
            message: 'AutoGenerate function is working',
            timestamp: new Date().toISOString()
          })
        };
        
      case 'start':
        return await startAutoGeneration(synopsis, genre, subgenre, wordCount, userPreferences);
      
      case 'status':
        return await getJobStatus(jobId);
      
      case 'cancel':
        return await cancelJob(jobId);
      
      default:
        throw new Error(`Invalid mode specified: ${mode}`);
    }

    // Start Auto Generation
    async function startAutoGeneration(synopsis, genre, subgenre, wordCount, prefs = {}) {
      const jobId = generateJobId();
      
      try {
        await progressManager.updateProgress(jobId, 'starting', 0, 'Analyzing synopsis and planning novel structure');
        
        // Step 1: Analyze synopsis and determine chapter count
        const analysisPrompt = `Analyze this ${wordCount} ${genre} synopsis and determine the optimal chapter structure:

SYNOPSIS:
${synopsis}

Provide a JSON response with:
{
  "recommendedChapterCount": number,
  "storyStructure": "three-act" | "hero-journey" | "custom",
  "estimatedWordsPerChapter": number,
  "keyStoryBeats": ["beat1", "beat2", "..."],
  "pacing": "fast" | "medium" | "slow"
}`;

        const analysisResponse = await makeOpenAIRequest({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 800,
          temperature: 0.3
        });

        let analysis;
        try {
          analysis = JSON.parse(analysisResponse.choices[0].message.content);
        } catch (e) {
          // Fallback if JSON parsing fails
          analysis = {
            recommendedChapterCount: getDefaultChapterCount(wordCount),
            estimatedWordsPerChapter: getDefaultWordsPerChapter(wordCount),
            storyStructure: "three-act",
            keyStoryBeats: ["Opening", "Inciting Incident", "Rising Action", "Climax", "Resolution"],
            pacing: "medium"
          };
        }

        await progressManager.updateProgress(jobId, 'analysis', 10, `Planning ${analysis.recommendedChapterCount} chapters`);

        // Step 2: Generate complete outline
        const outline = await generateCompleteOutline(synopsis, genre, subgenre, analysis);
        
        await progressManager.updateProgress(jobId, 'outline', 30, `Generated outline for ${outline.length} chapters`);

        // Step 3: Generate all chapters
        const chapters = await generateAllChapters(synopsis, genre, subgenre, outline, analysis);

        await progressManager.updateProgress(jobId, 'complete', 100, 'Novel generation complete!');

        // Return complete novel data
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({
            jobId,
            status: 'complete',
            novel: {
              synopsis,
              genre,
              subgenre,
              wordCount,
              outline,
              chapters,
              metadata: {
                totalWords: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
                chapterCount: chapters.length,
                generatedAt: new Date().toISOString()
              }
            }
          })
        };

      } catch (error) {
        console.error('Auto generation error:', error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({
            jobId,
            status: 'error',
            error: error.message
          })
        };
      }
    }

    // Generate Complete Outline
    async function generateCompleteOutline(synopsis, genre, subgenre, analysis) {
      const outline = [];
      
      for (let i = 1; i <= analysis.recommendedChapterCount; i++) {
        await progressManager.updateProgress(jobId, 'outline', 
          Math.round(30 + (i / analysis.recommendedChapterCount) * 20), 
          `Generating outline for Chapter ${i}`);

        const prevChapters = outline.slice(0, i - 1);
        const chapterPrompt = `Generate outline for Chapter ${i} of ${analysis.recommendedChapterCount} for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount}.

SYNOPSIS: ${synopsis}

${prevChapters.length > 0 ? `PREVIOUS CHAPTERS:\n${prevChapters.map((ch, idx) => `Chapter ${idx + 1}: ${ch.title} - ${ch.summary}`).join('\n')}\n` : ''}

STORY STRUCTURE: ${analysis.storyStructure}
TARGET WORDS: ${analysis.estimatedWordsPerChapter}

Generate Chapter ${i} outline as JSON:
{
  "title": "Chapter title",
  "summary": "2-3 sentence chapter summary",
  "keyEvents": ["event 1", "event 2", "event 3"],
  "characters": ["character names involved"],
  "setting": "where this chapter takes place",
  "purpose": "how this chapter advances the story",
  "mood": "emotional tone of chapter"
}`;

        const response = await makeOpenAIRequest({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: chapterPrompt }],
          max_tokens: 600,
          temperature: 0.6
        });

        try {
          const chapterOutline = JSON.parse(response.choices[0].message.content);
          outline.push(chapterOutline);
        } catch (e) {
          // Fallback outline if JSON parsing fails
          outline.push({
            title: `Chapter ${i}`,
            summary: `Chapter ${i} continues the story progression.`,
            keyEvents: ["Story advancement"],
            characters: ["Main characters"],
            setting: "Story location",
            purpose: "Advance plot",
            mood: "appropriate"
          });
        }
      }

      return outline;
    }

    // Generate All Chapters
    async function generateAllChapters(synopsis, genre, subgenre, outline, analysis) {
      const chapters = [];
      
      for (let i = 0; i < outline.length; i++) {
        const chapterNum = i + 1;
        
        await progressManager.updateProgress(jobId, 'chapters',
          Math.round(50 + (i / outline.length) * 50),
          `Writing Chapter ${chapterNum}: ${outline[i].title}`);

        const context = contextManager.buildContext(synopsis, outline, chapters, chapterNum);
        
        // Advanced system prompt for high-quality chapter generation
        const systemPrompt = `You are a master novelist creating professional-quality fiction. Write with literary excellence demonstrating:

SHOW, DON'T TELL MASTERY:
- Transform exposition into immersive scenes through action and consequence
- Use precise sensory details to create visceral, lived experiences
- Reveal emotions through physical manifestations and environmental interaction
- Show relationships through meaningful interactions and unspoken tensions
- Let readers discover information through character behavior and story events

DIALOGUE EXCELLENCE:
- Create distinct voice patterns for each character based on background and personality
- Layer subtext beneath conversations - characters have hidden agendas and motivations
- Include natural speech rhythms with hesitations, interruptions, and authentic flow
- Balance dialogue with action beats that reveal character psychology
- Make every exchange advance plot, develop character, and deepen relationships

LITERARY CRAFT:
- Employ varied sentence structures for optimal rhythm and pacing
- Choose precise, evocative verbs over adverbs
- Create atmosphere through carefully selected concrete details
- Build tension through strategic pacing and scene structure
- Develop themes organically through story events and character choices`;

        const userPrompt = `Write Chapter ${chapterNum} for this ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount}.

${context}

CHAPTER ${chapterNum} OUTLINE: ${JSON.stringify(outline[i])}

TARGET LENGTH: ${analysis.estimatedWordsPerChapter} words

WRITING REQUIREMENTS:
- SHOW, DON'T TELL: Replace exposition with immersive scenes
- RICH DIALOGUE: Authentic conversations with subtext and character-specific voices  
- SENSORY DETAIL: Use all five senses to ground readers in the scene
- SCENE STRUCTURE: Clear objectives, rising tension, meaningful change
- GENRE CONVENTIONS: Honor ${genre} expectations while bringing fresh perspective
- CONTINUITY: Maintain perfect consistency with previous chapters
- PACING: Match the overall story rhythm and build toward climactic moments

Write the complete chapter with proper paragraphs. Do not include chapter numbers or titles - just the chapter content.`;

        const response = await makeOpenAIRequest({
          model: 'gpt-4o', // Use premium model for chapter generation
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: Math.min(20000, Math.ceil(analysis.estimatedWordsPerChapter * 1.5)),
          temperature: 0.85
        });

        const chapterContent = response.choices[0].message.content;
        const chapterWordCount = chapterContent.trim().split(/\s+/).filter(word => word.length > 0).length;

        chapters.push({
          number: chapterNum,
          title: outline[i].title,
          content: chapterContent,
          summary: outline[i].summary,
          wordCount: chapterWordCount,
          generatedAt: new Date().toISOString()
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return chapters;
    }

    // Utility functions
    function generateJobId() {
      return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getDefaultChapterCount(wordCount) {
      switch(wordCount) {
        case 'flash-fiction': return 1;
        case 'short-story': return 3;
        case 'novelette': return 8;
        case 'novella': return 15;
        case 'novel': return 20;
        case 'epic': return 30;
        default: return 18;
      }
    }

    function getDefaultWordsPerChapter(wordCount) {
      switch(wordCount) {
        case 'flash-fiction': return 800;
        case 'short-story': return 2000;
        case 'novelette': return 1500;
        case 'novella': return 2500;
        case 'novel': return 3500;
        case 'epic': return 4500;
        default: return 3000;
      }
    }

    // Status and cancellation handlers (simplified for this implementation)
    async function getJobStatus(jobId) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId,
          status: 'processing',
          message: 'Status checking not implemented in this demo'
        })
      };
    }

    async function cancelJob(jobId) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId,
          status: 'cancelled',
          message: 'Job cancellation requested'
        })
      };
    }

  } catch (mainErr) {
    console.error('Main function error:', mainErr);
    console.error('Error stack:', mainErr.stack);
    console.error('Error details:', {
      message: mainErr.message,
      name: mainErr.name,
      code: mainErr.code
    });
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: `AutoGenerate failed: ${mainErr.message}`,
        details: mainErr.toString(),
        stack: mainErr.stack
      })
    };
  }
};
