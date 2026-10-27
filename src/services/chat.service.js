const SYSTEM_PROMPT = [
  'You are the tire assistant of E-Catalog, an online tire price-comparison shop.',
  'Answer only questions about tires and tire-related vehicle fitment: sizes, load and speed indexes,',
  'seasons, EU labels, studded tires, tire care and replacement.',
  'If the user asks about anything else, politely say that you can only help with tires.',
  'Reply in the language the user writes in (Latvian, Russian or English), in at most 5 short sentences.',
  'Never invent prices, stock or specific offers; point the user to the catalog for those.',
].join(' ');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function askTireAssistant(question) {
  const { AI_API_KEY, AI_PROVIDER = 'openai', AI_MODEL = 'gpt-4o-mini' } = process.env;

  if (!AI_API_KEY || AI_PROVIDER !== 'openai') {
    throw httpError(503, 'The tire chat is not connected yet.');
  }

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_completion_tokens: 400,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    console.error('AI request failed:', err.message);
    throw httpError(502, 'The tire assistant is unavailable right now. Please try again later.');
  }

  if (!response.ok) {
    console.error('AI provider answered with status', response.status); // never log the key
    throw httpError(502, 'The tire assistant is unavailable right now. Please try again later.');
  }

  const data = await response.json().catch(() => null);
  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw httpError(502, 'The tire assistant did not return an answer. Please try again.');
  return answer;
}

module.exports = { askTireAssistant };