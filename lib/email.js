import nodemailer from 'nodemailer'
export function getTransport(){
  const host = process.env.SMTP_HOST
  if(!host) return null
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT||'587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })
}
