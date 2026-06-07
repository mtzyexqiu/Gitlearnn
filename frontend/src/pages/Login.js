import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

import { motion } from "framer-motion";

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', form);

      login(
        {
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        },
        res.data.token
      );

      if (res.data.role === 'FREELANCER') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/client/dashboard');
      }

    } catch (err) {
      setError('Email atau password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden py-16">

      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >

        {/* Logo */}
        <h2
          onClick={() => navigate('/')}
          className="text-5xl font-bold text-center cursor-pointer hover:opacity-80 transition duration-300"
        >
          GitLearn
        </h2>

        <p className="text-center text-gray-400 mt-3 mb-14 text-lg">
          Continue with your email
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="yourEmail@gmail.com"
            className="w-full bg-transparent border border-zinc-700 rounded-1xl px-6 py-4 focus:outline-none focus:border-white transition"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full bg-transparent border border-zinc-700 rounded-1xl px-6 py-4 focus:outline-none focus:border-white transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3  rounded-1xl font-semibold text-lg hover:bg-gray-200 transition"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-12 pb-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-white font-bold hover:underline transition-all"
          >
            Daftar sekarang
          </Link>
        </p>

      </motion.div>

    </div>
  );
};

export default Login;