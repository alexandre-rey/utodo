/**
 * SEO Service for managing meta tags and structured data
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
}

export class SEOService {
  private static readonly DEFAULT_TITLE = 'µTodo - Simple Todo List Manager | Organize Tasks Efficiently';
  private static readonly DEFAULT_DESCRIPTION = 'µTodo is a simple, secure, and efficient todo list manager. Organize your tasks with ease using our intuitive kanban board, calendar view, and cross-device synchronization.';
  private static readonly SITE_URL = 'https://utodo.io';

  /**
   * Update page meta tags
   */
  static updateMeta(seoData: Partial<SEOData>): void {
    const title = seoData.title || this.DEFAULT_TITLE;
    const description = seoData.description || this.DEFAULT_DESCRIPTION;
    const url = seoData.url || this.SITE_URL;
    const image = seoData.image || `${this.SITE_URL}/og-image.png`;

    // Update title
    document.title = title;

    // Update or create meta tags
    this.updateMetaTag('description', description);
    this.updateMetaTag('keywords', seoData.keywords || '');
    
    // Open Graph tags
    this.updateMetaProperty('og:title', title);
    this.updateMetaProperty('og:description', description);
    this.updateMetaProperty('og:url', url);
    this.updateMetaProperty('og:image', image);
    this.updateMetaProperty('og:type', seoData.type || 'website');

    // Twitter tags
    this.updateMetaName('twitter:title', title);
    this.updateMetaName('twitter:description', description);
    this.updateMetaName('twitter:image', image);
    this.updateMetaName('twitter:url', url);

    // Canonical URL
    this.updateCanonical(seoData.canonical || url);
  }

  /**
   * Update meta tag by name
   */
  private static updateMetaTag(name: string, content: string): void {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Update meta property (for Open Graph)
   */
  private static updateMetaProperty(property: string, content: string): void {
    if (!content) return;
    
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Update meta name (for Twitter)
   */
  private static updateMetaName(name: string, content: string): void {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  /**
   * Update canonical URL
   */
  private static updateCanonical(url: string): void {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  /**
   * Generate structured data for current page
   * Note: Due to CSP restrictions, structured data is now handled statically in index.html
   * This method logs the data for debugging purposes
   */
  static updateStructuredData(data: any): void {
    // Log structured data for debugging (since dynamic injection is restricted by CSP)
    console.log('SEO Structured Data (static version in index.html):', JSON.stringify(data, null, 2));
    
    // For production, structured data should be pre-rendered or handled server-side
    // The base structured data is now included directly in index.html
    
    // Optional: Store in meta tag for potential server-side rendering
    try {
      const metaTag = document.querySelector('meta[name="structured-data"]') || document.createElement('meta');
      metaTag.setAttribute('name', 'structured-data');
      metaTag.setAttribute('content', JSON.stringify(data));
      
      if (!document.querySelector('meta[name="structured-data"]')) {
        document.head.appendChild(metaTag);
      }
    } catch (error) {
      console.warn('Could not store structured data in meta tag:', error);
    }
  }

  /**
   * Get SEO data for different page types
   */
  static getPageSEO(route: string, language = 'en'): SEOData {
    const baseUrl = this.SITE_URL;
    const langSuffix = language === 'fr' ? '/fr' : '';

    switch (route) {
      case '/':
        return {
          title: language === 'fr' 
            ? 'µTodo - Gestionnaire de Tâches Simple | Organisez Efficacement'
            : 'µTodo - Simple Todo List Manager | Organize Tasks Efficiently',
          description: language === 'fr'
            ? 'µTodo est un gestionnaire de tâches simple, sécurisé et efficace. Organisez vos tâches facilement avec notre tableau kanban intuitif, vue calendrier et synchronisation multi-appareils.'
            : 'µTodo is a simple, secure, and efficient todo list manager. Organize your tasks with ease using our intuitive kanban board, calendar view, and cross-device synchronization.',
          keywords: language === 'fr'
            ? 'liste de tâches, gestionnaire de tâches, application de productivité, tableau kanban, vue calendrier, organisation des tâches, app todo, gestionnaire de tâches gratuit'
            : 'todo list, task manager, productivity app, kanban board, calendar view, task organization, todo app, free task manager, secure todo list, cross-device sync',
          url: `${baseUrl}${langSuffix}`,
          type: 'website'
        };

      case '/cgu':
        return {
          title: language === 'fr' 
            ? 'Conditions Générales d\'Utilisation - µTodo'
            : 'Terms of Use - µTodo',
          description: language === 'fr'
            ? 'Consultez les conditions générales d\'utilisation de µTodo, votre gestionnaire de tâches simple et sécurisé.'
            : 'Read the terms of use for µTodo, your simple and secure task manager.',
          url: `${baseUrl}/cgu`,
          type: 'article'
        };

      case '/cgv':
        return {
          title: language === 'fr'
            ? 'Conditions Générales de Vente - µTodo'
            : 'Terms of Sale - µTodo',
          description: language === 'fr'
            ? 'Consultez les conditions générales de vente pour les services premium de µTodo.'
            : 'Read the terms of sale for µTodo premium services.',
          url: `${baseUrl}/cgv`,
          type: 'article'
        };

      default:
        return {
          title: this.DEFAULT_TITLE,
          description: this.DEFAULT_DESCRIPTION,
          url: baseUrl,
          type: 'website'
        };
    }
  }

  /**
   * Set up hreflang tags for multi-language support
   */
  static setupHreflang(currentPath: string): void {
    // Remove existing hreflang tags
    const existingHreflang = document.querySelectorAll('link[hreflang]');
    existingHreflang.forEach(link => link.remove());

    // Add hreflang tags
    const languages = ['en', 'fr'];
    const baseUrl = this.SITE_URL;

    languages.forEach(lang => {
      const hreflang = document.createElement('link');
      hreflang.setAttribute('rel', 'alternate');
      hreflang.setAttribute('hreflang', lang);
      
      const url = lang === 'en' 
        ? `${baseUrl}${currentPath}`
        : `${baseUrl}/fr${currentPath === '/' ? '' : currentPath}`;
      
      hreflang.setAttribute('href', url);
      document.head.appendChild(hreflang);
    });

    // Add x-default
    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', `${baseUrl}${currentPath}`);
    document.head.appendChild(xDefault);
  }
}
