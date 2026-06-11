import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const TopUpPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await API.get('/users/me');
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopUp = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      await API.post('/users/topup', { amount: Number(amount) });
      setSuccessMsg(`Saldo berhasil ditambah Rp ${Number(amount).toLocaleString()}!`);
      setAmount('');
      fetchBalance();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <span className="text-lg font-bold">💳 Top Up Saldo</span>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-8 pt-32 pb-16">

        {/* BALANCE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Saldo Kamu</p>
          <p className="text-4xl font-bold text-white">Rp {balance.toLocaleString()}</p>
        </div>

        {successMsg && (
          <div className="bg-green-900/50 border border-green-800 text-green-400 p-4 rounded-2xl mb-6 text-sm">
            {successMsg}
          </div>
        )}

        {/* TOP UP FORM */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="font-bold text-white mb-6">Tambah Saldo</h3>

          {/* QUICK AMOUNTS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(q)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  Number(amount) === q
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 border border-zinc-700 text-gray-400 hover:border-white hover:text-white'
                }`}
              >
                Rp {q.toLocaleString()}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex items-center bg-black border border-zinc-700 rounded-2xl px-4 py-4 focus-within:border-white transition mb-6">
            <span className="text-gray-400 font-semibold mr-2">Rp</span>
            <input
              type="number"
              placeholder="Masukkan nominal..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={handleTopUp}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : '💳 Top Up'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TopUpPage;