'use client'
import { useT } from '../lib/i18n'
export default function Hero(){ const { lang } = useT(); return (<div className='bg-blue-50 border-b'><div className='container py-10'><h1 className='text-3xl md:text-4xl font-bold'>{lang==='hi'?'लड़कियों को आत्मरक्षा से सशक्त बनाना':'Empowering Girls with Self‑Defense Skills'}</h1><p className='text-gray-700 mt-2'>{lang==='hi'?'ट्रेनिंग प्रोग्राम्स • इवेंट्स • मीडिया कवरेज':'Training Programs • Events • Media Coverage'}</p></div></div>) }
