'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, TextField } from '@/components';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/admin';
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <section className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-16">
      <Container size="sm">
        <Card className="max-w-sm mx-auto">
          <h1 className="text-xl font-semibold text-fg mb-6">Admin Access</h1>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <div className="mt-4">
            <Button onClick={handleLogin} disabled={loading || !password} fullWidth>
              {loading ? 'Checking...' : 'Sign in'}
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  );
}
