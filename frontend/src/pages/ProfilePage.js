import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const profileRes = await API.get(`/users/${id}`);
      setProfile(profileRes.data);
      const servicesRes = await API.get(`/services/freelancer/${id}`);
      setServices(servicesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <span className="text-lg font-bold">Profile</span>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* PROFILE HEADER */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center text-3xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile?.name}</h1>
              <p className="text-gray-400 mt-1">{profile?.role}</p>
              {profile?.bio && <p className="text-gray-400 text-sm mt-2">{profile?.bio}</p>}
            </div>
            {user?.role === 'CLIENT' && (
              <button
                onClick={() => navigate(`/chat/${id}`)}
                className="ml-auto bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                💬 Chat
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-3xl font-bold">{services.length}</p>
              <p className="text-gray-500 text-sm mt-1">Services</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{profile?.rating || '-'}</p>
              <p className="text-gray-500 text-sm mt-1">Rating ⭐</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{profile?.totalOrders || 0}</p>
              <p className="text-gray-500 text-sm mt-1">Orders Done</p>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <h2 className="text-2xl font-bold mb-6">Services</h2>
        {services.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <p className="text-gray-500">No services yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/service/${service.id}`)}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 cursor-pointer hover:border-zinc-600 transition"
              >
                <span className="text-xs text-gray-500 bg-zinc-800 px-3 py-1 rounded-full">
                  {service.category || 'General'}
                </span>
                <h3 className="font-semibold text-white text-lg mt-3 mb-1">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                <p className="text-white font-bold">Rp {service.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;