import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { CreditCard, Send, Home } from 'lucide-react';

const MyOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/client');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <div className="flex items-center gap-3">
            <img src="/logo192.png" alt="GitLearn" className="w-8 h-8 rounded-sm" />
            <span className="text-2xl font-bold tracking-wider">GitLearn</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-sm">Halo, {user?.name}!</span>
            <button onClick={() => navigate('/topup')} title="Top Up" aria-label="Top Up" className="text-gray-400 hover:text-white text-sm transition p-1">
              <CreditCard className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/messages')} title="Messages" aria-label="Messages" className="text-gray-400 hover:text-white transition p-1">
              <Send className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/client/dashboard')} title="Dashboard" aria-label="Dashboard" className="text-gray-400 hover:text-white text-sm transition p-1">
              <Home className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-sm hover:border-white hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        <div className="mb-12">   
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-400">Track all your orders here.</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500">No orders yet.</p>
            <button onClick={() => navigate('/client/dashboard')} className="mt-6 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
              Find Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white text-lg">{order.service?.title}</p>
                    <p className="text-sm text-gray-500 mt-1">Freelancer: {order.service?.freelancer?.name}</p>
                    <p className="text-sm text-gray-500">{order.service?.category}</p>
                    <div className="flex gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-white font-semibold">Rp {order.price?.toLocaleString()}</p>
                      </div>
                      {order.offeredPrice && (
                        <div>
                          <p className="text-xs text-gray-500">Your Offer</p>
                          <p className="text-yellow-400 font-semibold">Rp {order.offeredPrice?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold">
                      {order.status === 'PENDING' ? '🔄 MASIH PROSES' :
                       order.status === 'FILE_SENT' ? '📁 FILE DIKIRIM' :
                       order.status === 'COMPLETED_BY_FREELANCER' ? '⏳ MENUNGGU FREELANCER' :
                       order.status === 'COMPLETED' ? '✅ SELESAI' : order.status}
                    </span>
                    <button
                      onClick={() => navigate(`/chat/${order.service?.freelancer?.id}`)}
                      className="border border-zinc-700 text-gray-300 px-4 py-1 rounded-full text-xs hover:border-white hover:text-white transition"
                    >
                      💬 Chat
                    </button>

                    {(order.status === 'ACCEPTED' || order.status === 'FILE_SENT' || order.status === 'COMPLETED_BY_FREELANCER' || order.status === 'COMPLETED') && (
  <button
    onClick={() => navigate(`/order-files/${order.id}`)}
    className="border border-zinc-700 text-gray-300 px-4 py-1 rounded-full text-xs hover:border-white hover:text-white transition"
  >
    📁 File
  </button>
)}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;