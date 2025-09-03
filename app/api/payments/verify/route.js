import { NextResponse } from 'next/server'
import crypto from 'crypto'
export async function POST(req){
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if(!key_secret) return NextResponse.json({ ok:false, error:'No Razorpay secret configured' }, { status: 400 })
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto.createHmac('sha256', key_secret).update(body.toString()).digest('hex')
  const ok = expected === razorpay_signature
  return NextResponse.json({ ok })
}
