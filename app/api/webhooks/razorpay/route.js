import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
import { renderPDF, idCardHTML, certificateHTML } from '../../../../lib/pdf'

export const runtime='nodejs'

export async function POST(req){
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  const sig = req.headers.get('x-razorpay-signature')
  const raw = await req.text()
  if(!secret || !sig) return NextResponse.json({ error:'Missing secret/signature' }, { status: 401 })
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  if(expected !== sig) return NextResponse.json({ error:'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(raw)
  const admin = supabaseAdmin()

  if(payload.event === 'payment.captured'){
    const p = payload.payload.payment.entity
    // log
    await admin.from('payments').insert({ provider:'razorpay', order_id:p.order_id, payment_id:p.id, amount:p.amount/100, currency:p.currency, status:p.status, email:p.email, contact:p.contact, meta:p.notes||{} })
    // auto-approve membership if membership_id present in order notes
    const membership_id = p.notes?.membership_id
    if(membership_id){
      const { data: m, error: e1 } = await admin.from('memberships').update({ status:'approved', txn_mode:'razorpay', txn_id:p.id, txn_amount: p.amount/100, txn_at: new Date().toISOString(), reviewed_at: new Date().toISOString() }).eq('id', membership_id).select().single()
      if(!e1){
        // create QR + PDFs
        const cryptoNode = await import('crypto'); const token = cryptoNode.randomBytes(8).toString('hex').toUpperCase()
        await admin.from('qr_tokens').insert({ entity_type:'member', entity_id: membership_id, token })
        const idBuf = await renderPDF(idCardHTML({ ...m, qr_token: token }))
        const certBuf = await renderPDF(certificateHTML({ ...m, qr_token: token }))
        const idPath=`id_${membership_id}.pdf`, certPath=`cert_${membership_id}.pdf`
        await admin.storage.from('idcards').upload(idPath, idBuf, { contentType:'application/pdf', upsert:true })
        await admin.storage.from('certificates').upload(certPath, certBuf, { contentType:'application/pdf', upsert:true })
        await admin.from('id_cards').insert({ membership_id, pdf_url: idPath })
        await admin.from('certificates').insert({ membership_id, pdf_url: certPath })
      }
    }
  }
  return NextResponse.json({ ok:true })
}
