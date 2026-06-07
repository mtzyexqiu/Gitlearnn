import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchFiles();
    fetchOrder();
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

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await API.post(`/order-files/${orderId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      setSuccessMsg('File berhasil diupload!');
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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
                  <a
                    href={file.fileUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-black px-4 py-2 rounded-full text-xs font-semibold hover:bg-gray-200 transition"
                  >
                    ⬇️ Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderFilesPage;