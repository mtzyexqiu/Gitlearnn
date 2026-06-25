import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle perubahan input secara umum
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'username') {
      value = value.replace(/[^a-zA-Z0-9._-]/g, '');
    }

    if (name === 'password' || name === 'confirmPassword') {
      value = value.replace(/\D/g, '').slice(0, 6);
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

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Isi nama depan dan nama belakang dengan lengkap.');
      setLoading(false);
      return;
    }

    if (!form.username) {
      setError('Isi email dengan lengkap.');
      setLoading(false);
      return;
    }

    if (form.password.length !== 6) {
      setError('Password harus 6 digit.');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const res = await API.post('/auth/register', {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: `${form.username}@gmail.com`,
        password: form.password,
        role: form.role,
      });

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
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block"></span>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block"></span>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-gray-400 mb-2 block"></span>
            <div className="flex items-center gap-3 bg-transparent border border-zinc-700 rounded-2xl px-4 py-3 focus-within:border-white transition">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Your Email"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-500"
                required
              />
              <span className="text-gray-400">@gmail.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-2"></p>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block"></span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (6 digit)"
                className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
                required
              />
              <p className="text-xs text-gray-500 mt-2"></p>
            </label>
            <label className="block">
              <span className="text-sm text-gray-400 mb-2 block"></span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full bg-transparent border border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-white transition"
                required
              />
            </label>
          </div>

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
          Already have an account?{" "}
          <Link to="/login" className="text-white font-bold hover:underline transition-all">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;