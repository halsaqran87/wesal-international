import { NextRequest, NextResponse } from 'next/server'
import { askClinicalAI, generatePreSessionBrief, formatSessionNote, detectRiskPatterns } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, question, clientContext, rawNote, sessionNum, riskData } = body

    let result: string | object

    switch (action) {
      case 'ask':
        result = await askClinicalAI(question, clientContext)
        break
      case 'brief':
        result = await generatePreSessionBrief(clientContext)
        break
      case 'format_note':
        result = await formatSessionNote(rawNote, sessionNum)
        break
      case 'risk':
        result = await detectRiskPatterns(riskData)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
