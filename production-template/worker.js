const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const clean = (value, max = 500) =>
  String(value ?? '').trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max);

const entries = (form, name, maxItems = 12) =>
  form.getAll(name).slice(0, maxItems).map((item) => clean(item, 160)).filter(Boolean);

const validEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value) =>
  value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '').length === 10;

function makeBody(form) {
  const goals = entries(form, 'goals');
  const services = entries(form, 'services');
  const fields = [
    ['Name', clean(form.get('fullName'), 120)],
    ['Phone', clean(form.get('phone'), 30)],
    ['Email', clean(form.get('email'), 254)],
    ['Preferred contact', clean(form.get('contactPreference'), 30)],
    ['Best time', clean(form.get('bestTime'), 100)],
    ['Project type', clean(form.get('projectType'), 100)],
    ['Goals', goals.join(', ')],
    ['Services', services.join(', ')],
    ['City', clean(form.get('city'), 100)],
    ['ZIP', clean(form.get('zip'), 10)],
    ['Street', clean(form.get('street'), 140)],
    ['Subdivision', clean(form.get('subdivision'), 100)],
    ['Access', clean(form.get('access'), 100)],
    ['Timing', clean(form.get('timing'), 100)],
    ['Approx. size', clean(form.get('size'), 30)],
    ['Notes', clean(form.get('notes'), 1200)],
    ['Lead source', clean(form.get('leadSource'), 100)],
    ['Lead detail', clean(form.get('leadSourceDetail'), 100)]
  ];
  return fields
    .filter(([, value]) => value)
    .map(([label, value]) => label + ': ' + value)
    .join('\n');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/estimate') {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed.' }, 405);
    }

    const origin = request.headers.get('Origin');
    if (!origin || origin !== url.origin) {
      return json({ ok: false, error: 'Cross-site submission blocked.' }, 403);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 5 * 1024 * 1024) {
      return json({ ok: false, error: 'Attachments are too large.' }, 413);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ ok: false, error: 'Invalid form submission.' }, 400);
    }

    if (clean(form.get('website'), 200)) {
      return json({ ok: true, reference: 'accepted' });
    }

    const started = Number(form.get('formStartedAt') || 0);
    if (!Number.isFinite(started) || Date.now() - started < 1500) {
      return json({ ok: false, error: 'Please review the form and try again.' }, 400);
    }

    const fullName = clean(form.get('fullName'), 120);
    const phone = clean(form.get('phone'), 30);
    const email = clean(form.get('email'), 254);
    const city = clean(form.get('city'), 100);
    const zip = clean(form.get('zip'), 10);
    const timing = clean(form.get('timing'), 100);
    const preference = clean(form.get('contactPreference'), 30);

    if (
      fullName.length < 2 ||
      !validPhone(phone) ||
      city.length < 2 ||
      !/^\d{5}$/.test(zip) ||
      !timing ||
      !['Call', 'Text', 'Email'].includes(preference) ||
      !validEmail(email) ||
      (preference === 'Email' && !email)
    ) {
      return json({ ok: false, error: 'Please correct the required contact and project fields.' }, 400);
    }

    const attachments = [];
    let attachmentBytes = 0;

    for (const item of form.getAll('attachments')) {
      if (!(item instanceof File) || !item.size) continue;

      if (!ALLOWED_FILE_TYPES.has(item.type)) {
        return json({ ok: false, error: 'One attachment type is not supported.' }, 400);
      }

      attachmentBytes += item.size;
      if (attachmentBytes > MAX_ATTACHMENT_BYTES) {
        return json({ ok: false, error: 'Attachments must stay under 4 MB total.' }, 413);
      }

      attachments.push({
        content: await item.arrayBuffer(),
        filename: clean(item.name, 120).replace(/[\/\\]/g, '-'),
        type: item.type,
        disposition: 'attachment'
      });
    }

    const subjectName = fullName.replace(/[\r\n]/g, ' ');
    const subjectCity = city.replace(/[\r\n]/g, ' ');

    try {
      const result = await env.ECF_INBOX.send({
        to: 'ecfoam@outlook.com',
        from: {
          email: 'website@eastcoastfoamllc.com',
          name: 'East Coast Foam Website'
        },
        subject: 'Website estimate request — ' + subjectName + ' — ' + subjectCity,
        text: makeBody(form),
        replyTo: email || undefined,
        attachments
      });

      return json({ ok: true, reference: result.messageId });
    } catch (error) {
      console.error('Estimate email delivery failed', error?.code || 'unknown');
      return json({
        ok: false,
        error: 'We could not send the request right now. Please call (843) 263-4933 or email ecfoam@outlook.com.'
      }, 503);
    }
  }
};
