export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl || 'https://agristellar.com';
  const apiBase = config.public.apiBase || 'http://localhost:3001/api';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/campaigns', priority: '0.9', changefreq: 'daily' },
    { url: '/register', priority: '0.7', changefreq: 'monthly' },
  ];

  let campaignUrls: { url: string; priority: string; changefreq: string }[] = [];
  try {
    const res = await $fetch<any>(`${apiBase}/campaigns/public`, { params: { limit: 100 } });
    if (res?.success && Array.isArray(res.data)) {
      campaignUrls = res.data.map((c: any) => ({
        url: `/campaigns/${c._id}`,
        priority: '0.8',
        changefreq: 'weekly',
      }));
    }
  } catch {
    // API unavailable — static pages only
  }

  const allPages = [...staticPages, ...campaignUrls];
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${siteUrl}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  setResponseHeader(event, 'content-type', 'application/xml');
  return xml;
});
