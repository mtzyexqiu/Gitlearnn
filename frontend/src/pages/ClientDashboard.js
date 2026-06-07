import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const categories = ['All','Web Development','UI/UX Design','Mobile App','Graphic Design','Digital Marketing','Video Editing','Content Writing'];

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(async (cat) => {
    try {
      setLoading(true);
      const res = await API.get(`/services/category?category=${encodeURIComponent(cat)}`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await API.get('/messages/unread');
      setUnreadCount(res.data.length);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setActiveCategory(cat);
      fetchByCategory(cat);
    } else {
      fetchServices();
    }
    fetchUnread();
  }, [location.search, fetchServices, fetchByCategory, fetchUnread]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await API.get(`/services/search?keyword=${search}`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryFilter = async (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      fetchServices();
    } else {
      fetchByCategory(category);
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
          <span className="text-2xl font-bold tracking-wider">FreelanceHub</span>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-sm">Halo, {user?.name}!</span>
            <button onClick={() => navigate('/messages')} className="relative text-xl hover:opacity-70 transition">
              ✈️
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate('/my-orders')} className="text-gray-400 hover:text-white text-sm transition">
              My Orders
            </button>
            <button onClick={handleLogout} className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-sm hover:border-white hover:text-white transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">

        {/* HEADER + SEARCH */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-400 mb-6">Find the perfect freelancer for your next project.</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for any service..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-full px-6 py-3 text-white focus:outline-none focus:border-white transition"
            />
            <button type="submit" className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
              Search
            </button>
          </form>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 border border-zinc-700 text-gray-400 hover:border-white hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SERVICES GRID */}
        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading...</p>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500">No services found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-zinc-600 transition"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="h-44 bg-zinc-800 overflow-hidden">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">💼</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">💼</div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${service.freelancer?.id}`); }}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {service.freelancer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-500 text-xs group-hover:text-white group-hover:underline transition">
                        {service.freelancer?.name}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-gray-500 bg-zinc-800 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                      {service.category?.split(',')[0]?.trim() || 'General'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm mb-3 line-clamp-2 leading-snug">
                    {service.title}
                  </h3>

                  <div className="pt-3 border-t border-zinc-800">
                    <p className="text-xs text-gray-500">Starting at</p>
                    <p className="text-white font-bold">Rp {service.price?.toLocaleString()}</p>
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

export default ClientDashboard;