import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ role: 'client' })

    // Use service role to bypass RLS
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data } = await sb
      .from('profiles')
      .select('role, preferred_name, language')
      .eq('id', userId)
      .single()

    return NextResponse.json({ 
      role: data?.role || 'client',
      name: data?.preferred_name || '',
      language: data?.language || 'ar'
    })
  } catch {
    return NextResponse.json({ role: 'client' })
  }
}
