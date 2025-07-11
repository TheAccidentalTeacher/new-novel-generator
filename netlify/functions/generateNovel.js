// Netlify Function: generateNovel
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
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

  const { mode, prompt, storyData, genre, subgenre, wordCount, synopsis, outline, chapters, chapterNumber, userInput } = JSON.parse(event.body || '{}');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'OpenAI API key not set' })
    };
  }
  const openai = new OpenAI({ apiKey });

  // Enhanced prompts for different content types
  let userPrompt = '';
  let systemPrompt = '';
  let maxTokens = 1500;
  let temperature = 0.8;
  let model = 'gpt-3.5-turbo';

  // Helper function to get word count context
  const getWordCountContext = (wordCount) => {
    switch(wordCount) {
      case 'flash-fiction': return '(500-1,000 words total)';
      case 'short-story': return '(1,000-7,500 words total)';
      case 'novelette': return '(7,500-17,500 words total)';
      case 'novella': return '(17,500-40,000 words total)';
      case 'novel': return '(40,000-100,000+ words total)';
      case 'epic': return '(100,000+ words total)';
      default: return '';
    }
  };

  switch(mode) {
    case 'quick':
      userPrompt = prompt || 'Generate a creative and engaging novel premise with interesting characters, compelling plot, setting, and theme. Include a brief synopsis.';
      maxTokens = 2000;
      break;

    case 'synopsis':
      const wordCountInfo = getWordCountContext(wordCount);
      const genreInfo = subgenre ? `${genre} (${subgenre})` : genre;
      userPrompt = `Create a compelling 250-word synopsis for a ${genreInfo} ${wordCount || 'novel'} ${wordCountInfo}. 
        User input: ${userInput || prompt}
        
        The synopsis should include:
        - Main character(s) and their motivation
        - Central conflict or problem
        - Key plot points
        - Stakes and consequences
        - Tone appropriate to the genre
        
        Keep it exactly around 250 words and make it engaging for readers of ${genreInfo}.`;
      maxTokens = 400;
      temperature = 0.7;
      break;

    case 'outline':
      model = 'gpt-4o-mini'; // Use GPT-4 for outline generation
      const prevChapters = outline && outline.length > 0 ? 
        `Previous chapters in outline: ${outline.map((ch, i) => `Chapter ${i+1}: ${ch.title} - ${ch.summary}`).join('\n')}` : '';
      
      userPrompt = `Generate the next chapter outline for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount || 'novel'}.
        
        Synopsis: ${synopsis}
        ${prevChapters}
        
        ${chapterNumber ? `Generate Chapter ${chapterNumber} outline.` : 'Generate the first chapter outline.'}
        
        Provide ONLY a JSON object with this exact structure:
        {
          "title": "Chapter title",
          "summary": "2-3 sentence chapter summary",
          "keyEvents": ["event 1", "event 2", "event 3"],
          "characters": ["character names involved"],
          "setting": "where this chapter takes place",
          "purpose": "how this chapter advances the story"
        }`;
      maxTokens = 600;
      temperature = 0.6;
      break;

    case 'generate-chapter':
      model = 'gpt-4o-mini'; // Use GPT-4 for chapter generation
      const chapterOutline = outline && outline[chapterNumber - 1] ? outline[chapterNumber - 1] : null;
      const previousChapterContent = chapters && chapters.length > 0 ? 
        `Previous chapter summary: ${chapters[chapters.length - 1].summary || 'No previous chapters'}` : '';
      
      userPrompt = `Write Chapter ${chapterNumber} for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount || 'novel'}.
        
        Synopsis: ${synopsis}
        ${previousChapterContent}
        
        Chapter Outline: ${JSON.stringify(chapterOutline)}
        
        Write a full chapter (2000-4000 words) that:
        - Follows the chapter outline
        - Maintains consistency with previous chapters
        - Uses appropriate genre conventions
        - Includes vivid descriptions, realistic dialogue, and character development
        - Ends with a hook for the next chapter
        
        Format as a complete chapter with proper paragraphs.`;
      maxTokens = 5000;
      temperature = 0.8;
      break;
      
    case 'character':
      userPrompt = prompt 
        ? `Create a detailed character for a ${storyData?.genre || 'fiction'} story based on: ${prompt}. Include name, role, background, personality, goals, and conflicts.`
        : `Generate a compelling character for a ${storyData?.genre || 'fiction'} story with detailed background, personality, goals, and conflicts.`;
      maxTokens = 1200;
      break;
      
    case 'worldbuilding':
      userPrompt = prompt 
        ? `Create detailed worldbuilding elements for a ${storyData?.genre || 'fiction'} story: ${prompt}. Include locations, cultures, rules, or systems.`
        : `Generate interesting worldbuilding elements for a ${storyData?.genre || 'fiction'} story including locations, cultures, and unique aspects.`;
      maxTokens = 1500;
      break;
      
    case 'outline-legacy':
      userPrompt = prompt 
        ? `Create a detailed novel outline for: ${prompt}. Include chapter breakdown, plot points, character arcs, and story structure.`
        : `Generate a detailed novel outline with compelling plot structure, character development, and chapter breakdown.`;
      maxTokens = 2500;
      break;
      
    case 'scene':
      userPrompt = prompt 
        ? `Write a compelling scene for a ${storyData?.genre || 'fiction'} story: ${prompt}. Make it engaging with dialogue, action, and character development.`
        : `Write an engaging scene with compelling dialogue, vivid descriptions, and character development.`;
      maxTokens = 2000;
      break;
      
    case 'chapter':
      userPrompt = prompt 
        ? `Write the first chapter of a ${storyData?.genre || 'fiction'} novel based on: ${prompt}. Create an engaging opening with strong character introduction and plot hook.`
        : `Write an engaging first chapter with compelling characters, vivid setting, and an intriguing plot hook.`;
      maxTokens = 2500;
      break;
      
    default:
      userPrompt = prompt || 'Generate creative writing content for a novel.';
      break;
  }

  try {
    console.log(`Processing ${mode} request with model: ${model}`);
    console.log(`Prompt length: ${userPrompt.length} characters`);
    
    const messages = systemPrompt ? 
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ] : 
      [{ role: 'user', content: userPrompt }];

    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    });
    
    console.log(`Successfully generated content for ${mode}`);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ result: completion.choices[0].message.content })
    };
  } catch (err) {
    console.error(`Error in ${mode} generation:`, err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: `${mode} generation failed: ${err.message}`,
        details: err.toString(),
        stack: err.stack
      })
    };
  }
};
