// Edge Middleware: markdown content negotiation (acceptmarkdown.com).
// Fail-open at every layer:
//   - Requests NOT asking for text/markdown pass through untouched (99.99% of traffic).
//   - The x-md-passthrough guard makes the internal fetch loop-proof.
//   - Any error in the markdown branch falls back to serving the normal HTML.
// So human/browser traffic is never affected; only Accept: text/markdown callers
// (AI agents / audits) get the markdown variant.

export const config = {
  // run on page-like paths only; skip assets (anything with a dot) and _next
  matcher: ['/((?!_next/|.*\\.).*)'],
};

export default async function middleware(request) {
  try {
    // loop guard: our own internal fetch carries this header -> bail immediately
    if (request.headers.get('x-md-passthrough')) return;

    const accept = request.headers.get('accept') || '';
    if (!accept.includes('text/markdown')) return; // not asking for markdown -> no-op

    // fetch the HTML variant; Accept: text/html + guard header => never re-enters this branch
    const res = await fetch(request.url, {
      headers: { accept: 'text/html', 'x-md-passthrough': '1' },
    });
    if (!res.ok) {
      // 404 requested in markdown: return a markdown recovery body so agents can recover
      if (res.status === 404) {
        const nf =
          '# Page Not Found (404)\n\n' +
          'The page you requested does not exist. Where to look next:\n\n' +
          '- [Home](https://www.upimmigration.ca/)\n' +
          '- [Permanent Residence](https://www.upimmigration.ca/permanent-residence)\n' +
          '- [Work Permits](https://www.upimmigration.ca/work-permit)\n' +
          '- [Study Permits](https://www.upimmigration.ca/study-permit)\n' +
          '- [Immigration Blog](https://www.upimmigration.ca/blog)\n' +
          '- [Book a consultation](https://www.upimmigration.ca/immigration-consultation)\n\n' +
          'Machine-readable: [sitemap.xml](https://www.upimmigration.ca/sitemap.xml) and [llms.txt](https://www.upimmigration.ca/llms.txt)\n';
        return new Response(nf, {
          status: 404,
          headers: {
            'content-type': 'text/markdown; charset=utf-8',
            'vary': 'Accept, Accept-Encoding',
            'x-content-type-options': 'nosniff',
          },
        });
      }
      return; // other errors -> serve the normal response
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return; // only convert HTML documents

    const html = await res.text();
    const md = htmlToMarkdown(html);
    if (!md) return; // nothing extracted -> fall back

    return new Response(md, {
      status: 200,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'vary': 'Accept, Accept-Encoding',
        'x-content-type-options': 'nosniff',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (_e) {
    return; // any failure -> serve the normal HTML, no regression
  }
}

function stripTags(t) {
  return t.replace(/<[^>]+>/g, '');
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function htmlToMarkdown(html) {
  let s = html;
  const titleMatch = s.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decode(stripTags(titleMatch[1])).trim() : '';

  // drop non-content
  s = s.replace(/<head[\s\S]*?<\/head>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // headings
  for (let i = 1; i <= 6; i++) {
    const hashes = '#'.repeat(i);
    s = s.replace(new RegExp('<h' + i + '[^>]*>([\\s\\S]*?)<\\/h' + i + '>', 'gi'),
      (_m, t) => '\n\n' + hashes + ' ' + stripTags(t).trim() + '\n\n');
  }
  // links
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, t) => '[' + stripTags(t).trim() + '](' + href + ')');
  // emphasis
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, (_m, _t1, t) => '**' + stripTags(t).trim() + '**');
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, (_m, _t1, t) => '*' + stripTags(t).trim() + '*');
  // list items
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, t) => '\n- ' + stripTags(t).trim());
  // block breaks
  s = s.replace(/<\/(p|div|section|article|ul|ol|tr|table|blockquote)>/gi, '\n\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');

  s = stripTags(s);
  s = decode(s);
  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (!s) return '';
  return (title ? '# ' + title + '\n\n' : '') + s + '\n';
}
