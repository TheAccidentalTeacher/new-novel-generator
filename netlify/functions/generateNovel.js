// Netlify Function: generateNovel
import { OpenAI } from 'openai';

export const handler = async function(event, context) {
  console.log('Function called with method:', event.httpMethod);
  console.log('Request body length:', event.body ? event.body.length : 0);
  
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
    const { mode, prompt, storyData, genre, subgenre, wordCount, synopsis, outline, chapters, chapterNumber, userInput } = JSON.parse(event.body || '{}');
    console.log('Parsed request data:', { mode, genre, subgenre, wordCount, chapterNumber });
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API key not set in Netlify environment variables',
          details: 'Please add OPENAI_API_KEY to your Netlify site environment variables'
        })
      };
    }
    
    console.log('OpenAI API key found, initializing client');
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
      model = 'gpt-4o'; // Use GPT-4o for synopsis generation
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
      model = 'gpt-4o'; // Use GPT-4o for outline generation  
      const prevChapters = outline && outline.length > 0 ? 
        `Previous chapters in outline: ${outline.map((ch, i) => `Chapter ${i+1}: ${ch.title} - ${ch.summary}`).join('\n')}` : '';
      
      userPrompt = `Generate the next chapter outline for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount || 'novel'}.
        
        Synopsis: ${synopsis}
        ${prevChapters}
        
        ${chapterNumber ? `Generate Chapter ${chapterNumber} outline.` : 'Generate the first chapter outline.'}
        
        You must respond with ONLY a valid JSON object. Do not include any other text, explanations, or markdown formatting.
        
        JSON structure:
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
      model = 'gpt-4o'; // Use GPT-4o for chapter generation
      const chapterOutline = outline && outline[chapterNumber - 1] ? outline[chapterNumber - 1] : null;
      
      // Include more comprehensive context from previous chapters
      let previousContext = '';
      if (chapters && chapters.length > 0) {
        previousContext = `Previous chapters for context and consistency:\n\n`;
        chapters.forEach((ch, i) => {
          previousContext += `=== Chapter ${i + 1}: ${ch.title} ===\n`;
          // Include first 1000 characters and last 500 characters of each previous chapter
          const content = ch.content || '';
          if (content.length > 1500) {
            previousContext += content.substring(0, 1000) + '\n\n[... middle content ...]\n\n' + content.substring(content.length - 500);
          } else {
            previousContext += content;
          }
          previousContext += '\n\n';
        });
      } else {
        previousContext = 'This is the first chapter of the novel.';
      }
      
      userPrompt = `Write Chapter ${chapterNumber} for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount || 'novel'}.
        
        SYNOPSIS: ${synopsis}
        
        ${previousContext}
        
        CHAPTER ${chapterNumber} OUTLINE TO FOLLOW: ${JSON.stringify(chapterOutline)}
        
        REQUIREMENTS:
        - Write a complete chapter of 2000-4000 words
        - Follow the provided chapter outline exactly
        - Maintain perfect consistency with characters, plot, and tone from previous chapters
        - Use genre-appropriate writing style for ${genre}${subgenre ? ` (${subgenre})` : ''}
        - Include vivid descriptions, realistic dialogue, and character development
        - End with a compelling hook that leads naturally to the next chapter
        - Match the writing style and voice established in previous chapters
        - Ensure smooth transitions from the previous chapter's ending
        
        Format the response as a complete chapter with proper paragraphs. Do not include chapter numbers, titles, or any prefacing text - just the chapter content.`;
      maxTokens = 6000;
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
  } catch (mainErr) {
    console.error('Main function error:', mainErr);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: `Function failed: ${mainErr.message}`,
        details: mainErr.toString()
      })
    };
  }
};
