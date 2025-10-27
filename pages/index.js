// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [woke, setWoke] = useState(false);

  useEffect(() => {
    // Trigger wake on first load
    const wake = async () => {
      try {
        await fetch('/api/wakeSpaces', { method: 'POST' });
        setWoke(true);
      } catch (err) {
        console.error('wake failed', err);
      }
    };

    wake();

    // Poll status every 5s
    const poll = async () => {
      try {
        const r = await fetch('/api/status');
        const j = await r.json();
        setStatuses(j.statuses || []);
        const allRunning = (j.statuses || []).every(s => s.stage === 'RUNNING');
        if (allRunning) setLoading(false);
      } catch (err) {
        console.error('status poll failed', err);
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h1 style={{ fontSize: 28 }}>MLops Waker — Demo Dashboard</h1>
      <p style={{ color: '#666' }}>
        This site automatically wakes all Hugging Face Spaces listed in your environment variables.
      </p>

      <div style={{ marginTop: 18 }}>
        <strong>Wake triggered:</strong> {woke ? 'Yes' : 'No'}
      </div>

      <div style={{ marginTop: 18 }}>
        <strong>Overall:</strong>{' '}
        {loading ? 'Warming up — demos may take 30–60s' : 'All demos running ✅'}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
          marginTop: 18,
        }}
      >
        {statuses.map((s) => (
          <div
            key={s.space}
            style={{
              border: '1px solid #e6e6e6',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600 }}>{s.space}</div>
            <div style={{ color: '#444' }}>{s.stage}</div>
            {s.stage === 'RUNNING' ? (
              <a
                href={`https://huggingface.co/spaces/${s.space}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Demo
              </a>
            ) : (
              <div style={{ color: '#999' }}>Starting — please wait</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
