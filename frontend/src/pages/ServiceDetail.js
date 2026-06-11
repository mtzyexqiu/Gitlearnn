import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';


const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const reviewRef = useRef(null);
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [successMsg, setSuccessMsg] = useState('');
  const [myOrder, setMyOrder] = useState(undefined);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
const [balance, setBalance] = useState(0);
  const [myOrderAsFreelancer, setMyOrderAsFreelancer] = useState(null);
  const [orderFiles, setOrderFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchService();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (user?.role === 'CLIENT') fetchMyOrder();
    if (user?.role === 'FREELANCER') fetchMyOrderAsFreelancer();
  }, [user]);

  const fetchBalance = async () => {
  try {
    const res = await API.get('/users/me');
    setBalance(res.data.balance || 0);
  } catch (err) {
    console.error(err);
  }
};

  const fetchMyOrder = async () => {
    try {
      const res = await API.get('/orders/client');
      const order = res.data.find(o => o.service?.id === Number(id));
      setMyOrder(order || null);
      if (order) fetchOrderFiles(order.id);
    } catch (err) {
      setMyOrder(null);
    }
  };

  const fetchMyOrderAsFreelancer = async () => {
    try {
      const res = await API.get('/orders/freelancer');
      const order = res.data.find(o => o.service?.id === Number(id));
      setMyOrderAsFreelancer(order || null);
      if (order) fetchOrderFiles(order.id);
    } catch (err) {
      setMyOrderAsFreelancer(null);
    }
  };

  const fetchOrderFiles = async (orderId) => {
    try {
      const res = await API.get(`/order-files/${orderId}`);
      setOrderFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchService = async () => {
    try {
      const res = await API.get(`/services/${id}`);
      setService(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrder = async () => {
    try {
      await API.post(`/orders/${id}`, { offeredPrice: offeredPrice || null });
      setSuccessMsg('Order sent successfully!');
      fetchMyOrder();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async () => {
    try {
      await API.post(`/reviews/${id}`, { rating, comment });
      setComment('');
      setSuccessMsg('Review submitted!');
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async () => {
    const orderId = myOrder?.id || myOrderAsFreelancer?.id;
    if (!uploadFile || !orderId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await API.post(`/order-files/${orderId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      fetchOrderFiles(orderId);
      setSuccessMsg('File berhasil diupload!');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!service) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  const currentOffer = offeredPrice !== '' ? Number(offeredPrice) : service.price;
  const hasNoOrder = myOrder === null;
  const isPending = myOrder?.status === 'PENDING';
  const isAccepted = myOrder?.status === 'ACCEPTED';
  const isCompletedByFreelancer = myOrder?.status === 'COMPLETED_BY_FREELANCER';
  const isCompleted = myOrder?.status === 'COMPLETED';
  const isLoading = myOrder === undefined;

  const FileList = ({ showUpload, orderId }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
      <h3 className="text-xl font-bold mb-6">📁 File Proyek</h3>
      {orderFiles.length === 0 ? (
        <p className="text-gray-500 text-sm mb-4">Belum ada file yang diupload.</p>
      ) : (
        <div className="space-y-3 mb-6">
          {orderFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-black border border-zinc-700 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-white text-sm font-semibold">{file.fileName}</p>
                  <p className="text-gray-500 text-xs">Uploaded by {file.uploader?.name}</p>
                </div>
              </div>
              <button
                onClick={() => window.open(file.fileUrl, '_blank', 'noopener,noreferrer')}
                className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-xs hover:border-white hover:text-white transition"
              >
                👁️ Lihat
              </button>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <>
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-gray-400 mb-4"
          />
          {uploadFile && (
            <p className="text-gray-400 text-sm mb-4">File: {uploadFile.name}</p>
          )}
          <button
            onClick={handleFileUpload}
            disabled={uploading || !uploadFile}
            className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '⬆️ Upload File'}
          </button>
        </>
      )}
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
          <span className="text-lg font-bold">Service Detail</span>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {successMsg && (
          <div className="bg-green-900/50 border border-green-800 text-green-400 p-4 rounded-2xl mb-6 text-sm">
            {successMsg}
          </div>
        )}

        {/* SERVICE INFO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
          <div className="rounded-2xl h-48 overflow-hidden mb-6">
            {service.imageUrl ? (
              <img
                src={service.imageUrl.startsWith('http') ? service.imageUrl : `http://localhost:8080/api/files/${service.imageUrl.split('/').pop()}`}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-6xl">💼</div>
            )}
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {service.category?.split(',').map((cat, i) => (
                  <span key={i} onClick={() => navigate(`/client/dashboard?category=${cat.trim()}`)}
                    className="text-sm text-gray-400 hover:text-white cursor-pointer transition">
                    #{cat.trim()}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl font-bold mb-1">{service.title}</h2>
              <p onClick={() => navigate(`/profile/${service.freelancer?.id}`)}
                className="text-gray-400 text-sm cursor-pointer hover:text-white transition">
                by {service.freelancer?.name}
              </p>
            </div>
            <p className="text-2xl font-bold">Rp {service.price?.toLocaleString()}</p>
          </div>
          <p className="text-gray-400 leading-relaxed">{service.description}</p>
        </div>

        {/* ORDER */}
        {user?.role === 'CLIENT' && !isLoading && (hasNoOrder || isPending) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
            <h3 className="text-xl font-bold mb-2">Place Order</h3>
            <p className="text-gray-500 text-sm mb-6">Geser slider untuk menawar harga.</p>

            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400 text-sm">Listed Price</p>
              <p className="text-white font-bold text-lg">Rp {service.price?.toLocaleString()}</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-sm">Your Offer</p>
                <p className="text-white font-bold">
                  {currentOffer < service.price ? `-${Math.round((1 - currentOffer / service.price) * 100)}%` : 'Full Price'}
                </p>
              </div>
              <input type="range"
                min={Math.round(service.price * 0.5)} max={service.price}
                step={Math.round(service.price * 0.01) || 1} value={currentOffer}
                onChange={(e) => setOfferedPrice(Number(e.target.value))}
                className="w-full accent-white cursor-pointer mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-50% Rp {Math.round(service.price * 0.5).toLocaleString()}</span>
                <span>Full Rp {service.price?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center bg-black border border-zinc-700 rounded-2xl px-4 py-4 focus-within:border-white transition mb-4">
              <span className="text-gray-400 font-semibold mr-2">Rp</span>
              <input type="number" value={currentOffer}
                onChange={(e) => setOfferedPrice(Number(e.target.value))}
                className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {[0.7, 0.8, 0.9, 1.0].map((multiplier) => {
                const offerPrice = Math.round(service.price * multiplier);
                const label = multiplier === 1.0 ? 'Full' : `-${Math.round((1 - multiplier) * 100)}%`;
                return (
                  <button key={multiplier} type="button" onClick={() => setOfferedPrice(offerPrice)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentOffer === offerPrice ? 'bg-white text-black' : 'bg-zinc-800 border border-zinc-700 text-gray-400 hover:border-white hover:text-white'}`}>
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="bg-black rounded-2xl p-4 mb-6 flex justify-between items-center">
              <p className="text-gray-400 text-sm">You'll pay</p>
              <p className="text-white font-bold text-xl">Rp {currentOffer.toLocaleString()}</p>
            </div>

            <div className="flex gap-3">
<button
  onClick={() => hasNoOrder && setShowPaymentPopup(true)}
  className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition"
>
  {hasNoOrder ? 'Order Now' : '✅ Order Sent'}
</button>
              <button onClick={() => navigate(`/chat/${service.freelancer?.id}`)}
                className="flex-1 border border-zinc-700 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition">
                💬 Chat
              </button>
            </div>
          </div>
        )}

        {/* KONFIRMASI CLIENT */}
        {user?.role === 'CLIENT' && isCompletedByFreelancer && (
          <div className="bg-blue-900/30 border border-blue-800 rounded-3xl p-8 mb-6">
            <h3 className="text-xl font-bold mb-2">Konfirmasi Penyelesaian</h3>
            <p className="text-gray-400 text-sm mb-6">Freelancer telah menyelesaikan pesanan kamu. Apakah kamu sudah puas?</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
  try {
    await API.put(`/orders/${myOrder.id}/status?status=COMPLETED`);
    setMyOrder({ ...myOrder, status: 'COMPLETED' });
    setSuccessMsg('Order completed! Silakan berikan rating.');
    setTimeout(() => {
      reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  } catch (err) {
    console.error(err);
  }
}}
                className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition">
                ✅ Ya, Sudah Selesai
              </button>
              <button onClick={() => navigate(`/chat/${service.freelancer?.id}`)}
                className="flex-1 border border-zinc-700 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition">
                💬 Diskusi
              </button>
            </div>
          </div>
        )}

        {/* REVIEW FORM */}
{user?.role === 'CLIENT' && isCompleted && (
  <div ref={reviewRef} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
            <h3 className="text-xl font-bold mb-6">Leave a Review</h3>
            <div className="flex gap-3 mb-6">
              {[1,2,3,4,5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="transition">
                  <svg width="36" height="36" viewBox="0 0 24 24"
                    fill={star <= rating ? '#facc15' : 'none'}
                    stroke={star <= rating ? '#facc15' : '#52525b'}
                    strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>
              ))}
            </div>
            <textarea placeholder="Write your review..." value={comment}
              onChange={(e) => setComment(e.target.value)} rows={3}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition mb-4"
            />
            <button onClick={handleReview} className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition">
              Submit Review
            </button>
          </div>
        )}

        {/* REVIEWS LIST */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-zinc-800 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">{review.client?.name}</p>
                    <span className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* PAYMENT POPUP */}
{showPaymentPopup && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">
      <h3 className="text-xl font-bold mb-2">Konfirmasi Pembayaran</h3>
      <p className="text-gray-400 text-sm mb-6">Bayar 50% di awal untuk memulai pesanan.</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-400 text-sm">Harga Jasa</p>
          <p className="text-white font-semibold">Rp {currentOffer.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-400 text-sm">Bayar Sekarang (50%)</p>
          <p className="text-white font-bold">Rp {Math.round(currentOffer * 0.5).toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-400 text-sm">Sisa Bayar Nanti (50%)</p>
          <p className="text-gray-400">Rp {Math.round(currentOffer * 0.5).toLocaleString()}</p>
        </div>
        <div className="border-t border-zinc-700 pt-3 flex justify-between">
          <p className="text-gray-400 text-sm">Saldo Kamu</p>
          <p className={`font-semibold ${balance >= currentOffer * 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            Rp {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {balance < currentOffer * 0.5 ? (
        <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 mb-4">
          <p className="text-red-400 text-sm">Saldo tidak cukup! Top up dulu di halaman profil.</p>
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={async () => {
            await handleOrder();
            setShowPaymentPopup(false);
          }}
          disabled={balance < currentOffer * 0.5}
          className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          💳 Bayar Rp {Math.round(currentOffer * 0.5).toLocaleString()}
        </button>
        <button
          onClick={() => setShowPaymentPopup(false)}
          className="flex-1 border border-zinc-700 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ServiceDetail;