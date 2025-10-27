// pages/api/wakeSpaces.js
export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).end();


const HF_TOKEN = process.env.HF_TOKEN;
const SPACES = (process.env.SPACES || '').split(',').map(s => s.trim()).filter(Boolean);


if (!HF_TOKEN || SPACES.length === 0) {
return res.status(500).json({ error: 'HF_TOKEN or SPACES not configured' });
}


const results = [];


for (const space of SPACES) {
try {
const r = await fetch(`https://huggingface.co/api/spaces/${space}/runtime/restart`, {
method: 'POST',
headers: {
Authorization: `Bearer ${HF_TOKEN}`,
'Content-Type': 'application/json'
}
});
results.push({ space, status: r.status });
} catch (err) {
results.push({ space, error: err.message });
}
}


// Return quickly; actual startup will happen on HF side. Frontend will poll /api/status.
res.status(202).json({ results });
}
