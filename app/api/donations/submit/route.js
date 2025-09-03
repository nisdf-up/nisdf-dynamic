import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { renderPDF, donationReceiptHTML } from '../../../../lib/pdf'
import { getTransport } from '../../../../lib/email'
export async function POST(req){
  const body = await req.json()
  const admin = supabaseAdmin()
  const { data, error } = await admin.from('donations').insert({ donor_name: body.donor_name, email: body.email, phone: body.phone, amount: body.amount, purpose: body.purpose, txn_id: body.txn_id }).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status: 400 })
  // Create receipt PDF & upload
  const pdf = await renderPDF(donationReceiptHTML({ ...data }))
  const path = `receipt_${data.id}.pdf`
  await admin.storage.from('documents').upload(path, pdf, { contentType:'application/pdf', upsert:true })
  // Email (optional)
  const tr = getTransport()
  if(tr && data.email){
    try{ await tr.sendMail({ to: data.email, from: process.env.SMTP_FROM || 'NISDF <no-reply@local>', subject: 'Donation Receipt', text: 'Thank you for your donation.', attachments:[{ filename:'receipt.pdf', content: pdf }] }) }catch(e){ /* ignore mail errors */ }
  }
  return NextResponse.json({ ok:true, donation:data })
}
