import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const MessagesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [unread, setUnread] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchContacts();
    fetchUnread();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markAsRead(selectedContact.id);
      const interval = setInterval(() => {
        fetchMessages(selectedContact.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await API.get('/messages/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await API.get('/messages/unread');
      setUnread(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await API.get(`/messages/${contactId}`);
      setMessages(res.data);

      // cari service dari order terkait
      try {
        const orderRes = await API.get('/orders/client');
        const related = orderRes.data.find(o => o.service?.freelancer?.id === contactId);
        if (related) setSelectedService(related.service);
      } catch {}

    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await API.put(`/messages/read/${contactId}`);
      setUnread(prev => prev.filter(m => m.sender?.id !== contactId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setSelectedService(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await API.post(`/messages/${selectedContact.id}`, { content: newMessage });
      setNewMessage('');
      fetchMessages(selectedContact.id);
    } catch (err) {
      console.error(err);
    }
  };

  const getUnreadCount = (contactId) => {
    return unread.filter(m => m.sender?.id === contactId).length;
  };

  return (
    <div className="h-screen bg-[#0b131c] text-slate-100 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-[#111c28] border-b border-[#183044] px-6 py-4 flex justify-between items-center shadow-[0_1px_0_rgba(148,163,184,0.08)]">
        <button onClick={() => navigate(-1)} className="text-slate-300 hover:text-white font-semibold transition">← Kembali</button>
        <h1 className="text-xl font-semibold text-white">💬 Pesan</h1>
        <span className="text-slate-400 text-sm">{user?.name}</span>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* KIRI - KONTAK */}
        <div className="w-1/3 bg-[#111c28] border-r border-[#183044] overflow-y-auto messages-scroll">
          <div className="p-5 border-b border-[#183044]">
            <h2 className="font-semibold text-slate-100 text-base">Kontak</h2>
            <p className="text-xs text-slate-400 mt-1">Pilih percakapan untuk melihat chat.</p>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center text-slate-500 text-sm p-6">Belum ada kontak.</div>
          ) : (
            contacts.map((contact) => {
              const unreadCount = getUnreadCount(contact.id);
              const isSelected = selectedContact?.id === contact.id;
              return (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left flex items-center gap-3 px-5 py-4 transition ${isSelected ? 'bg-[#193145] border-l-4 border-green-500' : 'hover:bg-[#142233]'} ${unreadCount ? 'shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]' : ''}`}
                >
                  <div className="w-11 h-11 bg-[#1f3343] rounded-full flex items-center justify-center text-green-400 font-semibold text-base flex-shrink-0">
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 text-sm truncate">{contact.name}</p>
                    <p className="text-xs text-slate-400 truncate">{contact.role}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-green-500 text-slate-950 text-[11px] font-semibold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* KANAN - CHAT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-[#142233] flex items-center justify-center text-4xl">💬</div>
                <p className="text-slate-300 text-lg font-medium">Pilih kontak untuk mulai chat</p>
                <p className="text-slate-500 mt-2 text-sm">Tampilan ini akan mirip seperti chat desktop WhatsApp.</p>
              </div>
            </div>
          ) : (
            <>
              {/* HEADER CHAT */}
              <div className="bg-[#111c28] border-b border-[#183044] px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
                <div className="w-12 h-12 bg-[#1f3444] rounded-full flex items-center justify-center text-green-400 font-semibold text-lg">
                  {selectedContact.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-base">{selectedContact.name}</p>
                  <p className="text-xs text-slate-400">{selectedContact.role}</p>
                </div>
              </div>

              {/* CARD JASA */}
              {selectedService && (
                <div className="mx-6 mt-4 bg-[#142233] border border-[#183044] rounded-3xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-green-400 font-semibold mb-1">💼 Terkait Jasa</p>
                    <p className="font-semibold text-slate-100">{selectedService.title}</p>
                    <p className="text-sm text-slate-400">{selectedService.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">Rp {selectedService.price?.toLocaleString()}</p>
                    <button
                      onClick={() => navigate(`/service/${selectedService.id}`)}
                      className="text-xs text-green-400 hover:underline mt-1"
                    >
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              )}

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 messages-scroll bg-[#0b131c]">
                {messages.map((msg) => {
                  const isMine = msg.sender?.email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-3xl px-4 py-3 text-sm shadow-sm max-w-[72%] ${isMine ? 'bg-green-600 text-white' : 'bg-[#11202f] text-slate-100 border border-[#183044]'}`}>
                        <p className="whitespace-pre-line">{msg.content}</p>
                        <p className={`text-[11px] mt-2 ${isMine ? 'text-green-200' : 'text-slate-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* INPUT */}
              <div className="bg-[#111c28] border-t border-[#183044] px-6 py-4">
                <form onSubmit={handleSend} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 bg-[#142233] border border-[#1f3042] rounded-full px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button type="submit" className="bg-green-500 text-slate-950 px-5 py-3 rounded-full hover:bg-green-400 transition font-semibold text-sm shadow-sm">
                    ✈️
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;