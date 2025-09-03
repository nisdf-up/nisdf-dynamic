'use client'
import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import { useT } from '../lib/i18n'
export default function NavBar(){
  const { t } = useT()
  const L=(h,l)=><Link className="px-3 py-2 hover:text-blue-600" href={h}>{l}</Link>
  return (<nav className="border-b"><div className="container flex items-center justify-between h-14"><Link href="/" className="font-bold">NISDF</Link><div className="text-sm">{L('/about',t('about'))}{L('/programs',t('programs'))}{L('/events',t('events'))}{L('/gallery',t('gallery'))}{L('/donate',t('donate'))}{L('/membership',t('membership'))}{L('/member','Member')}{L('/admin',t('admin'))}{L('/contact',t('contact'))}</div><LanguageSwitcher/></div></nav>)
}
