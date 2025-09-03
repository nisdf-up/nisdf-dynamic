import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
export async function GET(req){
  const { searchParams } = new URL(req.url); const membership_id = searchParams.get('membership_id')
  const cookieStore = cookies()
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { get: (k)=>cookieStore.get(k)?.value } })
  const { data: { user } } = await supa.auth.getUser()
  if(!user) return NextResponse.json({ error:'Not logged in' }, { status: 401 })
  const admin = supabaseAdmin()
  const { data: m } = await admin.from('memberships').select('id,user_id,status').eq('id', membership_id).maybeSingle()
  if(!m || m.user_id !== user.id) return NextResponse.json({ error:'Forbidden' }, { status: 403 })
  if(m.status !== 'approved') return NextResponse.json({})
  const { data: id } = await admin.from('id_cards').select('pdf_url').eq('membership_id', membership_id).order('issued_at',{ascending:false}).limit(1).maybeSingle()
  const { data: cert } = await admin.from('certificates').select('pdf_url').eq('membership_id', membership_id).order('issued_at',{ascending:false}).limit(1).maybeSingle()
  let idcard_url=null, cert_url=null
  if(id?.pdf_url){ const s = await admin.storage.from('idcards').createSignedUrl(id.pdf_url, 60*60); idcard_url = s.data?.signedUrl || null }
  if(cert?.pdf_url){ const s = await admin.storage.from('certificates').createSignedUrl(cert.pdf_url, 60*60); cert_url = s.data?.signedUrl || null }
  return NextResponse.json({ idcard_url, cert_url })
}
