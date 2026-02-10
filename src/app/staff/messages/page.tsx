"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { canAccessStaffRoutes } from "@/lib/staff-auth";
import { isUserAdmin } from "@/lib/admin-auth";
import {
  Send,
  User,
  Radio,
  ArrowLeft,
  Plus,
  Search,
  Check,
  CheckCheck,
  MessageSquare,
} from "lucide-react";

interface Contact {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Conversation {
  contactEmail: string;
  contactName: string;
  contactRole: string;
  lastMessage: {
    id: string;
    message: string;
    subject?: string;
    senderEmail: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  messageCount: number;
}

interface ThreadMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
  readAt?: string;
}

interface Broadcast {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
  readAt?: string;
}

export default function StaffMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<"inbox" | "thread" | "compose" | "broadcasts">("inbox");
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [unreadBroadcasts, setUnreadBroadcasts] = useState(0);

  const [activeContact, setActiveContact] = useState<{ email: string; name: string; role: string } | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Contact | null>(null);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inboxSearch, setInboxSearch] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const userEmail = session?.user?.email || "";
  const userRole = (session?.user as any)?.role || "";
  const isAdmin = isUserAdmin(userEmail, userRole);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }
    if (!canAccessStaffRoutes((session.user as any).role) && !isUserAdmin(session.user.email, (session.user as any).role)) {
      router.push("/dashboard");
      return;
    }
    fetchConversations();
  }, [session, status, router]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConversations(true);
      if (view === "thread" && activeContact) {
        fetchThread(activeContact.email, true);
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view, activeContact]);

  useEffect(() => {
    if (view === "thread") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadMessages, view]);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/admin/messages/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConversations(data.conversations || []);
      setBroadcasts(data.broadcasts || []);
      setUnreadBroadcasts(data.unreadBroadcasts || 0);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchThread = async (contactEmail: string, silent = false) => {
    try {
      if (!silent) setThreadLoading(true);
      const res = await fetch(`/api/admin/messages/thread/${encodeURIComponent(contactEmail)}`);
      if (!res.ok) throw new Error("Failed to fetch thread");
      const data = await res.json();
      setThreadMessages(data);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      if (!silent) setThreadLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/admin/messages/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const openThread = (conv: Conversation) => {
    setActiveContact({ email: conv.contactEmail, name: conv.contactName, role: conv.contactRole });
    setView("thread");
    fetchThread(conv.contactEmail);
  };

  const openCompose = () => {
    fetchContacts();
    setSelectedRecipient(null);
    setComposeSubject("");
    setComposeMessage("");
    setIsBroadcast(false);
    setContactSearch("");
    setView("compose");
  };

  const sendNewMessage = async () => {
    if (!composeMessage.trim()) return;
    if (!isBroadcast && !selectedRecipient) return;
    setSending(true);
    try {
      const body: any = {
        message: composeMessage.trim(),
        subject: composeSubject.trim() || null,
        isBroadcast,
      };
      if (!isBroadcast && selectedRecipient) {
        body.recipientEmail = selectedRecipient.email;
        body.recipientName = selectedRecipient.name;
        body.recipientRole = selectedRecipient.role;
        body.recipientId = selectedRecipient.id;
      }
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to send");
      if (!isBroadcast && selectedRecipient) {
        setActiveContact({ email: selectedRecipient.email, name: selectedRecipient.name, role: selectedRecipient.role });
        setView("thread");
        fetchThread(selectedRecipient.email);
      } else {
        setView("inbox");
      }
      fetchConversations(true);
      setComposeMessage("");
      setComposeSubject("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activeContact) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: activeContact.email,
          recipientName: activeContact.name,
          recipientRole: activeContact.role,
          message: replyText.trim(),
          isBroadcast: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      setReplyText("");
      fetchThread(activeContact.email, true);
      fetchConversations(true);
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.contactName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(inboxSearch.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0) + unreadBroadcasts;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": case "SUPER_ADMIN": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "LO": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "MODERATOR": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ccff00] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto p-4 md:p-6">

        {/* === INBOX VIEW === */}
        {view === "inbox" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold"><span className="text-[#ccff00]">Messages</span></h1>
                <p className="text-gray-400 text-sm mt-1">
                  {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}` : "All caught up"}
                </p>
              </div>
              <button onClick={openCompose} className="flex items-center gap-2 bg-[#ccff00] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#b8e600] transition">
                <Plus className="w-4 h-4" />
                New Message
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setView("inbox")} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#ccff00] text-black">
                <MessageSquare className="w-4 h-4 inline mr-1.5" />
                Conversations
                {conversations.reduce((s, c) => s + c.unreadCount, 0) > 0 && (
                  <span className="ml-2 bg-black text-[#ccff00] text-xs px-2 py-0.5 rounded-full">{conversations.reduce((s, c) => s + c.unreadCount, 0)}</span>
                )}
              </button>
              <button onClick={() => setView("broadcasts")} className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition">
                <Radio className="w-4 h-4 inline mr-1.5" />
                Broadcasts
                {unreadBroadcasts > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadBroadcasts}</span>
                )}
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search conversations..." value={inboxSearch} onChange={(e) => setInboxSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#ccff00]/50" />
            </div>

            {filteredConversations.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No conversations yet</p>
                <button onClick={openCompose} className="text-[#ccff00] hover:underline text-sm">Start a new conversation</button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div key={conv.contactEmail} onClick={() => openThread(conv)}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:border-[#ccff00]/30 ${conv.unreadCount > 0 ? "bg-[#ccff00]/5 border border-[#ccff00]/20" : "bg-zinc-900 border border-zinc-800"}`}>
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-[#ccff00]">{conv.contactName[0]?.toUpperCase() || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${conv.unreadCount > 0 ? "text-white" : "text-gray-200"}`}>{conv.contactName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(conv.contactRole)}`}>{conv.contactRole}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-gray-200" : "text-gray-500"}`}>
                        {conv.lastMessage.senderEmail === userEmail ? "You: " : ""}{conv.lastMessage.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessage.createdAt)}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#ccff00] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === BROADCASTS VIEW === */}
        {view === "broadcasts" && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView("inbox")} className="p-2 rounded-lg hover:bg-zinc-800 transition"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-2xl font-bold text-[#ccff00]">Broadcasts</h1>
                <p className="text-gray-400 text-sm">Messages sent to all staff</p>
              </div>
            </div>
            {broadcasts.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No broadcasts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((b) => (
                  <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Radio className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-white">{b.senderName}</span>
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(b.senderRole)}`}>{b.senderRole}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatTime(b.createdAt)}</span>
                    </div>
                    {b.subject && <h3 className="font-bold text-white mb-2">{b.subject}</h3>}
                    <p className="text-gray-300 whitespace-pre-wrap">{b.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === THREAD VIEW === */}
        {view === "thread" && activeContact && (
          <div className="flex flex-col h-[calc(100vh-48px)]">
            <div className="flex items-center gap-4 p-4 border-b border-zinc-800 flex-shrink-0">
              <button onClick={() => { setView("inbox"); fetchConversations(true); }} className="p-2 rounded-lg hover:bg-zinc-800 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="text-lg font-bold text-[#ccff00]">{activeContact.name[0]?.toUpperCase() || "?"}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-white">{activeContact.name}</h2>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(activeContact.role)}`}>{activeContact.role}</span>
                </div>
                <p className="text-xs text-gray-500">{activeContact.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadLoading ? (
                <div className="text-center text-gray-500 py-8">Loading messages...</div>
              ) : threadMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
              ) : (
                threadMessages.map((msg) => {
                  const isMine = msg.senderEmail === userEmail;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMine ? "bg-[#ccff00] text-black rounded-br-md" : "bg-zinc-800 text-white rounded-bl-md"}`}>
                        {msg.subject && <p className={`text-xs font-bold mb-1 ${isMine ? "text-black/60" : "text-gray-400"}`}>{msg.subject}</p>}
                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                          <span className={`text-[10px] ${isMine ? "text-black/50" : "text-gray-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMine && (msg.isRead ? <CheckCheck className="w-3 h-3 text-black/50" /> : <Check className="w-3 h-3 text-black/40" />)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 flex-shrink-0">
              <div className="flex gap-3">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type a message..." rows={1}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-[#ccff00]/50" />
                <button onClick={sendReply} disabled={replySending || !replyText.trim()}
                  className="bg-[#ccff00] text-black p-3 rounded-xl hover:bg-[#b8e600] transition disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === COMPOSE VIEW === */}
        {view === "compose" && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setView("inbox")} className="p-2 rounded-lg hover:bg-zinc-800 transition"><ArrowLeft className="w-5 h-5" /></button>
              <h1 className="text-2xl font-bold text-[#ccff00]">New Message</h1>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsBroadcast(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!isBroadcast ? "bg-[#ccff00] text-black" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"}`}>
                    <User className="w-4 h-4 inline mr-1.5" />Personal
                  </button>
                  <button onClick={() => setIsBroadcast(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${isBroadcast ? "bg-blue-500 text-white" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"}`}>
                    <Radio className="w-4 h-4 inline mr-1.5" />Broadcast to All
                  </button>
                </div>
              )}

              {!isBroadcast && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
                  {selectedRecipient ? (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#ccff00]">{selectedRecipient.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-white">{selectedRecipient.name}</span>
                        <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(selectedRecipient.role)}`}>{selectedRecipient.role}</span>
                      </div>
                      <button onClick={() => setSelectedRecipient(null)} className="text-gray-400 hover:text-white text-xl">×</button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" placeholder="Search contacts..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#ccff00]/50" />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-zinc-800 rounded-lg p-2">
                        {filteredContacts.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">No contacts found</p>
                        ) : (
                          filteredContacts.map((c) => (
                            <button key={c.id} onClick={() => { setSelectedRecipient(c); setContactSearch(""); }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-700 transition text-left">
                              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-300">{c.name[0]?.toUpperCase()}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(c.role)}`}>{c.role}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject (optional)</label>
                <input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Message subject..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#ccff00]/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea value={composeMessage} onChange={(e) => setComposeMessage(e.target.value)} placeholder="Type your message..." rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-[#ccff00]/50" />
              </div>

              <div className="flex gap-3">
                <button onClick={sendNewMessage} disabled={sending || !composeMessage.trim() || (!isBroadcast && !selectedRecipient)}
                  className="flex items-center gap-2 bg-[#ccff00] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#b8e600] transition disabled:opacity-50">
                  <Send className="w-4 h-4" />{sending ? "Sending..." : isBroadcast ? "Send Broadcast" : "Send Message"}
                </button>
                <button onClick={() => setView("inbox")} className="px-6 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">Cancel</button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
