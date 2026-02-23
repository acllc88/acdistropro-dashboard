const OPENROUTER_API_KEY = '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';
const MODEL = 'google/gemini-2.0-flash-001';

export async function getAIRating(title: string, genre: string, type: 'movie' | 'series'): Promise<number> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://acdistropro.app',
        'X-Title': 'ACDistro Pro',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: `Rate this ${type} titled "${title}" in the ${genre} genre on a scale of 1.0 to 10.0. Reply with ONLY a single decimal number like 7.5 or 8.2. No explanation, no text, just the number.`
          }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 1 && num <= 10) return Math.round(num * 10) / 10;
    return 7.5;
  } catch (e) {
    console.error('[AI Rating] Error:', e);
    return 7.0 + Math.round(Math.random() * 15) / 10;
  }
}

export async function getChatbotResponse(
  clientName: string,
  clientCompany: string,
  clientPlan: string,
  channelCount: number,
  movieCount: number,
  seriesCount: number,
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const systemPrompt = `You are ACDistro Pro's helpful support assistant for the OTT (Over-The-Top) content distribution platform. You are talking to ${clientName} from ${clientCompany} (${clientPlan} plan).

Their account has:
- ${channelCount} channel(s)
- ${movieCount} movie(s)
- ${seriesCount} series

You must:
- Always call the client by their first name: "${clientName.split(' ')[0]}"
- Be professional, friendly and knowledgeable about the ACDistro Pro platform
- Use emojis naturally and appropriately
- Give concise, helpful answers
- If asked about features they don't have yet (0 channels, etc.), encourage them to ask their admin
- Keep responses under 200 words

ACDistro Pro features:
- Overview: Stats on revenue, views, subscribers, content
- Analytics: Monthly charts, device distribution (Mobile/Smart TV/Desktop/Tablet), content performance
- Earnings: Revenue breakdown, payment history, channel revenue
- My Content: View channels, movies, series assigned by admin
- Distribution: Add platform channel IDs (Apple TV, Roku, Android TV, Fire TV, Samsung Tizen, LG WebOS, Vizio, iOS, Android, Web Player)
- Notifications: Admin alerts and updates

The admin controls all content — clients cannot add content themselves. Admins add movies/series and assign them to channels. Clients just distribute and view analytics.

To find Roku Channel ID: Home button → Settings → System → About → Serial Number (12-16 characters).
For other platforms: check each platform's developer dashboard.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://acdistropro.app',
        'X-Title': 'ACDistro Pro',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || getDefaultResponse(clientName.split(' ')[0], userMessage);
  } catch (e) {
    console.error('[AI Chatbot] Error:', e);
    return getDefaultResponse(clientName.split(' ')[0], userMessage);
  }
}

function getDefaultResponse(firstName: string, msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('channel')) return `Hey ${firstName}! 📺 Your channels are managed by your admin. Once assigned, they'll appear in the "My Content" section. To add distribution channels (Roku, Apple TV, etc.), go to the Distribution tab! 🚀`;
  if (lower.includes('earn') || lower.includes('revenue') || lower.includes('money')) return `Hi ${firstName}! 💰 Your earnings are in the Earnings tab. You'll see monthly revenue, payment history, and a breakdown per channel. Your admin sets your revenue share percentage.`;
  if (lower.includes('movie') || lower.includes('series') || lower.includes('content')) return `${firstName}, all your content is in the "My Content" tab! 🎬 Your admin adds movies and series to your channels. Once added, they appear here automatically in real-time!`;
  if (lower.includes('analytics') || lower.includes('stats')) return `Hey ${firstName}! 📊 Check out the Analytics tab for views, subscribers, watch time, device distribution, and content performance data — all updated in real-time!`;
  if (lower.includes('roku') || lower.includes('distribution') || lower.includes('platform')) return `${firstName}! 📡 Go to the Distribution tab to add your channel IDs. We support Apple TV, Roku, Android TV, Fire TV, Samsung Tizen, LG WebOS, Vizio, iOS, Android, and Web Player!`;
  if (lower.includes('notification')) return `${firstName}, check the Notifications tab 🔔 for all updates from your admin — new content, system alerts, and more!`;
  return `Hi ${firstName}! 😊 I'm here to help you navigate ACDistro Pro. You can ask me about channels, content, earnings, analytics, distribution, or notifications. What would you like to know? 🚀`;
}
