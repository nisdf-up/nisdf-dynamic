import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'
import { renderPDF, idCardHTML, certificateHTML } from '../../../../../lib/pdf'
import { requireAdmin } from '../../../../../lib/adminAuth'
export const runtime='nodejs'
export async function POST(req){
  try{ requireAdmin() }catch{ return NextResponse.json({error:'Unauthorized'},{status:401}) }
  const { membership_id } = await req.json()
  const admin = supabaseAdmin()
  const { data: m, error: e1 } = await admin.from('memberships').update({ status:'approved', reviewed_at: new Date().toISOString() }).eq('id', membership_id).select().single()
  if(e1) return NextResponse.json({ error: e1.message }, { status: 400 })
  const token = crypto.randomBytes(8).toString('hex').toUpperCase()
  const { error: eTok } = await admin.from('qr_tokens').insert({ entity_type:'member', entity_id: membership_id, token })
  if(eTok) return NextResponse.json({ error: eTok.message }, { status: 400 })
  const idBuf = await renderPDF(idCardHTML({ ...m, qr_token: token }))
  const certBuf = await renderPDF(certificateHTML({ ...m, qr_token: token }))
  const idPath = `id_${membership_id}.pdf`, certPath = `cert_${membership_id}.pdf`
  const up1 = await admin.storage.from('idcards').upload(idPath, idBuf, { contentType:'application/pdf', upsert:true })
  const up2 = await admin.storage.from('certificates').upload(certPath, certBuf, { contentType:'application/pdf', upsert:true })
  if(up1.error || up2.error) return NextResponse.json({ error: (up1.error||up2.error).message }, { status: 400 })
  await admin.from('id_cards').insert({ membership_id, pdf_url: idPath })
  await admin.from('certificates').insert({ membership_id, pdf_url: certPath })
  return NextResponse.json({ ok:true, token })
}
