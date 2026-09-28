const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service for generating follow-up emails.
 * Reads API key from process.env.AI_API_KEY.
 * Returns { subject: string, body: string }
 */
const generateFollowUpEmail = async ({
  contactName,
  company,
  notes,
  dealTitle,
  dealStage,
  dealValue,
}) => {
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_or_openai_api_key_here') {
    throw new Error('AI API key is not configured. Please add AI_API_KEY in server/.env');
  }

  const prompt = `You are a professional CRM assistant.
Write a personalized, concise, and professional follow-up email draft based on these details:
- Contact Name: ${contactName || 'Valued Client'}
- Company: ${company || 'N/A'}
- Notes: ${notes || 'N/A'}
- Deal Title: ${dealTitle || 'Business Opportunity'}
- Deal Stage: ${dealStage || 'New'}
- Deal Value: $${dealValue !== undefined ? dealValue : 'N/A'}

Rules:
1. Do not include placeholders like "[Your Name]". Sign off simply as "The Sales Team" or a friendly professional closing.
2. Return ONLY a valid JSON object with exactly two keys: "subject" and "body".
3. Do not include markdown code block ticks, preambles, or explanations.
Example format:
{"subject": "Following up on our discussion", "body": "Hi John,\\n\\nI wanted to follow up regarding our recent conversation..."}`;

  // If the key starts with 'sk-', assume OpenAI compatible endpoint
  if (apiKey.startsWith('sk-')) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName.startsWith('gemini') ? 'gpt-4o-mini' : modelName,
        messages: [
          {
            role: 'system',
            content: 'You generate CRM follow-up emails in JSON format with "subject" and "body".',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `AI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return parseEmailResponse(content, contactName);
  }

  // Otherwise, default to Google Gemini
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseEmailResponse(responseText, contactName);
  } catch (error) {
    throw new Error(`AI generation error: ${error.message}`);
  }
};

/**
 * Safely parse AI response to { subject, body }
 */
function parseEmailResponse(text, contactName) {
  try {
    // Strip markdown code fences if present (```json ... ```)
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.subject && parsed.body) {
      return {
        subject: parsed.subject.trim(),
        body: parsed.body.trim(),
      };
    }
  } catch (e) {
    // Fallback: extract subject and body via regex or line splits
  }

  // Regex fallback
  const subjectMatch = text.match(/Subject:\s*(.*)/i);
  const bodyMatch = text.match(/Body:\s*([\s\S]*)/i);

  const subject = subjectMatch ? subjectMatch[1].trim() : `Following up with ${contactName || 'you'}`;
  const body = bodyMatch ? bodyMatch[1].trim() : text.trim();

  return { subject, body };
}

module.exports = { generateFollowUpEmail };
