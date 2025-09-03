'use client'
import { useT } from '../lib/i18n'
export default function LanguageSwitcher(){ const { lang,setLang } = useT(); return (<div className="text-xs flex items-center gap-2"><button onClick={()=>setLang('en')} className={'px-2 py-1 rounded '+(lang==='en'?'bg-blue-600 text-white':'border')}>EN</button><button onClick={()=>setLang('hi')} className={'px-2 py-1 rounded '+(lang==='hi'?'bg-blue-600 text-white':'border')}>हिं</button></div>) }
