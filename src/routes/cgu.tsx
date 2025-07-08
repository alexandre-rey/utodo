import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText } from 'lucide-react'

function CGU() {
  const { t } = useTranslation()

  const handleGoBack = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('actions.back')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              {t('legal.cgu.title')}
            </CardTitle>
            <p className="text-gray-600">
              {t('legal.cgu.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section1.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section1.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section2.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section2.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section3.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section3.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section4.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section4.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section5.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section5.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section6.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section6.content')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.cgu.section7.title')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('legal.cgu.section7.content')}
                </p>
              </section>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <p className="text-sm text-blue-800">
                  <strong>{t('legal.contact.title')}:</strong> {t('legal.contact.email')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/cgu')({
  component: CGU,
})