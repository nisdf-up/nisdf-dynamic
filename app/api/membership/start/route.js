import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'
export async function POST(req){
  const body = await req.json()
  const admin = supabaseAdmin()
  const { data, error } = await admin.from('memberships').insert({ full_name: body.full_name, type_id: body.type_id, email: body.email, mobile: body.mobile, status: 'pending' }).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok:true, membership_id: data.id })
}
