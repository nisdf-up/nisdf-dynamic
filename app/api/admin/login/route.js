import { NextResponse } from 'next/server'
import { setAdminCookie } from '../../../../lib/adminAuth'
export async function POST(req){ const { password } = await req.json(); if(!password || password!==process.env.ADMIN_SECRET) return NextResponse.json({error:'Invalid password'},{status:401}); setAdminCookie(password); return NextResponse.json({ok:true}) }
