import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const OrderFilesPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderFiles, setOrderFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const reviewRef = useRef(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
const [balance, setBalance] = useState(0);

useEffect(() => {
  fetchFiles();
  fetchOrder();
  fetchBalance();
}, []);

  const fetchFiles = async () => {
    try {
      const res = await API.get(`/order-files/${orderId}`);
      setOrderFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrder = async () => {
    try {
      if (user?.role === 'CLIENT') {
        const res = await API.get('/orders/client');
        const found = res.data.find(o => o.id === Number(orderId));
        setOrder(found);
      } else {
        const res = await API.get('/orders/freelancer');
        const found = res.data.find(o => o.id === Number(orderId));
        setOrder(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBalance = async () => {
  try {
    const res = await API.get('/users/me');
    setBalance(res.data.balance || 0);
  } catch (err) {
    console.error(err);
  }
};

  const handleViewFile = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('file', uploadFile);
    await API.post(`/order-files/${orderId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await API.put(`/orders/${orderId}/status?status=FILE_SENT`);
    setOrder({ ...order, status: 'FILE_SENT' });
    setUploadFile(null);
    setSuccessMsg('File berhasil diupload! Client akan menerima notifikasi.');
    fetchFiles();
  } catch (err) {
    console.error(err);
  } finally {
    setUploading(false);
  }
};

const handleConfirmComplete = async () => {
  try {
    await API.put(`/orders/${orderId}/status?status=COMPLETED_BY_FREELANCER`);
    setOrder({ ...order, status: 'COMPLETED_BY_FREELANCER' });
    setShowPaymentPopup(true);
  } catch (err) {
    console.error(err);
  }
};

  const handleReview = async () => {
    try {
      await API.post(`/reviews/${order?.service?.id}`, { rating, comment });
      setComment('');
      setSuccessMsg('Review berhasil dikirim! Terima kasih.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition text-sm">
            ← Back
          </button>
          <span className="text-lg font-bold">📁 File Proyek</span>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        {/* ORDER INFO */}
        {order && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
            <p className="text-gray-400 text-sm mb-1">Order</p>
            <p className="font-bold text-white text-lg">{order.service?.title}</p>
            <p className="text-gray-500 text-sm mt-1">
              {user?.role === 'CLIENT' ? `Freelancer: ${order.service?.freelancer?.name}` : `Client: ${order.client?.name}`}
            </p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === 'ACCEPTED' ? 'bg-green-900/50 text-green-400 border border-green-800' :
              order.status === 'COMPLETED_BY_FREELANCER' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
              order.status === 'COMPLETED' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' :
              'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-900/50 border border-green-800 text-green-400 p-4 rounded-2xl mb-6 text-sm">
            {successMsg}
          </div>
        )}

        {/* UPLOAD - FREELANCER ONLY */}
        {user?.role === 'FREELANCER' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
            <h3 className="font-bold text-white mb-4">⬆️ Upload File</h3>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-gray-400 mb-4"
            />
            {uploadFile && (
              <p className="text-gray-400 text-sm mb-4">📄 {uploadFile.name}</p>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading || !uploadFile}
              className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '⬆️ Upload File'}
            </button>
          </div>
        )}

        {/* FILE LIST */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
          <h3 className="font-bold text-white mb-4">File ({orderFiles.length})</h3>
          {orderFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada file yang diupload.</p>
          ) : (
            <div className="space-y-3">
              {orderFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-black border border-zinc-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{file.fileName}</p>
                      <p className="text-gray-500 text-xs">
                        Uploaded by {file.uploader?.name} · {new Date(file.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewFile(file.fileUrl)}
                    className="border border-zinc-700 text-gray-300 px-4 py-2 rounded-full text-xs hover:border-white hover:text-white transition"
                  >
                    👁️ Lihat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KONFIRMASI CLIENT */}
{user?.role === 'CLIENT' && order?.status === 'FILE_SENT' && (
          <div className="bg-blue-900/30 border border-blue-800 rounded-3xl p-8 mb-6">
            <h3 className="text-xl font-bold mb-2">Konfirmasi Penyelesaian</h3>
            <p className="text-gray-400 text-sm mb-6">Freelancer telah menyelesaikan pesanan kamu. Apakah kamu sudah puas?</p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmComplete}
                className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                ✅ Ya, Sudah Selesai
              </button>
              <button
                onClick={() => navigate(`/chat/${order.service?.freelancer?.id}`)}
                className="flex-1 border border-zinc-700 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition"
              >
                💬 Diskusi
              </button>
            </div>
          </div>
        )}

        {/* REVIEW FORM */}
        {user?.role === 'CLIENT' && order?.status === 'COMPLETED' && (
          <div ref={reviewRef} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-6">
            <h3 className="text-xl font-bold mb-6">⭐ Leave a Review</h3>
            <div className="flex gap-3 mb-6">
              {[1,2,3,4,5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="transition">
                  <svg width="36" height="36" viewBox="0 0 24 24"
                    fill={star <= rating ? '#facc15' : 'none'}
                    stroke={star <= rating ? '#facc15' : '#52525b'}
                    strokeWidth="1.5"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                </button>
              ))}
            </div>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition mb-4"
            />
            <button onClick={handleReview} className="w-full bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition">
              Submit Review
            </button>
          </div>
        )}

      </div>

      {/* PAYMENT POPUP SISA */}
{showPaymentPopup && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">
      <h3 className="text-xl font-bold mb-2">💳 Pembayaran Sisa</h3>
      <p className="text-gray-400 text-sm mb-6">Bayar sisa 50% untuk menyelesaikan pesanan.</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-400 text-sm">Sisa Pembayaran (50%)</p>
          <p className="text-white font-bold">Rp {Math.round((order?.price || 0) * 0.5).toLocaleString()}</p>
        </div>
        <div className="border-t border-zinc-700 pt-3 flex justify-between">
          <p className="text-gray-400 text-sm">Saldo Kamu</p>
          <p className={`font-semibold ${balance >= (order?.price || 0) * 0.5 ? 'text-green-400' : 'text-red-400'}`}>
            Rp {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {balance < (order?.price || 0) * 0.5 ? (
        <div className="bg-red-900/30 border border-red-800 rounded-2xl p-4 mb-4">
          <p className="text-red-400 text-sm mb-3">Saldo tidak cukup!</p>
          <button
            onClick={() => { setShowPaymentPopup(false); navigate('/topup'); }}
            className="w-full bg-white text-black py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            💳 Top Up Sekarang
          </button>
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          onClick={async () => {
            try {
              await API.post(`/orders/${orderId}/pay-remaining`);
              setOrder({ ...order, status: 'COMPLETED_BY_FREELANCER' });
              setShowPaymentPopup(false);
              setSuccessMsg('Pembayaran berhasil! Menunggu freelancer konfirmasi.');
              fetchBalance();
            } catch (err) {
              console.error(err);
            }
          }}
          disabled={balance < (order?.price || 0) * 0.5}
          className="flex-1 bg-white text-black py-3 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          💳 Bayar Rp {Math.round((order?.price || 0) * 0.5).toLocaleString()}
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

export default OrderFilesPage;