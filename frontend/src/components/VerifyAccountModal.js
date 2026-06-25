import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';

const VerifyAccountModal = ({ open, onVerified, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const fieldCount = 6;

  useEffect(() => {
    if (open) {
      setError('');
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleVerify = async () => {
    if (password.length !== fieldCount) {
      setError(`Password harus ${fieldCount} digit`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/users/verify-password', { password });
      setPassword('');
      setError('');
      if (onVerified) onVerified();
    } catch (err) {
      setError('Password salah');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const passwordChars = password.split('').slice(0, fieldCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" onClick={onClose} />

      <div className="relative z-60 w-full max-w-md mx-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold mb-2 text-white">🔐 Verifikasi Akun</h3>
          <p className="text-gray-400 text-sm mb-6">Masukkan password akun untuk lanjutkan top up</p>

          <div
            className="grid grid-cols-6 gap-3 mb-4 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: fieldCount }).map((_, idx) => {
              const char = passwordChars[idx];
              return (
                <div
                  key={idx}
                  className="h-14 flex items-center justify-center rounded-2xl border border-zinc-700 bg-black text-xl font-bold text-white"
                >
                  {char || '•'}
                </div>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, fieldCount))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="absolute opacity-0 pointer-events-none"
            aria-label="Password verifikasi"
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || !password}
              className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Verifikasi'}
            </button>
            <button
              onClick={() => { setPassword(''); setError(''); onClose(); }}
              className="flex-1 border border-zinc-700 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccountModal;
