"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isUserAdmin } from "@/lib/admin-auth";
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Search,
  Plus,
  X,
  MoreVertical,
  ArrowLeft,
  Radio,
  Check,
  CheckCheck,
  User,
} from "lucide-react";
import type { Assignment, Task, Message, StaffMember } from "@/types/staff";

export default function StaffManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"assignments" | "tasks" | "messages">("assignments");
  const [loading, setLoading] = useState(true);
  
  // State for assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (session?.user?.email && isUserAdmin(session.user.email)) {
      loadData();
    }
  }, [session, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "assignments") {
        const [assignmentsRes, staffRes, eventsRes] = await Promise.all([
          fetch("/api/admin/assignments"),
          fetch("/api/admin/staff"),
          fetch("/api/admin/events"),
        ]);
        setAssignments(await assignmentsRes.json());
        setStaff(await staffRes.json());
        setEvents(await eventsRes.json());
      } else if (activeTab === "tasks") {
        const [tasksRes, staffRes, eventsRes] = await Promise.all([
          fetch("/api/admin/tasks"),
          fetch("/api/admin/staff"),
          fetch("/api/admin/events"),
        ]);
        setTasks(await tasksRes.json());
        setStaff(await staffRes.json());
        setEvents(await eventsRes.json());
      } else if (activeTab === "messages") {
        const [messagesRes, staffRes] = await Promise.all([
          fetch("/api/admin/messages"),
          fetch("/api/admin/staff"),
        ]);
        setMessages(await messagesRes.json());
        setStaff(await staffRes.json());
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acid mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !isUserAdmin(session.user?.email)) {
    router.push("/admin");
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
            Staff Management
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage LOs, Moderators, Tasks & Communications
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab !== "messages" && (
          <Button
            onClick={() => {
              if (activeTab === "assignments") setShowAssignmentModal(true);
              else if (activeTab === "tasks") setShowTaskModal(true);
            }}
            className="bg-acid hover:bg-white text-black font-black rounded-xl px-6"
          >
            <Plus className="mr-2 size-4" />
            {activeTab === "assignments" && "New Assignment"}
            {activeTab === "tasks" && "New Task"}
          </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
        {["assignments", "tasks", "messages"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? "bg-acid text-black" : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[500px]">
        {activeTab === "assignments" && (
          <AssignmentsTab 
            assignments={assignments} 
            staff={staff}
            events={events}
            onRefresh={loadData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab 
            tasks={tasks} 
            staff={staff}
            events={events}
            onRefresh={loadData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        {activeTab === "messages" && (
          <MessagesTab 
            messages={messages} 
            staff={staff}
            onRefresh={loadData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>

      {/* Modals would go here - keeping this file manageable, 
          these would be separate components */}
    </div>
  );
}

// Assignments Tab Component
function AssignmentsTab({ assignments, staff, events, onRefresh, searchTerm, setSearchTerm }: any) {
  const filteredAssignments = assignments.filter((a: Assignment) =>
    a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white uppercase">Staff Assignments</h3>
            <p className="text-xs text-zinc-500 mt-1">Allocate LOs and Moderators to events and venues</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-acid/30"
            />
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-4">
          {filteredAssignments.map((assignment: Assignment) => (
            <div key={assignment.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center">
                    <Users className="size-6 text-acid" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{assignment.userName}</h4>
                    <p className="text-sm text-zinc-400">{assignment.userEmail}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {assignment.role}
                      </span>
                      {assignment.venue && (
                        <span className="px-2 py-1 text-xs rounded-full bg-white/5 text-zinc-400">
                          📍 {assignment.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    assignment.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ tasks, staff, events, onRefresh, searchTerm, setSearchTerm }: any) {
  const filteredTasks = tasks.filter((t: Task) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const statusColors = {
    pending: 'bg-zinc-500/10 text-zinc-400',
    'in-progress': 'bg-blue-500/10 text-blue-400',
    completed: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white uppercase">Task Management</h3>
            <p className="text-xs text-zinc-500 mt-1">Assign and track tasks for your team</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-acid/30"
            />
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-4">
          {filteredTasks.map((task: Task) => (
            <div key={task.id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-white">{task.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>👤 {task.assignedToName}</span>
                    <span>📧 {task.assignedToEmail}</span>
                    {task.venue && <span>📍 {task.venue}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Messages Tab Component - Conversation-based
function MessagesTab({ messages, staff, onRefresh, searchTerm, setSearchTerm }: any) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [msgView, setMsgView] = useState<"list" | "thread" | "compose">("list");
  const [conversations, setConversations] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<{ email: string; name: string; role: string } | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  // Compose
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  // Reply
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConversations(true);
      if (msgView === "thread" && activeContact) {
        fetchThread(activeContact.email, true);
      }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [msgView, activeContact]);

  useEffect(() => {
    if (msgView === "thread") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadMessages, msgView]);

  const fetchConversations = async (silent = false) => {
    try {
      const res = await fetch("/api/admin/messages/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations || []);
      setBroadcasts(data.broadcasts || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchThread = async (email: string, silent = false) => {
    try {
      if (!silent) setThreadLoading(true);
      const res = await fetch(`/api/admin/messages/thread/${encodeURIComponent(email)}`);
      if (!res.ok) return;
      setThreadMessages(await res.json());
    } catch (err) {
      console.error("Error:", err);
    } finally {
      if (!silent) setThreadLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/admin/messages/contacts");
      if (res.ok) setContacts(await res.json());
    } catch (err) { console.error(err); }
  };

  const openThread = (conv: any) => {
    setActiveContact({ email: conv.contactEmail, name: conv.contactName, role: conv.contactRole });
    setMsgView("thread");
    fetchThread(conv.contactEmail);
  };

  const openCompose = () => {
    fetchContacts();
    setSelectedRecipient(null);
    setComposeSubject("");
    setComposeMessage("");
    setIsBroadcast(false);
    setContactSearch("");
    setMsgView("compose");
  };

  const sendNewMessage = async () => {
    if (!composeMessage.trim()) return;
    if (!isBroadcast && !selectedRecipient) return;
    setSending(true);
    try {
      const body: any = { message: composeMessage.trim(), subject: composeSubject.trim() || null, isBroadcast };
      if (!isBroadcast && selectedRecipient) {
        body.recipientEmail = selectedRecipient.email;
        body.recipientName = selectedRecipient.name;
        body.recipientRole = selectedRecipient.role;
        body.recipientId = selectedRecipient.id;
      }
      const res = await fetch("/api/admin/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      if (!isBroadcast && selectedRecipient) {
        setActiveContact({ email: selectedRecipient.email, name: selectedRecipient.name, role: selectedRecipient.role });
        setMsgView("thread");
        fetchThread(selectedRecipient.email);
      } else {
        setMsgView("list");
      }
      fetchConversations(true);
      setComposeMessage("");
      setComposeSubject("");
    } catch (err) {
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
        body: JSON.stringify({ recipientEmail: activeContact.email, recipientName: activeContact.name, recipientRole: activeContact.role, message: replyText.trim(), isBroadcast: false }),
      });
      if (!res.ok) throw new Error("Failed");
      setReplyText("");
      fetchThread(activeContact.email, true);
      fetchConversations(true);
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": case "SUPER_ADMIN": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "LO": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "MODERATOR": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const filteredConversations = conversations.filter(
    (c: any) => c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c: any) => c.name.toLowerCase().includes(contactSearch.toLowerCase()) || c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-300">
      {/* === LIST VIEW === */}
      {msgView === "list" && (
        <>
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase">Messages</h3>
                <p className="text-xs text-zinc-500 mt-1">Conversation-based messaging with your team</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-acid/30" />
                </div>
                <button onClick={openCompose} className="bg-acid hover:bg-white text-black font-black rounded-xl px-5 py-3 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Plus className="size-4" /> New
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Broadcasts summary */}
            {broadcasts.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 cursor-pointer hover:border-blue-500/20 transition"
                onClick={() => {}}>
                <div className="flex items-center gap-3">
                  <Radio className="size-5 text-blue-400" />
                  <span className="font-bold text-white">Broadcasts</span>
                  <span className="text-xs text-zinc-500">{broadcasts.length} messages</span>
                </div>
                {broadcasts[0] && (
                  <p className="text-sm text-zinc-400 mt-2 ml-8 truncate">{broadcasts[0].message}</p>
                )}
              </div>
            )}

            {/* Conversation list */}
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="size-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No conversations yet</p>
                <button onClick={openCompose} className="text-acid hover:underline text-sm mt-2">Start one</button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv: any) => (
                  <div key={conv.contactEmail} onClick={() => openThread(conv)}
                    className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all hover:border-acid/30 ${conv.unreadCount > 0 ? "bg-acid/5 border border-acid/20" : "bg-white/5 border border-white/10"}`}>
                    <div className="size-12 rounded-full bg-acid/10 border border-acid/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-acid">{conv.contactName[0]?.toUpperCase() || "?"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${conv.unreadCount > 0 ? "text-white" : "text-zinc-200"}`}>{conv.contactName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(conv.contactRole)}`}>{conv.contactRole}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-zinc-200" : "text-zinc-500"}`}>
                        {conv.lastMessage.senderEmail === userEmail ? "You: " : ""}{conv.lastMessage.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-zinc-500">{formatTime(conv.lastMessage.createdAt)}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-acid text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* === THREAD VIEW === */}
      {msgView === "thread" && activeContact && (
        <div className="flex flex-col" style={{ height: "600px" }}>
          <div className="flex items-center gap-4 p-6 border-b border-white/5 flex-shrink-0">
            <button onClick={() => { setMsgView("list"); fetchConversations(true); }} className="p-2 rounded-xl hover:bg-white/5 transition">
              <ArrowLeft className="size-5" />
            </button>
            <div className="size-10 rounded-full bg-acid/10 border border-acid/20 flex items-center justify-center">
              <span className="font-bold text-acid">{activeContact.name[0]?.toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{activeContact.name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(activeContact.role)}`}>{activeContact.role}</span>
              </div>
              <p className="text-xs text-zinc-500">{activeContact.email}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {threadLoading ? (
              <div className="text-center text-zinc-500 py-8">Loading...</div>
            ) : threadMessages.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">No messages yet. Start the conversation!</div>
            ) : (
              threadMessages.map((msg: any) => {
                const isMine = msg.senderEmail === userEmail;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMine ? "bg-acid text-black rounded-br-md" : "bg-white/10 text-white rounded-bl-md"}`}>
                      {msg.subject && <p className={`text-xs font-bold mb-1 ${isMine ? "text-black/60" : "text-zinc-400"}`}>{msg.subject}</p>}
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                        <span className={`text-[10px] ${isMine ? "text-black/50" : "text-zinc-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMine && (msg.isRead ? <CheckCheck className="size-3 text-black/50" /> : <Check className="size-3 text-black/40" />)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <div className="flex gap-3">
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type a message..." rows={1}
                className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-acid/30" />
              <button onClick={sendReply} disabled={replySending || !replyText.trim()}
                className="bg-acid text-black p-3 rounded-xl hover:bg-white transition disabled:opacity-50">
                <Send className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === COMPOSE VIEW === */}
      {msgView === "compose" && (
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setMsgView("list")} className="p-2 rounded-xl hover:bg-white/5 transition">
              <ArrowLeft className="size-5" />
            </button>
            <h3 className="text-xl font-display font-bold text-white uppercase">New Message</h3>
          </div>

          <div className="space-y-5 max-w-2xl">
            {/* Broadcast toggle */}
            <div className="flex items-center gap-3">
              <button onClick={() => setIsBroadcast(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition ${!isBroadcast ? "bg-acid text-black" : "bg-white/5 text-zinc-500 hover:text-white"}`}>
                <User className="size-4 inline mr-1.5" />Personal
              </button>
              <button onClick={() => setIsBroadcast(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition ${isBroadcast ? "bg-blue-500 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}>
                <Radio className="size-4 inline mr-1.5" />Broadcast
              </button>
            </div>

            {/* Recipient */}
            {!isBroadcast && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Recipient</label>
                {selectedRecipient ? (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="size-8 rounded-full bg-acid/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-acid">{selectedRecipient.name[0]?.toUpperCase()}</span>
                    </div>
                    <span className="font-bold text-white">{selectedRecipient.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(selectedRecipient.role)}`}>{selectedRecipient.role}</span>
                    <button onClick={() => setSelectedRecipient(null)} className="ml-auto text-zinc-400 hover:text-white text-xl">×</button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                      <input type="text" placeholder="Search staff..." value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-acid/30" />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 bg-black/20 rounded-xl p-2 border border-white/5">
                      {filteredContacts.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center py-4">No contacts found</p>
                      ) : (
                        filteredContacts.map((c: any) => (
                          <button key={c.id} onClick={() => { setSelectedRecipient(c); setContactSearch(""); }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition text-left">
                            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                              <span className="text-xs font-bold text-zinc-300">{c.name[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{c.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{c.email}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(c.role)}`}>{c.role}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Subject (optional)</label>
              <input type="text" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} placeholder="Subject..."
                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-acid/30" />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message</label>
              <textarea value={composeMessage} onChange={(e) => setComposeMessage(e.target.value)} placeholder="Type your message..." rows={6}
                className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white resize-none focus:outline-none focus:border-acid/30" />
            </div>

            <div className="flex gap-3">
              <button onClick={sendNewMessage} disabled={sending || !composeMessage.trim() || (!isBroadcast && !selectedRecipient)}
                className="bg-acid hover:bg-white text-black font-black rounded-xl px-6 py-3 text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                <Send className="size-4" />{sending ? "Sending..." : isBroadcast ? "Send Broadcast" : "Send Message"}
              </button>
              <button onClick={() => setMsgView("list")} className="px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
