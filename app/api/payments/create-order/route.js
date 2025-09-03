import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
export async function POST(req){
  const body = await req.json()
  const amount = Math.max(1, parseInt(body.amount||0))
  const purpose = body.purpose || 'donation'
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  const notes = { purpose }
  if(body.meta){ for(const k of Object.keys(body.meta)) notes[k]=String(body.meta[k]) }
  if(key_id && key_secret){
    const rzp = new Razorpay({ key_id, key_secret })
    const order = await rzp.orders.create({ amount: amount*100, currency:'INR', notes })
    return NextResponse.json({ provider:'razorpay', order_id: order.id, amount_paise: order.amount, key_id })
  } else {
    return NextResponse.json({ provider:'upi' })
  }
}
