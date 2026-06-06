import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── System prompt for the clinical AI ────────────────────
const SYSTEM_PROMPT = `You are a clinical AI assistant for Wesal International, a licensed online counseling and behavioral rehabilitation center in Kuwait. You assist the specialist consultant Khalaf Jalal Alenizi.

Your role:
- Analyze client profiles, session notes, surveys, and journal entries
- Provide evidence-based clinical insights and suggestions
- Flag risk patterns that may need urgent attention
- Suggest therapy techniques (CBT, DBT, motivational interviewing, etc.)
- Help structure session notes in clinical format
- Recommend exercises and resources tailored to each case
- Generate pre-session briefs

Important rules:
- You are a tool for the licensed consultant, NOT a replacement
- Never diagnose — only suggest for the consultant's consideration
- Always prioritize client safety above everything
- Maintain strict confidentiality in all outputs
- Respond in the same language as the question (Arabic or English)
- Be concise, clinical, and actionable`

interface ClientContext {
  name: string
  serviceType: string
  sessions: number
  stressScore?: number
  progressScores?: Record<string, number>
  recentNote?: string
  surveyAnswers?: Record<string, unknown>
  journalEntries?: string[]
}

// ── Pre-session brief ─────────────────────────────────────
export async function generatePreSessionBrief(context: ClientContext): Promise<string> {
  const prompt = `Generate a concise pre-session clinical brief for this client:

Name: ${context.name}
Service: ${context.serviceType}
Total sessions: ${context.sessions}
Current stress score: ${context.stressScore || 'N/A'}/10
Progress: ${JSON.stringify(context.progressScores || {})}
Last session note: ${context.recentNote || 'None'}
Survey answers: ${JSON.stringify(context.surveyAnswers || {})}
Recent journal entries: ${(context.journalEntries || []).slice(0,3).join(' | ')}

Provide:
1. Key focus for this session (1-2 sentences)
2. 3 suggested opening questions
3. Any risk indicators to watch for
4. Recommended technique for today

Be brief and clinical.`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return (msg.content[0] as { text: string }).text
}

// ── Risk detection ────────────────────────────────────────
export async function detectRiskPatterns(data: {
  journalEntries: string[]
  stressScores: number[]
  surveyAnswers: Record<string, unknown>
}): Promise<{ isRisk: boolean; level: 'low' | 'medium' | 'high'; reason: string }> {
  const prompt = `Analyze the following client data for risk patterns. Respond ONLY with valid JSON:
{"isRisk": boolean, "level": "low|medium|high", "reason": "brief explanation"}

Journal entries: ${data.journalEntries.slice(0,5).join(' | ')}
Stress score trend: ${data.stressScores.join(', ')}
Survey answers: ${JSON.stringify(data.surveyAnswers)}`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    return JSON.parse((msg.content[0] as { text: string }).text)
  } catch {
    return { isRisk: false, level: 'low', reason: 'Analysis unavailable' }
  }
}

// ── Format session note ───────────────────────────────────
export async function formatSessionNote(rawNote: string, sessionNum: number): Promise<string> {
  const prompt = `Format the following raw session note into a structured clinical note for session #${sessionNum}:

Raw note: "${rawNote}"

Output format:
🗓️ Session #${sessionNum}
📌 Mood:
✅ Progress observed:
🎯 Focus area:
📚 Interventions used:
📝 Homework assigned:
➡️ Next session plan:`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return (msg.content[0] as { text: string }).text
}

// ── General Q&A for consultant ────────────────────────────
export async function askClinicalAI(question: string, clientContext?: ClientContext): Promise<string> {
  const contextStr = clientContext
    ? `\nClient context: ${JSON.stringify(clientContext)}`
    : ''

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: question + contextStr }],
  })

  return (msg.content[0] as { text: string }).text
}
