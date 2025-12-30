'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  participant: Participant;
}

interface Room {
  id: string;
  name: string | null;
  type: string;
  participants: Participant[];
  messages: Message[];
}

export default function ChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('castle_chat_user');
    if (saved) {
      setUserName(saved);
      setShowNameModal(false);
      loadRooms();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      // Polling cada 3 segundos para nuevos mensajes
      pollInterval.current = setInterval(() => {
        loadMessages(selectedRoom.id);
      }, 3000);
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [selectedRoom]);

  const loadRooms = async () => {
    const res = await fetch('/api/chat/rooms');
    setRooms(await res.json() || []);
  };

  const loadMessages = async (roomId: string) => {
    const res = await fetch(`/api/chat/messages?roomId=${roomId}`);
    setMessages(await res.json() || []);
  };

  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('castle_chat_user', userName.trim());
      setShowNameModal(false);
      loadRooms();
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    setLoading(true);
    await fetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRoomName,
        type: 'group',
        participants: [userName],
        creator: userName
      })
    });
    setNewRoomName('');
    setShowNewRoomModal(false);
    await loadRooms();
    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;
    
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: selectedRoom.id,
        senderName: userName,
        content: newMessage
      })
    });
    
    setNewMessage('');
    await loadMessages(selectedRoom.id);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-stone-500 hover:text-stone-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-stone-800">Chat Interno</h1>
              <p className="text-xs text-stone-400">{userName}</p>
            </div>
          </div>
          <button onClick={() => setShowNewRoomModal(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600">
            + Nuevo Grupo
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex h-[calc(100vh-73px)]">
        {/* Lista de salas */}
        <div className="w-1/3 bg-white border-r border-stone-200 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-stone-400">
              <p>No hay conversaciones</p>
              <button onClick={() => setShowNewRoomModal(true)} className="text-indigo-500 mt-2">
                Crear grupo
              </button>
            </div>
          ) : (
            rooms.map(room => (
              <div key={room.id} onClick={() => setSelectedRoom(room)}
                className={`p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 ${
                  selectedRoom?.id === room.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(room.name || 'G')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 truncate">{room.name || 'Chat Grupal'}</p>
                    <p className="text-sm text-stone-400 truncate">
                      {room.messages[0]?.content || 'Sin mensajes'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Area de mensajes */}
        <div className="flex-1 flex flex-col bg-stone-50">
          {selectedRoom ? (
            <>
              {/* Header del chat */}
              <div className="bg-white px-4 py-3 border-b border-stone-200">
                <h2 className="font-bold text-stone-800">{selectedRoom.name || 'Chat Grupal'}</h2>
                <p className="text-xs text-stone-400">
                  {selectedRoom.participants.map(p => p.name).join(', ')}
                </p>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                  const isMe = msg.participant.name === userName;
                  const showDate = idx === 0 || 
                    formatDate(messages[idx-1].createdAt) !== formatDate(msg.createdAt);
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="bg-stone-200 text-stone-500 text-xs px-3 py-1 rounded-full">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                          {!isMe && (
                            <p className="text-xs text-stone-500 mb-1 ml-1">{msg.participant.name}</p>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isMe 
                              ? 'bg-indigo-500 text-white rounded-br-sm' 
                              : 'bg-white text-stone-800 rounded-bl-sm shadow-sm'
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-stone-400'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <form onSubmit={sendMessage} className="bg-white p-4 border-t border-stone-200">
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  <button type="submit" disabled={!newMessage.trim()}
                    className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Selecciona una conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nombre */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-stone-800 mb-4 text-center">¿Cómo te llamas?</h2>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUserName()}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl mb-4" />
            <button onClick={saveUserName} disabled={!userName.trim()}
              className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Modal nuevo grupo */}
      {showNewRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-stone-800 mb-4">Nuevo Grupo</h2>
            <input type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
              placeholder="Nombre del grupo"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl mb-4" />
            <div className="flex gap-2">
              <button onClick={createRoom} disabled={loading || !newRoomName.trim()}
                className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'Creando...' : 'Crear'}
              </button>
              <button onClick={() => setShowNewRoomModal(false)}
                className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
