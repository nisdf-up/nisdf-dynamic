import { NextResponse } from 'next/server'
import { qrForUPI } from '../../../lib/qr'
export async function GET(req){ const { searchParams } = new URL(req.url); const vpa=process.env.NEXT_PUBLIC_UPI_VPA; const name=process.env.NEXT_PUBLIC_UPI_PNAME||'NISDF'; const am=searchParams.get('am')||'0'; const tn=searchParams.get('tn')||'Payment'; const png=await qrForUPI(vpa,name,am,tn); return new NextResponse(png,{headers:{'Content-Type':'image/png'}}) }
