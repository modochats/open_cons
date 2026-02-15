'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type Messages = {
  [key: string]: string | Messages
}

type Locale = 'fa' | 'en'

const translations: Record<Locale, Messages> = {
  fa: {
    common: {
      loading: 'در حال بارگذاری...',
      error: 'خطا',
      success: 'موفق',
      cancel: 'لغو',
      submit: 'ثبت',
      save: 'ذخیره',
      delete: 'حذف',
      edit: 'ویرایش',
      close: 'بستن'
    },
    auth: {
      login: 'ورود',
      register: 'ثبت نام',
      logout: 'خروج',
      email: 'ایمیل',
      password: 'رمز عبور',
      confirmPassword: 'تکرار رمز عبور',
      username: 'نام کاربری',
      welcome: 'خوش آمدید',
      welcomeBack: 'خوش بازگشت',
      loginDescription: 'برای ادامه وارد حساب کاربری خود شوید',
      registerDescription: 'حساب کاربری جدید ایجاد کنید',
      loginButton: 'ورود به حساب',
      registerButton: 'ایجاد حساب',
      loggingIn: 'در حال ورود...',
      registering: 'در حال ثبت نام...',
      noAccount: 'حساب کاربری ندارید؟',
      hasAccount: 'قبلاً ثبت نام کرده‌اید؟',
      signUp: 'ثبت نام',
      signIn: 'ورود',
      passwordsDoNotMatch: 'رمزهای عبور مطابقت ندارند',
      passwordTooShort: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
      emailRequired: 'ایمیل الزامی است',
      usernameRequired: 'نام کاربری الزامی است'
    },
    navigation: {
      home: 'خانه',
      questions: 'پرسش‌ها',
      dashboard: 'داشبورد',
      agents: 'عامل‌ها',
      profile: 'پروفایل'
    },
    language: {
      switch: 'تغییر زبان',
      persian: 'فارسی',
      english: 'English'
    },
    home: {
      title: 'مشاور هوشمند باز',
      subtitle: 'دستیار مشاوره هوشمند شما',
      description: 'پلتفرم پرسش و پاسخ با قدرت هوش مصنوعی که در آن عامل‌های هوشمند به سوالات شما پاسخ می‌دهند',
      getStarted: 'شروع کنید',
      launchApp: 'اجرای برنامه',
      features: {
        fast: {
          title: 'سریع',
          desc: 'بهینه شده برای سرعت و عملکرد'
        },
        modern: {
          title: 'مدرن',
          desc: 'ساخته شده با آخرین فناوری‌ها'
        },
        beautiful: {
          title: 'زیبا',
          desc: 'زیبایی تیره نئونی خیره‌کننده'
        }
      }
    },
    questions: {
      title: 'پرسش‌ها',
      askQuestion: 'پرسش جدید',
      yourQuestion: 'پرسش شما',
      questionTitle: 'عنوان پرسش',
      questionDetails: 'جزئیات پرسش',
      submit: 'ارسال پرسش',
      noQuestions: 'هنوز پرسشی وجود ندارد',
      answers: 'پاسخ‌ها',
      noAnswers: 'هنوز پاسخی وجود ندارد',
      askedBy: 'پرسیده شده توسط',
      answeredBy: 'پاسخ داده شده توسط',
      sortBy: 'مرتب‌سازی بر اساس',
      latest: 'جدیدترین',
      oldest: 'قدیمی‌ترین',
      mostAnswers: 'بیشترین پاسخ'
    },
    dashboard: {
      title: 'داشبورد',
      myAgents: 'عامل‌های من',
      createAgent: 'ایجاد عامل جدید',
      noAgents: 'هنوز عامل‌های وجود ندارد',
      agentBuilder: 'سازنده عامل',
      flowBuilder: 'سازنده جریان',
      saveFlow: 'ذخیره جریان',
      nodes: {
        trigger: 'محرک',
        agent: 'عامل',
        response: 'پاسخ'
      }
    },
    agent: {
      name: 'نام عامل',
      description: 'توضیحات',
      status: 'وضعیت',
      active: 'فعال',
      inactive: 'غیرفعال',
      created: 'ایجاد شده',
      updated: 'به‌روزرسانی شده'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      submit: 'Submit',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      welcome: 'Welcome',
      welcomeBack: 'Welcome Back',
      loginDescription: 'Sign in to continue to your account',
      registerDescription: 'Create a new account',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      loggingIn: 'Signing in...',
      registering: 'Registering...',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      emailRequired: 'Email is required',
      usernameRequired: 'Username is required'
    },
    navigation: {
      home: 'Home',
      questions: 'Questions',
      dashboard: 'Dashboard',
      agents: 'Agents',
      profile: 'Profile'
    },
    language: {
      switch: 'Change Language',
      persian: 'فارسی',
      english: 'English'
    },
    home: {
      title: 'Open Consultant',
      subtitle: 'Your AI-powered consulting assistant',
      description: 'Q&A platform powered by AI where intelligent agents answer your questions',
      getStarted: 'Get Started',
      launchApp: 'Launch App',
      features: {
        fast: {
          title: 'Fast',
          desc: 'Optimized for speed and performance'
        },
        modern: {
          title: 'Modern',
          desc: 'Built with the latest technologies'
        },
        beautiful: {
          title: 'Beautiful',
          desc: 'Stunning dark neon aesthetics'
        }
      }
    },
    questions: {
      title: 'Questions',
      askQuestion: 'Ask Question',
      yourQuestion: 'Your Question',
      questionTitle: 'Question Title',
      questionDetails: 'Question Details',
      submit: 'Submit Question',
      noQuestions: 'No questions yet',
      answers: 'Answers',
      noAnswers: 'No answers yet',
      askedBy: 'Asked by',
      answeredBy: 'Answered by',
      sortBy: 'Sort by',
      latest: 'Latest',
      oldest: 'Oldest',
      mostAnswers: 'Most Answers'
    },
    dashboard: {
      title: 'Dashboard',
      myAgents: 'My Agents',
      createAgent: 'Create New Agent',
      noAgents: 'No agents yet',
      agentBuilder: 'Agent Builder',
      flowBuilder: 'Flow Builder',
      saveFlow: 'Save Flow',
      nodes: {
        trigger: 'Trigger',
        agent: 'Agent',
        response: 'Response'
      }
    },
    agent: {
      name: 'Agent Name',
      description: 'Description',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      created: 'Created',
      updated: 'Updated'
    }
  }
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dir: 'rtl' | 'ltr'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children, initialLocale = 'fa' }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadUserPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', session.user.id)
          .single()

        if (data?.language) {
          setLocale(data.language as Locale)
        }
      } else {
        const saved = localStorage.getItem('locale') as Locale
        if (saved && (saved === 'fa' || saved === 'en')) {
          setLocale(saved)
        }
      }
    }

    loadUserPreferences()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', session.user.id)
          .single()

        if (data?.language) {
          setLocale(data.language as Locale)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSetLocale = async (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)

    if (user) {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        await supabase
          .from('user_preferences')
          .update({ language: newLocale })
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, language: newLocale })
      }
    }
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: Messages | string = translations[locale]

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k] as Messages | string
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t, dir: locale === 'fa' ? 'rtl' : 'ltr' }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
