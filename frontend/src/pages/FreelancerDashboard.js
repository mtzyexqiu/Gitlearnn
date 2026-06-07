import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const FreelancerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', imageFile: null });
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [filterIndex, setFilterIndex] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Web Development',
    'UI/UX Design',
    'Mobile App',
    'Graphic Design',
    'Digital Marketing',
    'Video Editing',
    'Content Writing',
    'Music',
    'Photography',
    'Other'
  ];
  const priceOptions = [150000, 250000, 500000, 1000000];
  const formattedPrice = useMemo(() => {
    if (!form.price) return '';
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(form.price));
  }, [form.price]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completionRate: 0,
    rating: 0,
    totalReviews: 0,
    activeOrders: 0,
    totalClients: 0
  });

  // Perbaikan 1: Menggunakan useMemo agar config stabil dan tidak memicu warning dependensi
  const config = useMemo(() => ({ 
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
  }), []);

  const fetchMyServices = useCallback(async () => {
    try {
      const res = await API.get('/services/my', config);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const fetchMyOrders = useCallback(async () => {
    try {
      const res = await API.get('/orders/freelancer', config);
      setOrders(res.data);
      
      // Calculate stats dari orders
      if (res.data && res.data.length > 0) {
        const completed = res.data.filter(o => o.status === 'COMPLETED').length;
        const completionRate = Math.round((completed / res.data.length) * 100);
        const totalEarnings = res.data
          .filter(o => o.status === 'COMPLETED')
          .reduce((sum, o) => sum + (o.price || 0), 0);
        const activeOrders = res.data.filter(o => o.status === 'ACCEPTED' || o.status === 'PENDING').length;
        const uniqueClients = new Set(res.data.map(o => o.client?.id)).size;
        
        // Hitung earnings bulan ini
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        setStats(prev => ({
          ...prev,
          totalEarnings,
          completionRate,
          activeOrders,
          totalClients: uniqueClients
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await API.get('/messages/unread', config);
      setUnreadMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [config]);

  useEffect(() => {
    fetchMyServices();
    fetchMyOrders();
    fetchUnreadMessages();
  }, [fetchMyServices, fetchMyOrders, fetchUnreadMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (form.imageFile) {
        const formData = new FormData();
        formData.append('file', form.imageFile);
        
        // Perbaikan 2: Kirim FormData langsung. Axios akan menangani boundary secara otomatis.
        // Jika backend masih 403, ini dipastikan masalah di Middleware Backend (Role/Auth).
        const uploadRes = await API.post('/files/upload', formData, config);
        imageUrl = uploadRes.data.url;
      }
      
      await API.post('/services', {
        title: form.title,
        description: form.description,
        price: form.price,
        category: form.category,
        imageUrl: imageUrl,
      }, config);
      
      setShowForm(false);
      setForm({ title: '', description: '', price: '', category: '', imageFile: null });
      fetchMyServices();
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
    }
  };

  // Perbaikan 3: Menghapus handleImageUpload yang unused atau menggunakannya jika perlu.
  // Karena handleSubmit sudah menangani upload, fungsi ini di-comment atau dihapus untuk kebersihan kode.
  
const handleOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    console.log("Token saat klik:", token); // debug
    await API.put(`/orders/${orderId}/status?status=${status}`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchMyOrders();
  } catch (err) {
    console.error("Error response:", err.response?.status, err.response?.data);
  }
};

  const totalUnread = unreadMessages.length;
  const formRef = useRef(null);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const topService = useMemo(() => {
    const count = orders.reduce((acc, order) => {
      const title = order.service?.title;
      if (!title) return acc;
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});
    const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    return best ? { title: best[0], count: best[1] } : null;
  }, [orders]);

  const orderSummary = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const accepted = orders.filter((o) => o.status === 'ACCEPTED').length;
    const rejected = orders.filter((o) => o.status === 'REJECTED').length;
    const completed = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'COMPLETED_BY_FREELANCER').length;
    return { pending, accepted, rejected, completed };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'ALL') return orders;
    if (orderFilter === 'COMPLETED') {
      return orders.filter((o) => o.status === 'COMPLETED' || o.status === 'COMPLETED_BY_FREELANCER');
    }
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  useEffect(() => {
    setSelectedOrders((prevSelected) => prevSelected.filter((id) => orders.some((o) => o.id === id)));
  }, [orders]);

  const handleFilterChange = (filter, idx) => {
    setOrderFilter(filter);
    setFilterIndex(idx);
    setSelectedOrders([]);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
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
          <span className="text-2xl font-bold tracking-wider">FreelanceHub</span>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-sm">Halo, {user?.name}!</span>
            <button onClick={() => navigate('/messages')} className="relative text-xl hover:opacity-70 transition">
              ✈️
              {unreadMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadMessages.length}
                </span>
              )}
            </button>
            <button onClick={() => navigate('/edit-profile')} className="text-gray-400 hover:text-white text-sm transition">
              Edit Profile
            </button>
            <button onClick={handleLogout} className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-sm hover:border-white hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">Kelola services, orders, dan revenue Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border border-emerald-800/40 rounded-3xl p-6 hover:border-emerald-600/50 transition shadow-sm hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-400 text-sm font-medium">Total Pemasukan</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold">Rp {stats.totalEarnings.toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-500 mt-2">Dari {orders.filter(o => o.status === 'COMPLETED').length} order selesai</p>
          </div>

          {/* Unread Messages */}
          <div className="bg-gradient-to-br from-sky-950/30 to-sky-950/10 border border-sky-800/40 rounded-3xl p-6 hover:border-sky-600/50 transition shadow-sm hover:shadow-sky-500/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sky-400 text-sm font-medium">Pesan Belum Dibaca</p>
              <span className="text-2xl">📬</span>
            </div>
            <p className="text-3xl font-bold">{totalUnread}</p>
            <p className="text-xs text-slate-500 mt-2">Segera balas agar klien percaya</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-purple-950/30 to-purple-950/10 border border-purple-800/40 rounded-3xl p-6 hover:border-purple-600/50 transition shadow-sm hover:shadow-purple-500/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-400 text-sm font-medium">Tingkat Penyelesaian</p>
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">{stats.completionRate}%</p>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{width: `${stats.completionRate}%`}}></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Dari total orders</p>
          </div>

          {/* Active Orders */}
          <div className="bg-gradient-to-br from-orange-950/30 to-orange-950/10 border border-orange-800/40 rounded-3xl p-6 hover:border-orange-600/50 transition shadow-sm hover:shadow-orange-500/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-400 text-sm font-medium">Order Aktif</p>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-3xl font-bold">{stats.activeOrders}</p>
            <p className="text-xs text-slate-500 mt-2">Pending & Accepted</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="group bg-[#14202f] border border-[#1f3343] rounded-3xl p-6 text-left hover:-translate-y-1 transition shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-sm">Quick Action</p>
                <h3 className="text-xl font-semibold text-white">Tambah Service</h3>
              </div>
              <span className="text-3xl">➕</span>
            </div>
            <p className="text-slate-500 text-sm">Tambahkan layanan baru dalam hitungan detik.</p>
          </button>

          <button
            onClick={() => document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-[#14202f] border border-[#1f3343] rounded-3xl p-6 text-left hover:-translate-y-1 transition shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-slate-400 text-sm">Quick Action</p>
                <h3 className="text-xl font-semibold text-white">Lihat Orders</h3>
              </div>
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-slate-500 text-sm">Kelola order yang sedang berjalan dan selesaikan dengan cepat.</p>
          </button>
        </div>

        {/* STATS - SECONDARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Rating */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Rating</p>
              <span className="text-xl">⭐</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold">{stats.rating.toFixed(1)}</p>
              <p className="text-gray-500 text-sm">/ 5.0</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">Dari {stats.totalReviews} reviews</p>
          </div>

          {/* Total Services */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Total Services</p>
              <span className="text-xl">💼</span>
            </div>
            <p className="text-4xl font-bold">{services.length}</p>
            <p className="text-xs text-gray-600 mt-2">Services aktif</p>
          </div>

          {/* Total Clients */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Total Klien</p>
              <span className="text-xl">👥</span>
            </div>
            <p className="text-4xl font-bold">{stats.totalClients}</p>
            <p className="text-xs text-gray-600 mt-2">Klien unik</p>
            {topService && (
              <p className="text-xs text-slate-500 mt-3">Best seller: {topService.title} ({topService.count} order)</p>
            )}
          </div>
        </div>

        {/* MY SERVICES */}
        {/* FORM */}
        {showForm && (
          <div ref={formRef} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-6">Tambah Service Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Service Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full bg-black border border-zinc-700 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-white transition" />
              <div>
                <p className="text-sm text-slate-400 mb-3">Kategori</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setForm({ ...form, category })}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${form.category === category ? 'bg-green-500 border-green-400 text-slate-950 shadow-lg' : 'bg-zinc-950 border-zinc-700 text-slate-300 hover:border-slate-500 hover:bg-zinc-900'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Pilih kategori yang paling cocok untuk jasa Anda.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm text-slate-400">Harga Paket</label>
                  <span className="text-xs text-slate-500">Rp {formattedPrice || '0'}</span>
                </div>
                <div className="flex rounded-3xl overflow-hidden border border-zinc-700 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20">
                  <span className="bg-zinc-950 px-4 py-3 text-slate-400 flex items-center">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="150000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full bg-black px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {priceOptions.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setForm({ ...form, price })}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${Number(form.price) === price ? 'bg-green-500 text-slate-950 shadow-lg' : 'bg-zinc-950 border border-zinc-700 text-slate-300 hover:bg-zinc-900'}`}
                    >
                      Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(price)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Pilih cepat atau masukkan harga paket sesuai kebutuhan.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload Foto Jasa</label>
                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:border-white transition" />
              </div>
              {form.imageFile && <img src={URL.createObjectURL(form.imageFile)} alt="preview" className="w-full h-40 object-cover rounded-xl" />}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition">Upload</button>
                <button type="button" onClick={() => setShowForm(false)} className="border border-zinc-700 text-gray-300 px-8 py-3 rounded-full hover:border-white hover:text-white transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* SERVICES LIST */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin">
              <p className="text-center text-gray-500 text-lg">Loading...</p>
            </div>
          </div>
        ) : services.length === 0 ? 
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <p className="text-5xl mb-4">💼</p>
            <p className="text-gray-500 text-lg mb-2">No services yet</p>
            <p className="text-gray-600 text-sm">Add your first service to start earning!</p>
          </div> : 
          <div>
            <p className="text-gray-400 text-sm mb-4">{services.length} active services</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {services.map((service) => (
                <div key={service.id} onClick={() => navigate(`/service/${service.id}`)} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition group cursor-pointer">
                  {service.imageUrl && (
                    <img src={service.imageUrl} alt={service.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                  )}
                  <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full inline-block mb-2">{service.category || 'General'}</span>
                  <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-blue-400 transition">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-white font-bold text-lg">Rp {service.price?.toLocaleString('id-ID')}</p>
                    <span className="text-xs text-gray-600">Jasa aktif</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }

        {/* ORDERS */}
        <div id="order-section" className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Incoming Orders</h2>
              <p className="text-slate-400 mt-1">Review, terima, atau selesaikan order dengan cepat.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">Total {orders.length}</span>
              <span className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 text-xs px-3 py-1 rounded-full">Pending {orderSummary.pending}</span>
              <span className="bg-green-900/20 border border-green-700 text-green-300 text-xs px-3 py-1 rounded-full">Accepted {orderSummary.accepted}</span>
              <span className="bg-red-900/20 border border-red-700 text-red-300 text-xs px-3 py-1 rounded-full">Rejected {orderSummary.rejected}</span>
              <span className="bg-blue-900/20 border border-blue-700 text-blue-300 text-xs px-3 py-1 rounded-full">Completed {orderSummary.completed}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((filter, idx) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter, idx)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${orderFilter === filter ? 'bg-slate-100 text-slate-950' : 'bg-zinc-900 border border-zinc-700 text-slate-300 hover:bg-zinc-800'}`}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

            {selectedOrders.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
              <p className="text-sm text-slate-300">{selectedOrders.length} order selected</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedOrders([])} className="border border-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm hover:border-slate-500 hover:text-white transition">
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Clear All removed per request */}
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${filterIndex * 100}%)` }}>
              {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((filter) => {
                const list = filter === 'ALL'
                  ? orders
                  : filter === 'COMPLETED'
                    ? orders.filter((o) => o.status === 'COMPLETED' || o.status === 'COMPLETED_BY_FREELANCER')
                    : orders.filter((o) => o.status === filter);

                return (
                  <div key={filter} className="w-full min-w-full pr-4">
                    {list.length === 0 ? (
                      <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-3xl mb-12">
                        <p className="text-5xl mb-4">📦</p>
                        <p className="text-gray-500 text-lg mb-2">No orders in "{filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}"</p>
                        <p className="text-gray-600 text-sm">Coba ganti filter atau tambahkan service baru.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-12">
                        {list.map((order) => (
                          <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-6 hover:border-zinc-600 transition shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.includes(order.id)}
                                  onChange={() => toggleOrderSelection(order.id)}
                                  className="h-4 w-4 rounded border-slate-600 text-green-500 focus:ring-green-500"
                                />
                                <div className="space-y-3 max-w-2xl">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <p className="font-semibold text-white text-xl">{order.service?.title}</p>
                                    <span className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1">{order.service?.category || 'General'}</span>
                                  </div>
                                  <p className="text-sm text-slate-400">👤 {order.client?.name} · 📅 {new Date(order.createdAt).toLocaleDateString('id-ID')} · Rp {order.price?.toLocaleString('id-ID')}</p>
                                  {order.service?.description && (
                                    <p className="text-sm text-slate-500 line-clamp-2">{order.service.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 min-w-[220px]">
                                <span className={`inline-flex justify-center px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  order.status === 'ACCEPTED' ? 'bg-green-900/20 text-green-300 border border-green-700' :
                                  order.status === 'COMPLETED_BY_FREELANCER' ? 'bg-blue-900/20 text-blue-300 border border-blue-700' :
                                  order.status === 'COMPLETED' ? 'bg-purple-900/20 text-purple-300 border border-purple-700' : 
                                  order.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700' :
                                  'bg-red-900/20 text-red-300 border border-red-700'
                                }`}>
                                  {order.status}
                                </span>

                                <div className="grid grid-cols-1 gap-2">
                                  {order.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => handleOrderStatus(order.id, 'ACCEPTED')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-lg"
                                      >
                                        ✅ Accept
                                      </button>
                                      <button
                                        onClick={() => handleOrderStatus(order.id, 'REJECTED')}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-lg"
                                      >
                                        ❌ Reject
                                      </button>
                                    </>
                                  )}
                                  {order.status === 'ACCEPTED' && (
                                    <button
                                      onClick={() => handleOrderStatus(order.id, 'COMPLETED_BY_FREELANCER')}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-lg"
                                    >
                                      ✅ Mark Complete
                                    </button>
                                  )}

                                  {(order.status === 'ACCEPTED' || order.status === 'COMPLETED_BY_FREELANCER' || order.status === 'COMPLETED') && (
  <button
    onClick={() => navigate(`/order-files/${order.id}`)}
    className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-sm hover:border-white hover:text-white transition"
  >
    📁 File Proyek
  </button>
)}

                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((f, i) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f, i)}
                className={`w-3 h-3 rounded-full transition ${filterIndex === i ? 'bg-slate-100' : 'bg-zinc-800'}`}
                aria-label={`show-${f}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;