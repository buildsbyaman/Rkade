import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/_next/', '/private/'],
      },
    ],
    sitemap: 'https://rkade.in/sitemap.xml',
    host: 'https://rkade.in',
  }
}