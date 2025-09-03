import { NextResponse } from 'next/server'
import { qrFromString } from '../../../lib/qr'
export async function GET(req){ const { searchParams } = new URL(req.url); const token=searchParams.get('token'); if(!token) return NextResponse.json({error:'Missing token'},{status:400}); const site=process.env.NEXT_PUBLIC_SITE_URL||''; const url=`${site}/verify/${token}`; const png=await qrFromString(url); return new NextResponse(png,{headers:{'Content-Type':'image/png'}}) }
