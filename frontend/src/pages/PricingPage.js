import React from "react";
import { Link } from "react-router-dom";

const PricingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <Link to="/" className="text-2xl font-bold tracking-wider hover:opacity-70 transition">
            FreelanceHub
          </Link>
          <div className="hidden md:flex gap-8 text-gray-300">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/pricing" className="text-white transition">Pricing</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
            <Link to="/register" className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200 transition">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <div className="text-center pt-40 pb-16 px-4">
        <h2 className="text-6xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-gray-400 text-xl">Start free, upgrade anytime.</p>
      </div>

      {/* PRICING CARDS */}
      <div className="max-w-5xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* FREE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 text-sm mb-6">For beginners just starting out.</p>
            <p className="text-5xl font-bold mb-8">Rp 0 <span className="text-sm font-normal text-gray-400">/mo</span></p>
            <ul className="space-y-3 mb-10">
              {[
                { ok: true, text: '3 active services' },
                { ok: true, text: 'Chat with clients' },
                { ok: true, text: 'Basic dashboard' },
                { ok: false, text: 'Featured listing' },
                { ok: false, text: 'Advanced analytics' },
                { ok: false, text: 'Priority support' },
              ].map((item, i) => (
                <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>{item.ok ? '✓' : '✕'}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center border border-white text-white py-3 rounded-full font-semibold hover:bg-white hover:text-black transition">
              Get Started
            </Link>
          </div>

          {/* PRO */}
          <div className="bg-white text-black rounded-3xl p-8 relative scale-105">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </span>
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <p className="text-gray-500 text-sm mb-6">For serious freelancers.</p>
            <p className="text-5xl font-bold mb-8">Rp 99K <span className="text-sm font-normal text-gray-400">/mo</span></p>
            <ul className="space-y-3 mb-10">
              {[
                { ok: true, text: 'Unlimited active services' },
                { ok: true, text: 'Chat with clients' },
                { ok: true, text: 'Full dashboard' },
                { ok: true, text: 'Featured listing' },
                { ok: true, text: 'Advanced analytics' },
                { ok: false, text: 'Priority support' },
              ].map((item, i) => (
                <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-800' : 'text-gray-400'}`}>
                  <span>{item.ok ? '✓' : '✕'}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition">
              Get Pro
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <p className="text-gray-400 text-sm mb-6">For teams and agencies.</p>
            <p className="text-5xl font-bold mb-8">Rp 299K <span className="text-sm font-normal text-gray-400">/mo</span></p>
            <ul className="space-y-3 mb-10">
              {[
                { ok: true, text: 'Unlimited active services' },
                { ok: true, text: 'Chat with clients' },
                { ok: true, text: 'Full dashboard' },
                { ok: true, text: 'Featured listing' },
                { ok: true, text: 'Advanced analytics' },
                { ok: true, text: 'Priority support' },
              ].map((item, i) => (
                <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>{item.ok ? '✓' : '✕'}</span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center border border-white text-white py-3 rounded-full font-semibold hover:bg-white hover:text-black transition">
              Get Enterprise
            </Link>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold">FreelanceHub</h3>
            <p className="text-gray-500 mt-3">Premium freelance marketplace.</p>
          </div>
          <div className="flex gap-8 text-gray-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
          </div>
          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PricingPage;