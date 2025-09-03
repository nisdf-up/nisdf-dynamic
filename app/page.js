'use client'
import Hero from '../components/Hero'; import Section from '../components/Section'; import Link from 'next/link'; import { useT } from '../lib/i18n'
function Card({title,href}){ return (<Link href={href} className="block border rounded-lg p-4 hover:shadow"><div className="font-medium">{title}</div><div className="text-sm text-gray-600 mt-1">Explore more</div></Link>) }
export default function Home(){ const { t } = useT(); return (<main><Hero /><Section i18n='highlights'><div className="grid md:grid-cols-3 gap-4"><Card title={t('programs')} href="/programs" /><Card title={t('events')} href="/events" /><Card title={t('donate')} href="/donate" /></div></Section></main>) }
