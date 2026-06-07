import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle perubahan input secara umum
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Logika khusus untuk email: otomatis tambah @gmail.com
    if (name === 'email') {
      // Menghapus @gmail.com yang ada agar tidak duplikat saat edit
      const cleanValue = value.replace('@gmail.com', '');
      // Menambahkan @gmail.com kembali jika ada teks yang diketik
      value = cleanValue ? `${cleanValue}@gmail.com` : '';
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', form);

      login(
        {
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        },
        res.data.token
      );

      if (res.data.role === 'FREELANCER') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError('Registrasi gagal. Email mungkin sudah dipakai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden py-16">
      {/* Glow Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <h2
          onClick={() => navigate('/')}
          className="text-5xl font-bold text-center cursor-pointer hover:opacity-80 transition duration-300"
        >
          GitLearn
        </h2>

        <p className="text-center text-gray-400 mt-3 mb-14 text-lg">
          Let's Join with Our Community
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Username"
            className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
            required
          />

          {/* Email dengan Auto-Complete */}
          <input
            type="text" // Menggunakan text agar penambahan string lebih fleksibel
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan username email anda"
            className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
            required
          />

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-5 pt-2">
            {/* CLIENT */}
            <label
              className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.03]
              ${form.role === 'CLIENT'
                  ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="CLIENT"
                checked={form.role === 'CLIENT'}
                onChange={handleChange}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl mb-4">💼</div>
                <h3 className="font-bold text-2xl">Client</h3>
                <p className={`text-sm mt-3 leading-relaxed ${form.role === 'CLIENT' ? 'text-black/70' : 'text-gray-400'}`}>
                  Membuat project dan mencari freelancer
                </p>
              </div>
            </label>

            {/* FREELANCER */}
            <label
              className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.03]
              ${form.role === 'FREELANCER'
                  ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="FREELANCER"
                checked={form.role === 'FREELANCER'}
                onChange={handleChange}
                className="hidden"
              />
              <div className="flex flex-col items-center text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="font-bold text-2xl">Freelancer</h3>
                <p className={`text-sm mt-3 leading-relaxed ${form.role === 'FREELANCER' ? 'text-black/70' : 'text-gray-400'}`}>
                  Menawarkan jasa dan menerima project
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 transition mt-3"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-12 pb-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-white font-bold hover:underline transition-all">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;