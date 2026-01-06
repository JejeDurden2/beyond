import { MetadataRoute } from 'next';
import { locales } from '../../i18n.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://beyond.app';

  const routes = ['', '/login', '/register'];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}${route}`])),
      },
    })),
  );
}
