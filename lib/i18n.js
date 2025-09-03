'use client'
import { createContext, useContext, useEffect, useState } from 'react'
const dict = {
  en:{ home:'Home', highlights:'Highlights', about:'About Us', programs:'Programs & Training', events:'Events & News', gallery:'Media Gallery', donate:'Donate', membership:'Membership', admin:'Admin', contact:'Contact', donateTitle:'Donate to NISDF', donatePay:'Pay via UPI App', membershipTitle:'Membership Application', payMembership:'Pay via UPI App', submitApplication:'Submit Application', amount:'Amount', adminLogin:'Admin Login', readMore:'Read more', vision:'Vision: Empower girls with self-defense skills.', mission:'Mission: Train schools & communities across North India.' },
  hi:{ home:'होम', highlights:'मुख्य आकर्षण', about:'हमारे बारे में', programs:'प्रोग्राम्स व ट्रेनिंग', events:'इवेंट्स व न्यूज़', gallery:'मीडिया गैलरी', donate:'डोनेशन', membership:'सदस्यता', admin:'एडमिन', contact:'संपर्क', donateTitle:'NISDF को डोनेट करें', donatePay:'UPI ऐप से पेमेंट करें', membershipTitle:'सदस्यता आवेदन', payMembership:'UPI ऐप से फीस दें', submitApplication:'आवेदन जमा करें', amount:'राशि', adminLogin:'एडमिन लॉगिन', readMore:'और पढ़ें', vision:'विज़न: लड़कियों को आत्मरक्षा से सशक्त बनाना।', mission:'मिशन: नॉर्थ इंडिया के स्कूल/समुदायों में प्रशिक्षण।' }
}
const C = createContext({ lang:'en', setLang:()=>{}, t:(k)=>k })
export function LanguageProvider({ children }){
  const [lang,setLang]=useState('en')
  useEffect(()=>{ const saved = typeof document!=='undefined' ? (document.cookie.match(/lang=(\w+)/)?.[1] || localStorage.getItem('lang')) : null; if(saved) setLang(saved) },[])
  useEffect(()=>{ if(typeof document!=='undefined'){ document.cookie=`lang=${lang}; path=/; max-age=31536000`; localStorage.setItem('lang',lang) } },[lang])
  const t=(k)=> (dict[lang] && dict[lang][k]) || dict.en[k] || k
  return <C.Provider value={{ lang, setLang, t }}>{children}</C.Provider>
}
export function useT(){ return useContext(C) }
