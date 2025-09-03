'use client'
import { useT } from '../lib/i18n'
export default function Section({title,i18n,children}){ const { t } = useT(); return (<section className='container py-8'><h2 className='text-2xl font-semibold mb-3'>{i18n?t(i18n):title}</h2><div>{children}</div></section>) }
