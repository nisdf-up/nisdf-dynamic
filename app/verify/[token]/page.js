import { supabaseAdmin } from '../../../lib/supabaseAdmin'
export const dynamic='force-dynamic'
export default async function Page({ params }){ const admin=supabaseAdmin(); const { data }=await admin.from('qr_tokens').select('*').eq('token', params.token).maybeSingle(); if(!data) return <div className="container py-8">Invalid or expired QR.</div>; return (<div className="container py-8"><h1 className="text-2xl font-semibold mb-2">Verified ✅</h1><p>Type: {data.entity_type}</p><p>Reference: {data.entity_id}</p><p>Issued: {new Date(data.created_at).toLocaleString()}</p></div>) }
