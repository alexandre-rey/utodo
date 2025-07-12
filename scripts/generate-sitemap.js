#!/usr/bin/env node

/**
 * Sitemap Generator for µTodo
 * Automatically generates sitemap.xml based on routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://utodo.io';
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

const staticRoutes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    path: '/cgu',
    priority: '0.3',
    changefreq: 'monthly'
  },
  {
    path: '/cgv',
    priority: '0.3',
    changefreq: 'monthly'
  },
  {
    path: '/payment-success',
    priority: '0.2',
    changefreq: 'monthly'
  },
  {
    path: '/payment-cancelled',
    priority: '0.2',
    changefreq: 'monthly'
  }
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>`;
    
    // Add hreflang for multi-language support on main page
    if (route.path === '/') {
      xml += `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}/fr" />`;
    }
    
    xml += `
  </url>`;
  });

  xml += `
</urlset>`;

  fs.writeFileSync(OUTPUT_FILE, xml);
  console.log(`✅ Sitemap generated at ${OUTPUT_FILE}`);
  console.log(`📊 Generated ${staticRoutes.length} URLs`);
}

// Run if this is the main module
generateSitemap();

export { generateSitemap };
