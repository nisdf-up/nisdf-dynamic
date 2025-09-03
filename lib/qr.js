import QRCode from 'qrcode'
export async function qrFromString(str){ return await QRCode.toBuffer(str) }
export async function qrForUPI(vpa, name, amount, note){ const upi=`upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note||'NISDF Payment')}`; return await qrFromString(upi) }
