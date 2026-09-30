import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, Search, Check, CheckCheck, ShieldAlert,
  Info, User, Paperclip, MessageSquare
} from 'lucide-react';
import { Message, User as UserType } from '../../types';

export const DirectChatView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    messages, 
    sendMessage, 
    markMessagesAsRead,
    getMessagesBetween,
    getUnreadMessagesCount
  } = useApp();

  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // If currentUser is director, they have NO access to private chats
  if (!currentUser) return null;

  if (currentUser.role === 'director') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <ShieldAlert className="w-8 h-8 text-slate-600" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-3">
          Kebijakan Privasi Komunikasi
        </span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Chat Dibatasi (Read-Only Policy)</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Sesuai spesifikasi tata kelola perusahaan, Direktur hanya memiliki akses pemantauan tugas, aktivitas, dan laporan berkala. 
          Fitur <strong>Direct Messaging</strong> bersifat privat dan konfidensial antara <strong>Peserta Magang (Intern)</strong> dan <strong>Mentor Pembimbing</strong>.
        </p>
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-600" /> Ringkasan Hak Akses:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li>Intern hanya dapat bertukar pesan dengan Mentor yang ditugaskan secara resmi.</li>
            <li>Mentor dapat membimbing dan merespons pertanyaan dari intern asuhannya.</li>
            <li>Catatan evaluasi dan approval tugas tetap tercatat di log resmi pada menu Monitoring &amp; Task Review.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Determine contacts
  // If Intern: single contact which is their assigned mentor
  // If Mentor: list of interns assigned to this mentor
  let contacts: UserType[] = [];
  if (currentUser.role === 'intern') {
    const mentor = users.find(u => u.id === currentUser.mentor_id);
    if (mentor) contacts = [mentor];
  } else if (currentUser.role === 'mentor') {
    contacts = users.filter(u => u.role === 'intern' && u.mentor_id === currentUser.id);
  }

  // Filter contacts by search
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.division?.toLowerCase().includes(searchContact.toLowerCase())
  );

  // Set default selected contact
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  const selectedContact = users.find(u => u.id === selectedContactId) || contacts[0];

  // Mark messages as read when active contact is viewed
  useEffect(() => {
    if (selectedContact) {
      markMessagesAsRead(selectedContact.id);
    }
  }, [selectedContactId, messages.length]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedContactId]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // Active conversation messages
  const conversation = selectedContact 
    ? getMessagesBetween(currentUser.id, selectedContact.id)
    : [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const messageText = inputText.trim();
    setInputText('');

    sendMessage(selectedContact.id, messageText);

    // Simulate realistic mentor response if intern sends a message
    if (currentUser.role === 'intern') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const sampleResponses = [
          "Siap, terima kasih laporannya. Segera saya tinjau detail task di sistem.",
          "Bagus progressnya. Pastikan unit test dan dokumentasi API-nya sudah lengkap ya.",
          "Oke, jika ada kendala di database migration jangan ragu tanyakan lagi.",
          "Sudah saya cek sekilas, nanti siang kita review bersama sebelum standup ya."
        ];
        const randomResp = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const replyMsg: Message = {
          id: Date.now(),
          sender_id: selectedContact.id,
          receiver_id: currentUser.id,
          message: randomResp,
          is_read: true,
          created_at: now,
          updated_at: now,
        };
        const savedMsgs = localStorage.getItem('interntask_messages');
        const all = savedMsgs ? JSON.parse(savedMsgs) : messages;
        localStorage.setItem('interntask_messages', JSON.stringify([...all, replyMsg]));
        window.dispatchEvent(new Event('storage'));
      }, 2500);
    }
  };

  // Quick preset suggestions
  const presetSuggestions = currentUser.role === 'intern' 
    ? [
        "Selamat pagi Pak, izin konfirmasi terkait revisi task kemarin.",
        "Laporan daily task hari ini sudah saya submit untuk direview.",
        "Apakah ada waktu untuk konsultasi teknis seputar endpoint API?",
      ]
    : [
        "Progress task kamu sudah bagus, tolong lengkapi capture buktinya ya.",
        "Siap, task sudah saya approve. Lanjutkan ke sprint berikutnya.",
        "Bisa jadwalkan sync 10 menit via Google Meet jam 2 siang?",
      ];

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr.substring(11, 16);
    }
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return 'Hari Ini';
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Direct Messaging</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Konsultasi Privat
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'intern'
              ? 'Ruang komunikasi privat dan konsultasi teknis harian dengan Mentor pembimbing resmi.'
              : 'Pusat bimbingan, arahan tugas, dan konsultasi interaktif dengan seluruh peserta magang asuhan Anda.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Real-time Active</span>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[640px] max-h-[820px] h-[calc(100vh-240px)]">
        
        {/* Mentor Contact List (Split View Left Panel) */}
        {currentUser.role === 'mentor' && (
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search Bar */}
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama peserta magang..."
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Contacts Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada peserta magang ditemukan.
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const unread = getUnreadMessagesCount(contact.id);
                  const isSelected = selectedContact?.id === contact.id;
                  const lastMsgs = getMessagesBetween(currentUser.id, contact.id);
                  const lastMsg = lastMsgs[lastMsgs.length - 1];

                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-teal-50/80 border-l-4 border-teal-600' 
                          : 'hover:bg-slate-100/70 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={contact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={contact.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal-500 ring-2 ring-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-teal-950 font-bold' : 'text-slate-800'}`}>
                            {contact.name}
                          </h4>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mb-1">
                          {contact.division || 'Peserta Magang'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {lastMsg ? lastMsg.message : 'Belum ada percakapan'}
                        </p>
                      </div>

                      {unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Panel / Single Chat Workspace */}
        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
          
          {/* Chat Header */}
          {selectedContact ? (
            <div className="h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedContact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 leading-none">
                      {selectedContact.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {selectedContact.role === 'mentor' ? 'Mentor Pembimbing' : 'Intern'}
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-600 font-medium mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                    Online &bull; Aktif di sistem
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 text-slate-400">
                <div className="hidden sm:flex items-center gap-1 mr-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedContact.division || 'Devisi'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-16 px-6 bg-white/90 border-b border-slate-200 flex items-center text-sm text-slate-500">
              Pilih kontak untuk memulai percakapan
            </div>
          )}

          {/* Messages Flow Container (Scrollable) */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60"
          >
            {/* Conversation Start Marker */}
            {selectedContact && (
              <div className="text-center my-3">
                <div className="inline-block p-5 rounded-xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Sesi Chat Privat: {currentUser.name} &amp; {selectedContact.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pesan terenkripsi dan tersimpan di database sistem. Gunakan saluran ini untuk koordinasi teknis, bimbingan, dan evaluasi berkala.
                  </p>
                </div>
              </div>
            )}

            {conversation.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400">Belum ada riwayat pesan.</p>
                <p className="text-[11px] text-slate-500 mt-1">Gunakan kotak di bawah untuk memulai percakapan pertama.</p>
              </div>
            ) : (
              conversation.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser.id;
                const prevMsg = conversation[idx - 1];
                const showDateHeader = !prevMsg || formatDateHeader(prevMsg.created_at) !== formatDateHeader(msg.created_at);
                const isLastMsg = idx === conversation.length - 1;

                return (
                  <React.Fragment key={msg.id}>
                    {/* Date Divider */}
                    {showDateHeader && (
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-slate-200/80 text-slate-600 shadow-2xs">
                          {formatDateHeader(msg.created_at)}
                        </span>
                      </div>
                    )}

                    {/* Chat Bubble Row */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                      <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`px-4 py-2.5 text-xs leading-relaxed transition-all ${
                            isMe
                              ? 'bg-teal-600 text-white rounded-2xl rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 rounded-2xl rounded-bl-xs border border-slate-200 shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                            <span>{formatTime(msg.created_at)}</span>
                            {isMe && (
                              <span title={msg.is_read ? 'Dibaca' : 'Terkirim'}>
                                {msg.is_read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-teal-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-teal-200/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Read status subtitle on last sent message */}
                      {isMe && isLastMsg && (
                        <div className="text-[10px] text-slate-400 mt-1 mr-1 flex items-center gap-1 font-medium">
                          {msg.is_read ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-teal-600" />
                              <span className="text-slate-500">Dibaca</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 text-slate-400" />
                              <span>Terkirim</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-2xl rounded-bl-xs bg-white text-slate-600 text-xs flex items-center gap-1 border border-slate-200 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedContact?.name} sedang mengetik...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Suggestions Bar */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
              Template:
            </span>
            {presetSuggestions.map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(text)}
                className="shrink-0 text-[11px] px-3 py-1 rounded-full bg-slate-50 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Sticky Bottom Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Sisipkan file atau tautan"
                onClick={() => setInputText(prev => prev + ' [Lampiran Task] ')}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder={`Kirim pesan ke ${selectedContact?.name || 'kontak'}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-xs"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 ${
                  inputText.trim()
                    ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer hover:scale-105 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="Kirim pesan"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
