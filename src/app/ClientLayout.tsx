'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { I18nProvider, useI18n } from '@/contexts/I18nContext'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { locale, dir } = useI18n()

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = dir
    
    if (locale === 'fa') {
      html.classList.add('font-vazir')
      html.classList.remove('font-sans')
    } else {
      html.classList.add('font-sans')
      html.classList.remove('font-vazir')
    }
  }, [locale, dir])

  return <>{children}</>
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <LayoutContent>{children}</LayoutContent>
      </I18nProvider>
    </AuthProvider>
  )
}
