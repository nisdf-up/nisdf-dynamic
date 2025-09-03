import crypto from 'crypto'; import { cookies } from 'next/headers'
const cookieName='admintoken'
export function tokenFromSecret(s){ return crypto.createHash('sha256').update(s).digest('hex') }
export function setAdminCookie(s){ cookies().set(cookieName, tokenFromSecret(s), { httpOnly:true, sameSite:'lax', secure:true, path:'/' }) }
export function clearAdminCookie(){ cookies().set(cookieName, '', { httpOnly:true, sameSite:'lax', secure:true, path:'/', maxAge:0 }) }
export function requireAdmin(){ const ck=cookies().get(cookieName)?.value; const exp=tokenFromSecret(process.env.ADMIN_SECRET||''); if(!ck||ck!==exp) throw new Error('Unauthorized') }
