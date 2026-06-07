import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const CheckoutPage = () => {
  const { plan } = useParams();
  const navigate = useNavigate();

  const planDetails = {
    pro: { name: "Pro", price: "Rp 99K", desc: "For serious freelancers." },
    enterprise: { name: "Enterprise", price: "Rp 299K", desc: "For teams and agencies." },
  };

  const selected = planDetails[plan] || { name: "Unknown", price: "Rp 0", desc: "-" };

  const handleBack = () => {
    navigate("/", { state: { scrollTo: "pricing" } });
  };

  return (
    <div className="bg-black min-h-screen text-white py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={handleBack} className="text-zinc-500 hover:text-white mb-8 inline-block transition">
          ← Kembali ke Pricing
        </button>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Sisi Kiri: Detail Paket */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Pembayaran</h1>
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
              <h3 className="text-sm text-zinc-400 uppercase tracking-widest mb-2">Paket Dipilih</h3>
              <h2 className="text-3xl font-bold mb-2">{selected.name}</h2>
              <p className="text-zinc-400 mb-6">{selected.desc}</p>
              <div className="text-4xl font-bold">{selected.price}<span className="text-lg text-zinc-500 font-normal"> /bulan</span></div>
            </div>
          </div>

          {/* Sisi Kanan: Form Pembayaran */}
          <div className="bg-white text-black p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Detail Pembayaran</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
                <input type="text" className="w-full bg-zinc-100 p-3 rounded-xl border border-zinc-200 outline-none focus:border-black" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nomor Kartu</label>
                <input type="text" className="w-full bg-zinc-100 p-3 rounded-xl border border-zinc-200 outline-none focus:border-black" placeholder="0000 0000 0000 0000" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Expiry</label>
                  <input type="text" className="w-full bg-zinc-100 p-3 rounded-xl border border-zinc-200 outline-none" placeholder="MM/YY" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">CVC</label>
                  <input type="text" className="w-full bg-zinc-100 p-3 rounded-xl border border-zinc-200 outline-none" placeholder="123" />
                </div>
              </div>
              <button type="button" className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition mt-4">
                Bayar Sekarang
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;