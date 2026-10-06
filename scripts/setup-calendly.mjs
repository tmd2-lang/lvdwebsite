// Read-only discovery by default. --subscribe explicitly creates the subscription.
const token = process.env.CALENDLY_API_TOKEN;
const target = 'https://calendly.com/ladyvictoriadesigns/design-consultation';
if (!token) throw new Error('Set CALENDLY_API_TOKEN in the environment. Never paste it into source code.');
async function api(path, body) {
  const url = new URL(path, 'https://api.calendly.com');
  if (url.origin !== 'https://api.calendly.com') throw new Error('Unexpected API pagination origin');
  const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Calendly API returned ${response.status}; check token permissions and plan.`);
  return response.json();
}
async function collection(path) {
  const rows = [];
  while (path) { const result = await api(path); rows.push(...result.collection); path = result.pagination?.next_page; }
  return rows;
}
const me = (await api('/users/me')).resource;
const types = await collection(`/event_types?organization=${encodeURIComponent(me.current_organization)}&active=true&count=100`);
const matches = types.filter(item => item.scheduling_url.replace(/\/$/, '') === target);
if (matches.length !== 1) throw new Error('Could not uniquely locate the exact Design Consultation URL in this organization.');
console.log(`CALENDLY_DESIGN_CONSULTATION_EVENT_TYPE_URI=${matches[0].uri}`);
if (process.argv.includes('--subscribe')) {
  const callback = process.env.CALENDLY_WEBHOOK_URL;
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!callback || new URL(callback).protocol !== 'https:' || !signingKey || signingKey.length < 32) throw new Error('Set HTTPS CALENDLY_WEBHOOK_URL and a signing key of at least 32 characters.');
  const existing = await collection(`/webhook_subscriptions?organization=${encodeURIComponent(me.current_organization)}&scope=organization&count=100`);
  const same = existing.filter(item => item.callback_url === callback);
  if (same.length) {
    const healthy = same.length === 1 && same[0].state === 'active' && ['invitee.created', 'invitee.canceled'].every(event => same[0].events.includes(event));
    if (!healthy) throw new Error('An existing callback subscription needs manual review; no duplicate was created.');
    console.log('Active subscription already exists. Its signing key cannot be verified here; confirm it matches the host configuration.');
  } else {
    await api('/webhook_subscriptions', { url: callback, organization: me.current_organization, scope: 'organization', events: ['invitee.created', 'invitee.canceled'], signing_key: signingKey });
    console.log('Subscription created. Only the configured Design Consultation event type is persisted by the application.');
  }
}
