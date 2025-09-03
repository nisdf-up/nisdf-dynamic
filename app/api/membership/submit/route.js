import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
export async function POST(req){
  const body = await req.json()
  const admin = supabaseAdmin()
  const { data, error } = await admin.from('memberships').update({
    user_id: body.user_id ?? null, type_id: body.type_id, full_name: body.full_name, father_or_husband: body.father_or_husband, dob: body.dob, gender: body.gender, address: body.address, mobile: body.mobile, whatsapp: body.whatsapp, email: body.email, occupation: body.occupation, education: body.education, motivation: body.motivation, id_proof_type: body.id_proof_type, id_proof_url: body.id_proof_url, txn_mode: body.txn_mode, txn_id: body.txn_id, txn_amount: body.txn_amount
  }).eq('id', body.membership_id).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok:true, membership: data })
}
