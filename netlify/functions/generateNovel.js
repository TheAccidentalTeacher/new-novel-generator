// Netlify Function: generateNovel
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
  const { outline, chapters, mode, prompt } = JSON.parse(event.body || '{}');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not set' })
    };
  }
  const openai = new OpenAI({ apiKey });

  // Enhanced prompts for better content generation
  let userPrompt = prompt || 'Generate a creative and engaging novel premise with interesting characters and a compelling plot.';
  
  if (mode === 'outline') {
    userPrompt = prompt 
      ? `Create a detailed novel outline based on this idea: ${prompt}. Include main plot points, character arcs, and chapter breakdown.`
      : 'Generate a detailed novel outline with compelling characters, plot structure, and chapter breakdown for an engaging story.';
  }
  
  if (mode === 'chapter') {
    userPrompt = prompt 
      ? `Write the first chapter of a novel based on this premise: ${prompt}. Make it engaging and well-written.`
      : 'Write an engaging first chapter of a novel with compelling characters and an intriguing opening.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 1500,
      temperature: 0.8
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ result: completion.choices[0].message.content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
