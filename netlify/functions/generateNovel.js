// Netlify Function: generateNovel
const { Configuration, OpenAIApi } = require('openai');

exports.handler = async function(event, context) {
  const { outline, chapters, mode, prompt } = JSON.parse(event.body || '{}');
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not set' })
    };
  }
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  // Simple example: generate a novel premise or chapter
  let userPrompt = prompt || 'Generate a creative novel premise.';
  if (mode === 'outline') userPrompt = 'Generate a detailed outline for a novel.';
  if (mode === 'chapter') userPrompt = 'Write the first chapter of a novel.';

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 1024
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ result: completion.data.choices[0].message.content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
