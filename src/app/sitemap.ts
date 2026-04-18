import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tempusphere.vibratomstudios.com';

  const staticPages = [
    '/',
    '/about',
    '/app',
    '/contact',
    '/privacy',
    '/culinary',
    '/culinary/calculators/food-cost',
    '/culinary/calculators/unit-converter',
    '/culinary/calculators/yield-percentage',
    '/culinary/core-tools/book',
    '/culinary/core-tools/inventory',
    '/culinary/core-tools/recipe-search',
    '/culinary/core-tools/search',
    '/culinary/waste-tracker',
    '/culinary/workflow/checklist',
    '/culinary/workflow/kds',
    '/culinary/workflow/timers',
    '/finance',
    '/finance/budget',
    '/finance/journal',
    '/finance/reports',
    '/productivity',
    '/productivity/analysis',
    '/productivity/clm',
    '/productivity/marketing/channels',
    '/productivity/marketing/planning',
    '/productivity/mom',
    '/productivity/win-loss',
    '/projects',
    '/projects/board',
    '/projects/budget',
    '/projects/calendar',
    '/projects/canvas',
    '/projects/chart',
    '/projects/checklist',
    '/projects/gantt',
    '/projects/list',
    '/projects/mindmap',
    '/projects/spreadsheet',
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: page === '/' ? 1.0 : 0.8,
  }));
}
