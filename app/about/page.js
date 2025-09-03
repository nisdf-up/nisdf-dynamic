'use client'
import Section from '../../components/Section'; import { useT } from '../../lib/i18n'
export default function About(){ const { t, lang } = useT(); return (<main><Section i18n='about'><p className="mb-2">{t('vision')}</p><p>{t('mission')}</p></Section></main>) }
