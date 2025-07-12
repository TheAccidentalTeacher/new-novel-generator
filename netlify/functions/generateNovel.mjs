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
      model = 'gpt-4o-mini'; // Use GPT-4o-mini for cost-effective synopsis generation
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
      model = 'gpt-4o-mini'; // Use GPT-4o-mini for cost-effective outline generation  
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
      model = 'gpt-4o'; // Use GPT-4o (most advanced available) for highest quality fiction generation
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
      
      // Dynamic word count based on story length
      let targetWordCount = '2000-3000';
      let maxWordsInstruction = 'approximately 2000-3000 words';
      
      switch(wordCount) {
        case 'flash-fiction':
          targetWordCount = '200-500';
          maxWordsInstruction = 'approximately 200-500 words';
          break;
        case 'short-story':
          targetWordCount = '500-1000';
          maxWordsInstruction = 'approximately 500-1000 words';
          break;
        case 'novelette':
          targetWordCount = '1000-2000';
          maxWordsInstruction = 'approximately 1000-2000 words';
          break;
        case 'novella':
          targetWordCount = '2000-3000';
          maxWordsInstruction = 'approximately 2000-3000 words';
          break;
        case 'novel':
          targetWordCount = '2500-4000';
          maxWordsInstruction = 'approximately 2500-4000 words';
          break;
        case 'epic':
          targetWordCount = '3000-5000';
          maxWordsInstruction = 'approximately 3000-5000 words';
          break;
      }
      
      // Enhanced professional system prompt for highest quality fiction writing
      systemPrompt = `You are a master novelist with the storytelling mastery of authors like Toni Morrison, Gabriel García Márquez, Ursula K. Le Guin, and Neil Gaiman. Your writing demonstrates literary excellence and commercial appeal. Apply these professional standards:

SHOW, DON'T TELL MASTERY:
- Transform exposition into immersive scenes where readers discover information through action and consequence
- Use precise sensory details (sight, sound, smell, touch, taste) to create vivid, visceral experiences
- Reveal character emotions through physical manifestations: "Her fingers trembled against the doorframe" instead of "She was nervous"
- Show relationships through meaningful interactions, shared glances, and unspoken tensions
- Convey backstory through objects, dialogue fragments, and character reactions to present events
- Let readers infer character traits from behavior patterns and choices under pressure
- Use environmental details that reflect and amplify emotional states and themes

DIALOGUE EXCELLENCE & AUTHENTICITY:
- Create distinct voice patterns for each character based on background, education, region, and personality
- Layer subtext beneath surface conversations - characters have hidden agendas, fears, and desires
- Include natural speech rhythms: hesitations, interruptions, incomplete thoughts, regional expressions
- Balance dialogue with action beats that reveal character state: "She set down her cup with deliberate care"
- Use dialogue to reveal conflict, advance plot, and deepen relationships simultaneously
- Incorporate realistic power dynamics and communication styles between different characters
- Make every conversation serve multiple story functions while feeling natural and unforced

ADVANCED LITERARY TECHNIQUES:
- Employ varied sentence structures: short punchy fragments for tension, flowing sentences for contemplation
- Choose precise, evocative verbs over adverbs: "She stalked" instead of "She walked angrily"
- Create metaphors and imagery that reinforce theme and character psychology
- Use strategic repetition and parallel structure for emphasis and rhythm
- Build tension through pacing: quick exchanges for urgency, longer passages for reflection
- Employ stream of consciousness for intimate character moments
- Create atmospheric mood through carefully selected concrete details

SCENE CRAFT & STRUCTURE:
- Begin scenes in medias res with immediate tension or conflict
- Ground readers in time, place, and emotional context within the first few sentences
- End scenes with forward momentum: questions, discoveries, or emotional shifts
- Use cinematic techniques: close-ups on significant details, wide shots for scope
- Create scene objectives where every character wants something specific
- Build rising action through escalating obstacles and mounting tension
- Ensure each scene advances plot, develops character, or deepens theme (ideally all three)`;

      userPrompt = `Write Chapter ${chapterNumber} for a ${genre}${subgenre ? ` (${subgenre})` : ''} ${wordCount || 'novel'} that demonstrates professional, publishable quality.
        
        STORY FOUNDATION:
        Synopsis: ${synopsis}
        
        ${previousContext}
        
        CHAPTER ${chapterNumber} DETAILED OUTLINE: ${JSON.stringify(chapterOutline)}
        
        CRITICAL LENGTH REQUIREMENTS:
        - Target word count: ${targetWordCount} words
        - Write ${maxWordsInstruction} - this is ESSENTIAL for proper chapter development
        - Use substantial, well-developed paragraphs (75-150 words each)
        - Include detailed scene-setting, full character interactions, and rich internal thoughts
        - DO NOT write abbreviated or summary-style scenes - develop every moment fully
        
        PROFESSIONAL WRITING MANDATES:
        
        SHOW, DON'T TELL IMPLEMENTATION:
        - Replace ALL exposition with dramatic scenes that reveal information through action
        - Use concrete sensory details to immerse readers completely in each moment
        - Show character emotions through body language, dialogue tone, and environmental interaction
        - Reveal plot points through character discoveries, conversations, and consequences
        - Let readers piece together relationships and backstory from behavioral evidence
        - Use symbolic details and meaningful objects to convey deeper themes
        
        DIALOGUE MASTERY REQUIREMENTS:
        - Write authentic, character-specific speech patterns that reflect personality and background
        - Layer subtext beneath surface conversations - characters rarely say exactly what they mean
        - Include realistic interruptions, overlapping speech, and natural conversation flow
        - Balance spoken words with action beats that reveal character psychology
        - Use dialogue to create tension, reveal secrets, and advance multiple plot threads
        - Ensure every exchange serves character development, plot advancement, and relationship dynamics
        
        SCENE DEVELOPMENT STANDARDS:
        - Open with immediate engagement - drop readers into ongoing action or tension
        - Establish clear scene objectives: what each character wants and what's at stake
        - Build conflict through character goals that clash or complement in complex ways
        - Use environmental details to enhance mood and reflect character emotional states
        - Create rising tension that culminates in meaningful change or revelation
        - End with compelling forward momentum that hooks readers for the next chapter
        
        GENRE-SPECIFIC EXCELLENCE:
        - Honor ${genre}${subgenre ? ` (${subgenre})` : ''} conventions while bringing fresh perspective
        - Use genre-appropriate pacing, tone, and thematic elements
        - Incorporate expected genre elements naturally within the story flow
        - Balance familiar tropes with unexpected twists and character depth
        
        CONTINUITY & CONSISTENCY:
        - Maintain perfect consistency with established characters, plot, and world-building
        - Honor the tone and style established in previous chapters
        - Create smooth transitions that connect naturally to preceding events
        - Advance the overall story arc while developing this chapter's specific conflicts
        - Set up future plot developments through careful foreshadowing and character setup
        
        FINAL TECHNICAL REQUIREMENTS:
        - Write in complete, fully-developed scenes with clear beginning, middle, and end
        - Use proper paragraph breaks for dialogue and scene transitions
        - Maintain consistent point of view throughout the chapter
        - End with a compelling hook that creates anticipation for the next chapter
        - Format as clean chapter text without titles, numbers, or prefacing explanations
        
        Focus on creating a chapter that could appear in a professionally published novel, with the depth, authenticity, and literary quality that readers expect from accomplished authors.`;
      
      // Increase max tokens significantly for longer, higher-quality chapters
      maxTokens = Math.min(25000, Math.ceil(parseInt(targetWordCount.split('-')[1]) * 2)); // Allow 2x target words in tokens for quality
      temperature = 0.85; // Optimal for creative but controlled writing
      break;
      
    case 'character':
      model = 'gpt-3.5-turbo'; // Use GPT-3.5-turbo for cost-effective character generation
      userPrompt = prompt 
        ? `Create a detailed character for a ${storyData?.genre || 'fiction'} story based on: ${prompt}. Include name, role, background, personality, goals, and conflicts.`
        : `Generate a compelling character for a ${storyData?.genre || 'fiction'} story with detailed background, personality, goals, and conflicts.`;
      maxTokens = 1200;
      break;
      
    case 'worldbuilding':
      model = 'gpt-3.5-turbo'; // Use GPT-3.5-turbo for cost-effective worldbuilding generation
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
      model = 'gpt-3.5-turbo'; // Use GPT-3.5-turbo for cost-effective scene generation
      userPrompt = prompt 
        ? `Write a compelling scene for a ${storyData?.genre || 'fiction'} story: ${prompt}. Make it engaging with dialogue, action, and character development.`
        : `Write an engaging scene with compelling dialogue, vivid descriptions, and character development.`;
      maxTokens = 2000;
      break;
      
    case 'chapter':
      model = 'gpt-3.5-turbo'; // Use GPT-3.5-turbo for basic chapter generation (legacy mode)
      userPrompt = prompt 
        ? `Write the first chapter of a ${storyData?.genre || 'fiction'} novel based on: ${prompt}. Create an engaging opening with strong character introduction and plot hook.`
        : `Write an engaging first chapter with compelling characters, vivid setting, and an intriguing plot hook.`;
      maxTokens = 2500;
      break;
      
    case 'quick':
      model = 'gpt-3.5-turbo'; // Use GPT-3.5-turbo for basic quick generation
      break;
      
    default:
      userPrompt = prompt || 'Generate creative writing content for a novel.';
      break;
  }

  // Retry function for rate limit handling
  const makeOpenAIRequest = async (params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const completion = await openai.chat.completions.create(params);
        return completion;
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error.message);
        console.log(`Error status: ${error.status}`);
        console.log(`Error type: ${error.type}`);
        
        if (error.status === 429) { // Rate limit error
          const waitTime = Math.min(1000 * Math.pow(2, i), 30000); // Exponential backoff, max 30s
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Log more details for debugging
        if (error.status === 400) {
          console.log('Bad request error - check model name and parameters');
        }
        if (error.status === 401) {
          console.log('Unauthorized - check API key');
        }
        if (error.status === 404) {
          console.log('Model not found - check model name');
        }
        
        if (i === retries - 1) throw error; // Last attempt, throw the error
      }
    }
  };

  try {
    console.log(`Processing ${mode} request with model: ${model}`);
    console.log(`Prompt length: ${userPrompt.length} characters`);
    console.log(`Max tokens: ${maxTokens}`);
    console.log(`API Key present: ${!!apiKey}`);
    
    const messages = systemPrompt ? 
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ] : 
      [{ role: 'user', content: userPrompt }];

    const completion = await makeOpenAIRequest({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    });
    
    const generatedContent = completion.choices[0].message.content;
    const wordCount = generatedContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    console.log(`Successfully generated content for ${mode}`);
    console.log(`Generated ${wordCount} words`);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        result: generatedContent,
        wordCount: wordCount
      })
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
