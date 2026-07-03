"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Loader2, Wifi, WifiOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

type User = { id: string; firstName: string; lastName: string; email: string; role: string };

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
};

type Props = { roomId: string; user: User };

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api/v1", "") || "http://localhost:4000";

export default function ChatClient({ roomId, user }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the access token from a quick API call to avoid exposing it client-side
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/token");
      if (!res.ok) return null;
      const d = await res.json();
      return d.token ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let socket: Socket;

    async function connect() {
      setConnecting(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError("Authentication required. Please log in again.");
        setConnecting(false);
        return;
      }

      socket = io(`${SOCKET_URL}/chat`, {
        auth: { token: `Bearer ${token}` },
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        setConnecting(false);
        socket.emit("join_room", { roomId });
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.on("connect_error", (err) => {
        setError(`Connection failed: ${err.message}`);
        setConnecting(false);
        setConnected(false);
      });

      socket.on("room_history", (history: Message[]) => {
        setMessages(history);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
      });

      socket.on("new_message", (msg: Message) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });

      socket.on("error", (err: { message: string }) => {
        setError(err.message);
      });
    }

    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, getToken]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("send_message", {
      roomId,
      content: input.trim(),
    });
    setInput("");
    inputRef.current?.focus();
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-pageBg">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-2 rounded-lg hover:bg-pageBg transition-colors text-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Chat Room</p>
          <p className="text-xs text-muted font-mono truncate">{roomId}</p>
        </div>
        <div className="flex items-center gap-2">
          {connecting ? (
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
            </span>
          ) : connected ? (
            <span className="flex items-center gap-1.5 text-xs text-brandGreen font-medium">
              <Wifi className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-redAccent font-medium">
              <WifiOff className="h-3.5 w-3.5" /> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {error && (
          <div className="max-w-sm mx-auto bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {connecting && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-muted gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brandGreen" />
            <span className="text-sm">Joining room…</span>
          </div>
        )}

        {!connecting && messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-48 text-muted gap-2">
            <div className="h-12 w-12 rounded-full bg-brandGreen/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-brandGreen" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Be the first to say hello!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isMe ? "bg-brandGreen" : "bg-primary"
              }`}>
                {msg.sender.firstName[0]}{msg.sender.lastName[0]}
              </div>

              {/* Bubble */}
              <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && (
                  <span className="text-[11px] text-muted font-medium ml-1">
                    {msg.sender.firstName} {msg.sender.lastName}
                  </span>
                )}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "bg-brandGreen text-white rounded-br-sm"
                    : "bg-white border border-border text-ink rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!connected}
            placeholder={connected ? "Type a message…" : "Connecting to chat…"}
            className="flex-1 rounded-full border border-border bg-pageBg px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all disabled:opacity-50"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!connected || !input.trim()}
            className="h-10 w-10 rounded-full bg-brandGreen text-white flex items-center justify-center hover:bg-darkGreen disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
