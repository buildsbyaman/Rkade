"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, ImageIcon, ArrowLeft, MessageCircle, AlertCircle } from "lucide-react";

interface CommunityMessage {
  id: string;
  eventId: string;
  userEmail: string;
  userName: string;
  userImage: string | null;
  message: string;
  imageUrl: string | null;
  isAdminMention: boolean;
  isAdminReply: boolean;
  createdAt: string;
}

interface EventInfo {
  id: string;
  eventName: string;
  slug: string;
}

export default function EventCommunity({ eventId }: { eventId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch event info
  useEffect(() => {
    async function fetchEvent() {
      try {
        // Try fetching by slug first, then by ID
        const res = await fetch(`/api/events/id/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEventInfo({
            id: data.id || data._id,
            eventName: data.eventName || data.event_name,
            slug: data.slug,
          });
        }
      } catch {
        // Event info is optional for display
      }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/community/${eventId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load community");
        return;
      }
      const data = await res.json();
      setMessages(data.messages);
      setError(null);
    } catch {
      setError("Failed to connect to community");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [session, status, router, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() && !uploadingImage) return;
    if (sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/community/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64 data URL for simple storage
      const reader = new FileReader();
      reader.onload = async () => {
        const imageUrl = reader.result as string;

        const res = await fetch(`/api/community/${eventId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: newMessage.trim() || "📷 Shared a photo",
            imageUrl,
          }),
        });

        if (res.ok) {
          const msg = await res.json();
          setMessages((prev) => [...prev, msg]);
          setNewMessage("");
        } else {
          const data = await res.json();
          setError(data.error);
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to upload image");
      setUploadingImage(false);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acid mx-auto"></div>
          <p className="mt-2 text-sm text-gray-400">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-acid text-black font-bold rounded-xl hover:bg-acid/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-obsidian flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-obsidian/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-white/5 transition"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">
              {eventInfo?.eventName ? `${eventInfo.eventName}` : "Event"} Community
            </h1>
            <p className="text-xs text-zinc-400">
              Chat with fellow attendees and ask questions to the event organizer using{" "}
              <span className="text-acid font-semibold">@admin</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-acid/10 text-acid px-3 py-1.5 rounded-full border border-acid/20 font-semibold flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Booked Attendees Only
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                Welcome to the Community!
              </h3>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Be the first to start a conversation. Share your excitement, ask
                questions, or connect with fellow attendees.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.userEmail === session?.user?.email;
              return (
                <div
                  key={msg.id}
                  className={`${
                    msg.isAdminMention
                      ? "bg-acid/5 border border-acid/20 rounded-2xl p-4"
                      : msg.isAdminReply
                      ? "bg-electric-purple/5 border border-electric-purple/20 rounded-2xl p-4"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {msg.userImage ? (
                        <Image
                          src={msg.userImage}
                          alt={msg.userName}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                          {getInitial(msg.userName)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {msg.userName}
                        </span>
                        {msg.isAdminReply && (
                          <span className="text-[10px] bg-electric-purple text-white px-1.5 py-0.5 rounded font-bold uppercase">
                            Admin
                          </span>
                        )}
                        <span className="text-xs text-zinc-500">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Message text */}
                      <p className="text-sm text-zinc-200 mt-1 whitespace-pre-wrap break-words">
                        {msg.message.split(/(@admin)/g).map((part, i) =>
                          part === "@admin" ? (
                            <span key={i} className="text-acid font-bold">
                              @admin
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </p>

                      {/* Image */}
                      {msg.imageUrl && (
                        <div className="mt-2 max-w-sm">
                          <Image
                            src={msg.imageUrl}
                            alt="Shared image"
                            width={400}
                            height={300}
                            className="rounded-xl border border-white/10 object-cover cursor-pointer hover:opacity-90 transition"
                            onClick={() => window.open(msg.imageUrl!, "_blank")}
                          />
                        </div>
                      )}

                      {/* Admin mention label */}
                      {msg.isAdminMention && !msg.isAdminReply && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3.5 w-3.5 text-acid" />
                          <span className="text-xs text-acid font-semibold">
                            Question for Organizer
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-obsidian/95 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {error && messages.length > 0 && (
            <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... Use @admin to ask the organizer"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-20 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-acid/50 resize-none min-h-[44px] max-h-[120px]"
                rows={1}
                maxLength={1000}
              />
              <div className="absolute right-3 bottom-2 flex items-center gap-1">
                <span className="text-[10px] text-zinc-600">
                  {newMessage.length}/1000
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition text-zinc-400 hover:text-acid disabled:opacity-50"
                  title="Share a photo"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || (!newMessage.trim() && !uploadingImage)}
              className="p-3 bg-acid text-black rounded-2xl hover:bg-acid/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-[10px] text-zinc-600">
              Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Enter</kbd> to send,{" "}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
