'use client'
import { useEffect, useMemo, useState } from 'react'
import Section from '../../components/Section'
export default function MembershipPage(){
  const vpa = process.env.NEXT_PUBLIC_UPI_VPA
  const pname = process.env.NEXT_PUBLIC_UPI_PNAME || 'NISDF'
  const [typeId,setTypeId]=useState('1'); const fees={'1':30,'2':30,'3':30,'4':500}; const amount=useMemo(()=>fees[typeId]||0,[typeId])
  useEffect(()=>{ const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; document.body.appendChild(s) },[])

  async function onSubmit(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const minimal = { full_name: form.get('full_name'), email: form.get('email'), mobile: form.get('mobile'), type_id: typeId }
    // create pending membership first
    const start = await fetch('/api/membership/start',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(minimal) })
    const sdata = await start.json(); if(!start.ok){ alert('Error: '+sdata.error); return }
    const memId = sdata.membership_id
    // create order with membership_id in notes (for auto-approve)
    const orderRes = await fetch('/api/payments/create-order',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ purpose:'membership', amount, meta:{ membership_id: memId } }) })
    const order = await orderRes.json(); if(!orderRes.ok){ alert('Payment error: '+order.error); return }
    if(order.provider==='razorpay'){
      const rz = new window.Razorpay({ key: order.key_id, amount: order.amount_paise, currency:'INR', name:'NISDF Membership', order_id: order.order_id,
        handler: async (rsp)=>{
          // After success, complete full details (optional; auto-approve webhook will run anyway)
          const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
          payload.membership_id = memId; payload.type_id = typeId; payload.txn_mode='razorpay'; payload.txn_id=rsp.razorpay_payment_id; payload.txn_amount=amount
          const res = await fetch('/api/membership/submit',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
          const d = await res.json(); if(!res.ok){ alert('Form error: '+d.error); return }
          alert('Payment done. Application submitted ✔️'); e.currentTarget.reset()
        }
      })
      rz.open()
    } else {
      // UPI fallback
      window.location.href = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(pname)}&am=${encodeURIComponent(amount)}&cu=INR&tn=Membership`
      alert('After paying via UPI, enter Transaction ID and submit the form.')
      // Allow manual submit now with txn_id
      const payload = Object.fromEntries(new FormData(e.currentTarget).entries())
      payload.membership_id = memId; payload.type_id = typeId; payload.txn_mode='upi'; payload.txn_amount=amount
      const res = await fetch('/api/membership/submit',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const d = await res.json(); if(!res.ok){ alert('Form error: '+d.error); return }
    }
  }

  const qrSrc = `/api/upi-qr?am=${amount}&tn=NISDF%20Membership`
  return (<Section title="Membership">
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={onSubmit} className="grid gap-3">
        <input name="full_name" required placeholder="Full Name" className="input" />
        <input name="father_or_husband" placeholder="Father/Husband Name" className="input" />
        <input name="dob" type="date" className="input" />
        <select name="gender" className="input"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
        <input name="address" placeholder="Address" className="input" />
        <input name="mobile" placeholder="Mobile" className="input" />
        <input name="whatsapp" placeholder="WhatsApp" className="input" />
        <input name="email" type="email" placeholder="Email" className="input" />
        <input name="occupation" placeholder="Occupation" className="input" />
        <input name="education" placeholder="Education" className="input" />
        <textarea name="motivation" placeholder="Why do you want to join?" className="input" />
        <select value={typeId} onChange={e=>setTypeId(e.target.value)} className="input">
          <option value="1">General (₹30)</option><option value="2">Student (₹30)</option>
          <option value="3">Volunteer (₹30)</option><option value="4">Lifetime (₹500)</option>
        </select>
        <input name="txn_id" placeholder="UPI Transaction ID (if UPI used)" className="input" />
        <button className="btn">Pay & Submit</button>
      </form>
      <div>
        <p className="mb-2">Amount: ₹{amount}</p>
        <img src={qrSrc} alt="UPI QR" className="border rounded w-64 h-64 object-contain mb-2" />
        <div className="flex gap-2"><a href={`upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(pname)}&am=${encodeURIComponent(amount)}&cu=INR&tn=Membership`} className="bg-green-600 text-white px-4 py-2 rounded">UPI App</a><a href="/assets/upi-qr.jpg" target="_blank" className="px-4 py-2 border rounded">Static QR</a></div>
      </div>
    </div>
  </Section>)
}
