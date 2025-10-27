// pages/api/status.js
export default async function handler(req, res) {
if (req.method !== 'GET') return res.status(405).end();


const HF_TOKEN = process.env.HF_TOKEN;
const SPACES = (process.env.SPACES || '').split(',').map(s => s.trim()).filter(Boolean);


if (!HF_TOKEN || SPACES.length === 0) {
return res.status(500).json({ error: 'HF_TOKEN or SPACES not configured' });
}


const statuses = [];


for (const space of SPACES) {
try {
const r = await fetch(`https://huggingface.co/api/spaces/${space}`,
{ headers: { Authorization: `Bearer ${HF_TOKEN}` } }
);
const data = await r.json();
// data.runtime.stage is typically 'RUNNING' or 'STOPPED' or 'STARTING'
statuses.push({ space, stage: data?.runtime?.stage || 'unknown' });
} catch (err) {
statuses.push({ space, stage: 'error', error: err.message });
}
}


res.status(200).json({ statuses });
}
