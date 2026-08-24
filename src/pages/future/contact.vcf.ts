import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => new Response(`BEGIN:VCARD\nVERSION:3.0\nFN:East Coast Foam LLC\nORG:East Coast Foam LLC\nTEL;TYPE=WORK,VOICE:+18432634933\nEMAIL;TYPE=INTERNET:hello@eastcoastfoamllc.com\nADR;TYPE=WORK:;;1352 Trask Pkwy;Seabrook;SC;29940;USA\nURL:https://eastcoastfoamllc.com/contact\nEND:VCARD\n`, {
  headers: {
    'Content-Type': 'text/vcard; charset=utf-8',
    'Content-Disposition': 'attachment; filename="east-coast-foam.vcf"'
  }
});
