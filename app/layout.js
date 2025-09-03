import './globals.css'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { LanguageProvider } from '../lib/i18n'
export const metadata = { title: 'NISDF — North India Self Defense Federation', description: 'Official NGO website.' }
export default function RootLayout({ children }){ return (<html lang='en'><body><LanguageProvider><NavBar />{children}<Footer /></LanguageProvider></body></html>) }
