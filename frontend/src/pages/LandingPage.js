import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Web Development", icon: "</>" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "Mobile App", icon: "📱" },
    { name: "Graphic Design", icon: "✏️" },
    { name: "Digital Marketing", icon: "📣" },
    { name: "SEO Specialist", icon: "🔍" },
    { name: "Video Editing", icon: "🎬" },
    { name: "Content Writing", icon: "📝" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offset = 80;
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md border-b border-zinc-800 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8">
          <button onClick={scrollToTop} className="text-4xl font-bold tracking-wide hover:text-gray-300 transition">
            GitLearn
          </button>
          <div className="hidden md:flex items-center gap-8 text-gray-300">
            <button onClick={() => scrollToSection("categories")} className="px-3 py-2 hover:text-white transition-all">Categories</button>
            <button onClick={() => scrollToSection("about")} className="px-3 py-2 hover:text-white transition-all">About</button>
            <button onClick={() => scrollToSection("pricing")} className="px-3 py-2 hover:text-white transition-all">Pricing</button>
            <button onClick={() => scrollToSection("contact")} className="px-3 py-2 hover:text-white transition-all">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-6 py-2 border border-zinc-700 text-white hover:bg-white hover:text-black transition-all">Login</Link>
            <Link to="/register" className="px-6 py-2 bg-white text-black font-semibold hover:bg-zinc-300 transition-all">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">Find Nice<span className="block text-gray-300">Freelance Talent</span></h1>
          <p className="mt-8 text-xl text-gray-300 max-w-3xl mx-auto">Connect with world-class freelancers and build amazing projects faster than ever.</p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="bg-white text-black px-8 py-4 font-semibold hover:bg-zinc-300 transition-all">Get Started</Link>
            <button onClick={() => scrollToSection("categories")} className="border border-white px-8 py-4 hover:bg-white hover:text-black transition-all">Explore Talent</button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="scroll-mt-24 py-28 bg-black">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center mb-16">Popular Categories</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((item, index) => (
              <div key={index} className="group flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 p-8 rounded-3xl transition-all duration-500 hover:scale-105 hover:border-white cursor-pointer">
                <div className="text-3xl mb-4 text-green-400 group-hover:text-white">{item.icon}</div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24 py-28 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center mb-16">Why FreelanceHub</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl">
              <div className="text-5xl mb-5">⚡</div>
              <h3 className="text-2xl font-bold mb-4">Fast Hiring</h3>
              <p className="text-gray-400">Hire skilled freelancers within minutes.</p>
            </div>
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl">
              <div className="text-5xl mb-5">🔒</div>
              <h3 className="text-2xl font-bold mb-4">Secure Payments</h3>
              <p className="text-gray-400">Protected transactions and trusted talent.</p>
            </div>
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl">
              <div className="text-5xl mb-5">💬</div>
              <h3 className="text-2xl font-bold mb-4">Direct Communication</h3>
              <p className="text-gray-400">Collaborate directly with freelancers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="scroll-mt-24 py-28 bg-black">
        <div className="text-center mb-16 px-4">
          <h2 className="text-6xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-xl">Start free, upgrade anytime.</p>
        </div>

        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* FREE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-gray-400 text-sm mb-6">For beginners just starting out.</p>
              <p className="text-5xl font-bold mb-8">Rp 0 <span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-10">
                {[{ ok: true, text: '3 active services' }, { ok: true, text: 'Chat with clients' }, { ok: true, text: 'Basic dashboard' }, { ok: false, text: 'Featured listing' }, { ok: false, text: 'Advanced analytics' }, { ok: false, text: 'Priority support' }].map((item, i) => (
                  <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>{item.ok ? '✓' : '✕'}</span> {item.text}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center border border-white text-white py-3 rounded-full font-semibold hover:bg-white hover:text-black transition">Get Started</Link>
            </div>

            {/* PRO */}
            <div className="bg-white text-black rounded-3xl p-8 relative scale-105">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</span>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-gray-500 text-sm mb-6">For serious freelancers.</p>
              <p className="text-5xl font-bold mb-8">Rp 99K <span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-10">
                {[{ ok: true, text: 'Unlimited active services' }, { ok: true, text: 'Chat with clients' }, { ok: true, text: 'Full dashboard' }, { ok: true, text: 'Featured listing' }, { ok: true, text: 'Advanced analytics' }, { ok: false, text: 'Priority support' }].map((item, i) => (
                  <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-800' : 'text-gray-400'}`}>
                    <span>{item.ok ? '✓' : '✕'}</span> {item.text}
                  </li>
                ))}
              </ul>
              <Link to="/checkout/pro" className="block text-center bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition">Get Pro</Link>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-600 transition">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm mb-6">For teams and agencies.</p>
              <p className="text-5xl font-bold mb-8">Rp 299K <span className="text-sm font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-10">
                {[{ ok: true, text: 'Unlimited active services' }, { ok: true, text: 'Chat with clients' }, { ok: true, text: 'Full dashboard' }, { ok: true, text: 'Featured listing' }, { ok: true, text: 'Advanced analytics' }, { ok: true, text: 'Priority support' }].map((item, i) => (
                  <li key={i} className={`text-sm flex gap-2 ${item.ok ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>{item.ok ? '✓' : '✕'}</span> {item.text}
                  </li>
                ))}
              </ul>
              <Link to="/checkout/enterprise" className="block text-center border border-white py-3 rounded-full font-semibold hover:bg-white hover:text-black transition">Get Enterprise</Link>
            </div>

          </div>
        </div>
      </section>


{/* SECTION KONTAK DAN QUICK LINK */}
      <section id="contact" className="scroll-mt-24 py-28 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-16">
            
            {/* BAGIAN KIRI: INSTITUT */}
            <div className="flex-1">
              <h3 className="text-4xl font-bold mb-6">GitLearn</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Dapatkan kesempatan untuk menjadi Freelance yang Bertalenta. Mencari Talenta untuk projek besar dengan skala global akan lebih mudah. Segera daftarkan diri Anda untuk bergabung bersama kami di GitLearn.
              </p>
              <div className="space-y-3 text-gray-300">
                <p>📍 Jl. Soekarno-Hatta No.456, Batununggal, Kec. Bandung Kidul, Kota Bandung, Jawa Barat 40266</p>
                <p>📞 Whatsapp – 0831-6565-5387</p>
                <p>☎️ (022) 7564282</p>
                <p>📧 kelompokterakhir@gmail.com</p>
              </div>
            </div>

            {/* BAGIAN KANAN: PROGRAM STUDI */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-6"></h3>
              <ul className="space-y-4 text-gray-400">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
              </ul>
            </div>

          </div>

          {/* SOSIAL MEDIA ICON */}
          <div className="mt-16 flex justify-center gap-6 text-2xl text-gray-400">
{/* SOSIAL MEDIA ICON DENGAN WADAH LINGKARAN */}
<div className="mt-16 flex justify-center gap-6">
  {/* Ikon Facebook */}
  <a href="#" className="bg-white p-3 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center">
    <img src="/icons/facebook.png" alt="Facebook" className="w-6 h-6" />
  </a>
  
  {/* Ikon TikTok */}
  <a href="#" className="bg-white p-3 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center">
    <img src="/icons/tiktok.png" alt="TikTok" className="w-6 h-6" />
  </a>
  
  {/* Ikon Instagram */}
  <a href="#" className="bg-white p-3 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center">
    <img src="/icons/instagram.png" alt="Instagram" className="w-6 h-6" />
  </a>
  
  {/* Ikon YouTube */}
  <a href="#" className="bg-white p-3 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center">
    <img src="/icons/youtube.png" alt="YouTube" className="w-6 h-6" />
  </a>
  
  {/* Ikon LinkedIn */}
  <a href="#" className="bg-white p-3 rounded-full hover:bg-gray-200 transition-all flex items-center justify-center">
    <img src="/icons/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
  </a>
</div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-16 text-center text-zinc-500">
        © 2026 GitLearn. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;