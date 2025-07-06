import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="w-full mt-auto py-6 border-t border-slate-200 bg-white/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-slate-600">
          <div className="flex gap-4">
            <Link 
              to="/cgu" 
              className="hover:text-slate-800 transition-colors underline"
            >
              {t('legal.cgu.title')}
            </Link>
            <Link 
              to="/cgv" 
              className="hover:text-slate-800 transition-colors underline"
            >
              {t('legal.cgv.title')}
            </Link>
          </div>
          <div className="text-slate-500">
            © 2025 µTodo
          </div>
        </div>
      </div>
    </footer>
  )
}