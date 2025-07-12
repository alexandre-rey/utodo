import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { SEOService, type SEOData } from '../services/seo.service';

/**
 * Custom hook for managing SEO meta tags
 */
export function useSEO(customSEO?: Partial<SEOData>) {
  const router = useRouter();
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentPath = router.state.location.pathname;
    const currentLanguage = i18n.language;

    // Get default SEO data for current page
    const defaultSEO = SEOService.getPageSEO(currentPath, currentLanguage);

    // Merge with custom SEO data
    const finalSEO = { ...defaultSEO, ...customSEO };

    // Update meta tags
    SEOService.updateMeta(finalSEO);

    // Setup hreflang tags
    SEOService.setupHreflang(currentPath);

    // Update structured data for home page
    if (currentPath === '/') {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "µTodo",
        "alternateName": "µTodo - Simple Todo List Manager",
        "description": finalSEO.description,
        "url": finalSEO.url,
        "applicationCategory": "Productivity",
        "operatingSystem": "Web Browser",
        "browserRequirements": "HTML5, CSS3, JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "µTodo"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150"
        },
        "featureList": [
          "Kanban Board View",
          "Calendar Integration",
          "Cross-device Synchronization",
          "Secure Local Storage",
          "Multi-language Support",
          "Dark Mode",
          "Offline Functionality",
          "Cloud Backup"
        ]
      };

      SEOService.updateStructuredData(structuredData);
    }
  }, [router.state.location.pathname, i18n.language, customSEO]);

  return {
    updateSEO: (seoData: Partial<SEOData>) => SEOService.updateMeta(seoData),
    updateStructuredData: (data: any) => SEOService.updateStructuredData(data)
  };
}
