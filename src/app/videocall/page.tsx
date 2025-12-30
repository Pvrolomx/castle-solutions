'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export default function VideoCallPage() {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'waiting' | 'joining' | 'connected'>('idle');
  const [showNameModal, setShowNameModal] = useState(true);
  const [error, setError] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('castle_chat_user');
    if (saved) {
      setUserName(saved);
      setShowNameModal(false);
    }
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('castle_chat_user', userName.trim());
      setShowNameModal(false);
    }
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      setError('No se pudo acceder a la cámara');
      return null;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    pc.onicecandidate = async (event) => {
      if (event.candidate && roomCode) {
        await fetch('/api/videocall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ice',
            roomCode,
            fromUser: userName,
            candidate: JSON.stringify(event.candidate)
          })
        });
      }
    };
    
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStatus('connected');
      }
    };
    
    peerConnectionRef.current = pc;
    return pc;
  };

  // CREAR LLAMADA (Caller)
  const createCall = async () => {
    setStatus('creating');
    const stream = await startLocalVideo();
    if (!stream) return;
    
    // Crear sala
    const res = await fetch('/api/videocall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', creatorName: userName })
    });
    const call = await res.json();
    setRoomCode(call.roomCode);
    setStatus('waiting');
    
    // Esperar a que alguien se una
    pollIntervalRef.current = setInterval(async () => {
      const pollRes = await fetch(`/api/videocall?roomCode=${call.roomCode}`);
      const pollData = await pollRes.json();
      
      if (pollData?.status === 'connecting' && !peerConnectionRef.current) {
        // Alguien se unió, crear offer
        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        await fetch('/api/videocall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'offer',
            roomCode: call.roomCode,
            offer: JSON.stringify(offer)
          })
        });
      }
      
      if (pollData?.answer && peerConnectionRef.current && !peerConnectionRef.current.currentRemoteDescription) {
        const answer = JSON.parse(pollData.answer);
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
      
      // Procesar ICE candidates
      if (pollData?.candidates) {
        for (const c of pollData.candidates) {
          if (c.fromUser !== userName && peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(JSON.parse(c.candidate)));
            } catch {}
          }
        }
      }
    }, 1000);
  };

  // UNIRSE A LLAMADA (Callee)
  const joinCall = async () => {
    if (!joinCode.trim()) return;
    setStatus('joining');
    setRoomCode(joinCode.toUpperCase());
    
    const stream = await startLocalVideo();
    if (!stream) return;
    
    // Unirse a sala
    await fetch('/api/videocall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', roomCode: joinCode.toUpperCase() })
    });
    
    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    
    // Esperar offer
    pollIntervalRef.current = setInterval(async () => {
      const pollRes = await fetch(`/api/videocall?roomCode=${joinCode.toUpperCase()}`);
      const pollData = await pollRes.json();
      
      if (pollData?.offer && !peerConnectionRef.current?.currentRemoteDescription) {
        const offer = JSON.parse(pollData.offer);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await fetch('/api/videocall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'answer',
            roomCode: joinCode.toUpperCase(),
            answer: JSON.stringify(answer)
          })
        });
      }
      
      // Procesar ICE candidates
      if (pollData?.candidates) {
        for (const c of pollData.candidates) {
          if (c.fromUser !== userName) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(c.candidate)));
            } catch {}
          }
        }
      }
    }, 1000);
  };

  const endCall = async () => {
    if (roomCode) {
      await fetch('/api/videocall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', roomCode })
      });
    }
    cleanup();
    setStatus('idle');
    setRoomCode('');
    setJoinCode('');
  };

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <header className="bg-stone-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-stone-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white">Video Llamada</h1>
              <p className="text-xs text-stone-400">{userName}</p>
            </div>
          </div>
          {roomCode && (
            <div className="bg-stone-700 px-4 py-2 rounded-xl">
              <span className="text-stone-400 text-sm">Código: </span>
              <span className="text-white font-mono font-bold">{roomCode}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {status === 'idle' && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Crear llamada */}
            <div className="bg-stone-800 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Crear Llamada</h2>
              <p className="text-stone-400 text-center text-sm mb-6">Genera un código para compartir</p>
              <button onClick={createCall}
                className="w-full bg-gradient-to-b from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition">
                Iniciar
              </button>
            </div>

            {/* Unirse a llamada */}
            <div className="bg-stone-800 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Unirse</h2>
              <p className="text-stone-400 text-center text-sm mb-4">Ingresa el código de la llamada</p>
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO" maxLength={6}
                className="w-full px-4 py-3 bg-stone-700 text-white text-center font-mono text-xl rounded-xl mb-4 uppercase" />
              <button onClick={joinCall} disabled={joinCode.length < 4}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50">
                Unirse
              </button>
            </div>
          </div>
        )}

        {status === 'waiting' && (
          <div className="text-center mt-12">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Esperando...</h2>
            <p className="text-stone-400 mb-4">Comparte este código con quien quieras llamar</p>
            <div className="bg-stone-800 inline-block px-8 py-4 rounded-2xl mb-6">
              <span className="text-4xl font-mono font-bold text-green-400">{roomCode}</span>
            </div>
            <div className="mt-6">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-48 h-36 bg-stone-800 rounded-xl mx-auto object-cover" />
              <p className="text-stone-500 text-sm mt-2">Tu cámara</p>
            </div>
            <button onClick={endCall} className="mt-8 bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600">
              Cancelar
            </button>
          </div>
        )}

        {(status === 'joining' || status === 'connected' || status === 'creating') && status !== 'waiting' && status !== 'idle' && (
          <div className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Video remoto */}
              <div className="relative">
                <video ref={remoteVideoRef} autoPlay playsInline 
                  className="w-full aspect-video bg-stone-800 rounded-2xl object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                  Participante
                </div>
              </div>
              
              {/* Video local */}
              <div className="relative">
                <video ref={localVideoRef} autoPlay muted playsInline 
                  className="w-full aspect-video bg-stone-800 rounded-2xl object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                  Tú ({userName})
                </div>
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={endCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {status === 'joining' && (
              <p className="text-center text-stone-400 mt-4">Conectando...</p>
            )}
            {status === 'connected' && (
              <p className="text-center text-green-400 mt-4">✓ Conectado</p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/20 text-red-400 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>

      {/* Modal nombre */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4 text-center">¿Cómo te llamas?</h2>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUserName()}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-stone-700 text-white rounded-xl mb-4" />
            <button onClick={saveUserName} disabled={!userName.trim()}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
