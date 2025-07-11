// Netlify Function: generateNovel
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
  const { mode, prompt, storyData } = JSON.parse(event.body || '{}');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not set' })
    };
  }
  const openai = new OpenAI({ apiKey });

  // Enhanced prompts for different content types
  let userPrompt = '';
  let maxTokens = 1500;
  let temperature = 0.8;

  switch(mode) {
    case 'quick':
      userPrompt = prompt || 'Generate a creative and engaging novel premise with interesting characters, compelling plot, setting, and theme. Include a brief synopsis.';
      maxTokens = 2000;
      break;
      
    case 'synopsis':
      userPrompt = prompt 
        ? `Create a compelling synopsis for a ${storyData?.genre || 'fiction'} novel titled "${storyData?.title || 'Untitled'}" based on this concept: ${prompt}`
        : `Generate a compelling synopsis for a ${storyData?.genre || 'fiction'} novel with engaging characters and plot.`;
      maxTokens = 1000;
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
      
    case 'outline':
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: userPrompt 
      }],
      max_tokens: maxTokens,
      temperature: temperature
    });
    
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
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
