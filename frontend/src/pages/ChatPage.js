import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ChatPage = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markAsRead();
    const interval = setInterval(() => {
      fetchMessages();
      markAsRead();
    }, 3000);
    return () => clearInterval(interval);
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${receiverId}`);
      setMessages(res.data);
      if (res.data.length > 0) {
        const other = res.data[0].sender.id === Number(receiverId)
          ? res.data[0].sender
          : res.data[0].receiver;
        setReceiver(other);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async () => {
    try {
      await API.put(`/messages/read/${receiverId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await API.post(`/messages/${receiverId}`, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-green-600 font-semibold">← Kembali</button>
        <h2 className="font-bold text-gray-800">Chat dengan {receiver?.name || '...'}</h2>
        <span className="text-gray-500 text-sm">{user?.name}</span>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">Belum ada pesan. Mulai percakapan!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender?.email === user?.email;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    isMine ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition font-semibold">
            ✈️ Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;