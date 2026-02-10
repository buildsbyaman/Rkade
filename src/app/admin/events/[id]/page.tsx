"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { isUserAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  Tag,
  ChevronRight,
  TrendingUp,
  User,
  ShieldCheck,
  MoreVertical,
  QrCode,
  FileText,
  Presentation,
  Eye,
  ExternalLink,
  UserPlus,
  MessageSquare,
  ListTodo,
  Plus,
  Send,
  Check,
  CheckCheck,
  Radio
} from "lucide-react";
import type { Assignment, Task, Message, StaffMember } from "@/types/staff";

interface Booking {
  id: string;
  userEmail: string;
  userName: string;
  verified: boolean;
  scannedAt?: string;
  scannedBy?: string;
  createdAt: string;
  qrCodeToken?: string;
  teamName?: string;
  teamDetails?: Array<{ name: string; aadhar: string; isLeader?: boolean }>;
}

interface TimelineItem {
  time: string;
  title: string;
  description?: string;
}

interface Performer {
  name: string;
  role: string;
  image?: string;
}

interface EventDetail {
  id: string;
  eventName: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
  price?: string;
  description?: string;
  landscapePoster?: string;
  portraitPoster?: string;
  duration?: string;
  eventType?: string;
  ageLimit?: string;
  language?: string;
  theme?: string;
  registration_start?: string;
  registration_end?: string;
  result_date?: string;
  bookings: Booking[];
  timeline?: any[];
  performers?: any;
  pptUrl?: string;
  pptTitle?: string;
  timelineDocument?: {
    url: string;
    title: string;
    type: 'pdf' | 'ppt' | 'doc' | 'image';
  };
}

export default function AdminEventDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"bookings" | "details" | "timeline" | "ppt" | "assignments" | "tasks" | "messages">("bookings");
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{ url: string; title: string; type: string } | null>(null);
  
  // Staff management state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Form state for modals
  const [assignmentForm, setAssignmentForm] = useState({ staffId: '', venue: '', session: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', venue: '' });
  const [messageForm, setMessageForm] = useState({ receiverId: '', subject: '', content: '', broadcast: false });
  const [staffForm, setStaffForm] = useState({ email: '', firstName: '', lastName: '', role: 'LO', phoneNumber: '', countryCode: '+91', country: 'India', currentCity: '' });

  // Thread-based messaging state
  const [msgView, setMsgView] = useState<"list" | "thread">("list");
  const [activeThread, setActiveThread] = useState<{ email: string; name: string; role: string } | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email || "";

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event details");
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email && isUserAdmin(session.user.email)) {
      fetchEventDetails();
    }
  }, [session?.user?.email, eventId]);

  // Load staff management data
  useEffect(() => {
    const loadStaffData = async () => {
      if (!eventId || !session?.user?.email) return;
      
      try {
        if (activeTab === "assignments" || activeTab === "tasks" || activeTab === "messages") {
          const [staffRes, assignmentsRes, tasksRes, messagesRes] = await Promise.all([
            fetch("/api/admin/staff"),
            fetch(`/api/admin/assignments?eventId=${eventId}`),
            fetch(`/api/admin/tasks?eventId=${eventId}`),
            fetch(`/api/admin/messages?eventId=${eventId}`)
          ]);

          setStaff(await staffRes.json());
          setAssignments(await assignmentsRes.json());
          setTasks(await tasksRes.json());
          setMessages(await messagesRes.json());
        }
      } catch (error) {
        console.error("Error loading staff data:", error);
      }
    };

    if (session?.user?.email && isUserAdmin(session.user.email)) {
      loadStaffData();
    }
  }, [session?.user?.email, eventId, activeTab]);

  // Auto-scroll thread messages
  useEffect(() => {
    if (msgView === "thread" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [threadMessages, msgView]);

  const exportToCSV = () => {
    if (!event) return;
    const headers = ["Name", "Email", "Team Name", "Team Members", "Status", "Booked At", "Verified At", "Verified By"];
    const rows = event.bookings.map(b => [
      b.userName,
      b.userEmail,
      b.teamName || "Individual",
      (b.teamDetails || []).map(m => `${m.name}${m.isLeader ? ' (Leader)' : ''}`).join(" | "),
      b.verified ? "Verified" : "Pending",
      new Date(b.createdAt).toLocaleString(),
      b.scannedAt ? new Date(b.scannedAt).toLocaleString() : "N/A",
      b.scannedBy || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.eventName.replace(/ /g, "_")}_bookings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.staffId || !assignmentForm.venue) {
      alert('Please fill in required fields');
      return;
    }

    const selectedStaff = staff.find(s => s.id === assignmentForm.staffId);
    if (!selectedStaff) return;

    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: assignmentForm.staffId,
          userEmail: selectedStaff.email,
          userName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
          role: selectedStaff.role,
          venue: assignmentForm.venue,
          session: assignmentForm.session || undefined,
        })
      });

      if (response.ok) {
        const newAssignment = await response.json();
        setAssignments([...assignments, newAssignment]);
        setAssignmentForm({ staffId: '', venue: '', session: '' });
        setIsAssignmentModalOpen(false);
      } else {
        alert('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment');
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.description || !taskForm.assignedTo) {
      alert('Please fill in required fields');
      return;
    }

    const selectedStaff = staff.find(s => s.id === taskForm.assignedTo);
    if (!selectedStaff) return;

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          assignedTo: taskForm.assignedTo,
          assignedToEmail: selectedStaff.email,
          assignedToName: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
          assignedToRole: selectedStaff.role,
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || undefined,
          venue: taskForm.venue || undefined,
        })
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', venue: '' });
        setIsTaskModalOpen(false);
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.content || (!messageForm.receiverId && !messageForm.broadcast)) {
      alert('Please fill in required fields');
      return;
    }

    const selectedStaff = messageForm.receiverId ? staff.find(s => s.id === messageForm.receiverId) : null;

    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          recipientId: messageForm.broadcast ? undefined : messageForm.receiverId,
          recipientEmail: messageForm.broadcast ? undefined : selectedStaff?.email,
          recipientName: messageForm.broadcast ? undefined : `${selectedStaff?.firstName} ${selectedStaff?.lastName}`,
          recipientRole: messageForm.broadcast ? undefined : selectedStaff?.role,
          subject: messageForm.subject,
          message: messageForm.content,
          isBroadcast: messageForm.broadcast
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageForm({ receiverId: '', subject: '', content: '', broadcast: false });
        setIsMessageModalOpen(false);
        // If we're in a thread with this recipient, refresh it
        if (activeThread) {
          fetchEventThread(activeThread.email, true);
        }
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  // Group messages into conversations for the event
  const getEventConversations = () => {
    const convMap = new Map<string, { contactEmail: string; contactName: string; contactRole: string; lastMessage: any; unreadCount: number; messageCount: number }>();
    for (const msg of messages) {
      if (msg.isBroadcast) continue;
      const isOutgoing = msg.senderEmail === userEmail;
      const contactEmail = isOutgoing ? msg.recipientEmail : msg.senderEmail;
      const contactName = isOutgoing ? (msg.recipientName || contactEmail) : (msg.senderName || contactEmail);
      const contactRole = isOutgoing ? (msg.recipientRole || '') : (msg.senderRole || '');
      if (!contactEmail) continue;
      const existing = convMap.get(contactEmail);
      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
        convMap.set(contactEmail, {
          contactEmail,
          contactName,
          contactRole,
          lastMessage: msg,
          unreadCount: (existing?.unreadCount || 0) + (!isOutgoing && !msg.isRead ? 1 : 0),
          messageCount: (existing?.messageCount || 0) + 1,
        });
      } else {
        existing.messageCount++;
        if (!isOutgoing && !msg.isRead) existing.unreadCount++;
      }
    }
    return Array.from(convMap.values()).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  };

  const fetchEventThread = async (contactEmail: string, silent = false) => {
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

  const openEventThread = (conv: { contactEmail: string; contactName: string; contactRole: string }) => {
    setActiveThread({ email: conv.contactEmail, name: conv.contactName, role: conv.contactRole });
    setMsgView("thread");
    fetchEventThread(conv.contactEmail);
  };

  const sendEventReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    setReplySending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          recipientEmail: activeThread.email,
          recipientName: activeThread.name,
          recipientRole: activeThread.role,
          message: replyText.trim(),
          isBroadcast: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      setReplyText("");
      fetchEventThread(activeThread.email, true);
      // Refresh the messages list too
      const messagesRes = await fetch(`/api/admin/messages?eventId=${eventId}`);
      if (messagesRes.ok) setMessages(await messagesRes.json());
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendEventReply();
    }
  };

  const formatMsgTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
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

  const handleCreateStaff = async () => {
    if (!staffForm.email || !staffForm.firstName || !staffForm.lastName || !staffForm.role) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });

      if (response.ok) {
        const newStaff = await response.json();
        setStaff([...staff, newStaff]);
        setStaffForm({ email: '', firstName: '', lastName: '', role: 'LO', phoneNumber: '', countryCode: '+91', country: 'India', currentCity: '' });
        setIsStaffModalOpen(false);
        alert('Staff member created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create staff member');
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Error creating staff member');
    }
  };

  if (loading) return (
     <div className="space-y-8 animate-pulse">
        <div className="h-8 w-32 bg-white/5 rounded-lg"></div>
        <div className="h-48 bg-white/5 rounded-[2.5rem] border border-white/5"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
           <div className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
           <div className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
        </div>
        <div className="h-[400px] bg-white/5 rounded-[2.5rem] border border-white/5"></div>
     </div>
  );

  if (!event) return <div>Event not found</div>;

  const verifiedCount = event.bookings.filter(b => b.verified).length;
  const filteredBookings = event.bookings.filter(
    b => b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <Link href="/admin/events" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">Back to Console</span>
         </Link>
         <div className="flex gap-3">
            <Button 
               variant="outline" 
               onClick={exportToCSV}
               className="border-white/5 bg-white/[0.03] text-zinc-400 hover:text-white rounded-xl px-6"
            >
               <Download className="mr-2 size-4" />
               Export CSV
            </Button>
            <Link href="/admin/verify">
               <Button className="bg-acid hover:bg-white text-black font-black uppercase tracking-widest px-6 rounded-xl">
                  <QrCode className="mr-2 size-4" />
                  Scanner
               </Button>
            </Link>
         </div>
      </div>

      <div className="relative rounded-[2.5rem] overflow-hidden bg-white/[0.03] border border-white/5 p-8 md:p-12">
         <div className="absolute top-0 right-0 w-96 h-96 bg-acid/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         
         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
               <span className="px-3 py-1 bg-acid/10 text-acid text-[10px] font-black uppercase tracking-widest rounded-full border border-acid/20">
                  Event Active
               </span>
               <span className="text-zinc-600 font-bold px-2 inline-block">•</span>
               <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">ID: {event.id.slice(-8).toUpperCase()}</span>
            </div>
            
            <div>
               <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-white leading-none">
                  {event.eventName}
               </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12 border-t border-white/5 pt-8 mt-4">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</p>
                  <p className="text-white font-bold">{event.category || "General Event"}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date & Time</p>
                  <p className="text-white font-bold">
                    {event.date ? new Date(event.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }) : "TBA"}
                    {event.time && ` • ${event.time}`}
                  </p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pricing</p>
                  <p className="text-acid font-black uppercase">{event.price === "FREE" || event.price === "0" ? "FREE" : `₹${event.price}`}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location</p>
                  <p className="text-white font-bold truncate">{event.venue || "Campus Main Gate"}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Registrations</p>
              <Users className="size-4 text-acid" />
           </div>
           <div className="flex items-end gap-3">
              <h3 className="text-4xl font-display font-bold text-white tracking-tighter">{event.bookings.length}</h3>
              <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Users</p>
           </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 shadow-[inset_0_0_20px_rgba(204,255,0,0.02)]">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Verified Entries</p>
              <ShieldCheck className="size-4 text-green-400" />
           </div>
           <div className="flex items-end gap-3">
              <h3 className="text-4xl font-display font-bold text-green-400 tracking-tighter">{verifiedCount}</h3>
              <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Check-ins</p>
           </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Attendance Rate</p>
              <TrendingUp className="size-4 text-purple-400" />
           </div>
           <div className="space-y-2">
              <h3 className="text-4xl font-display font-bold text-white tracking-tighter">
                {event.bookings.length > 0 ? Math.round((verifiedCount / event.bookings.length) * 100) : 0}%
              </h3>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-acid via-green-400 to-emerald-500 rounded-full" 
                   style={{ width: `${event.bookings.length > 0 ? (verifiedCount / event.bookings.length) * 100 : 0}%` }}
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="flex flex-wrap p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit gap-1">
            {["bookings", "details", "timeline", "ppt", "assignments", "tasks", "messages"].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-acid text-black" : "text-zinc-500 hover:text-white"
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden min-h-[400px]">
            {activeTab === "bookings" && (
               <div className="animate-in fade-in duration-300">
                  <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Attendee Roster</h3>
                        <p className="text-xs text-zinc-500 mt-1">Real-time list of all booked tickets and their verification status.</p>
                     </div>
                     <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input 
                           type="text" 
                           placeholder="Search attendees..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                        />
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="bg-white/[0.01]">
                              <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Participant</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Team Identity</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Status</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Check-in Info</th>
                              <th className="px-8 py-4 text-right text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                           {filteredBookings.map((booking, idx) => (
                              <tr key={booking.id} className="group hover:bg-white/[0.01] transition-colors">
                                 <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                          <User className="size-4 text-zinc-500" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-white uppercase">{booking.userName}</p>
                                          <p className="text-[10px] text-zinc-500 font-mono">{booking.userEmail}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    {booking.teamName ? (
                                       <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                             <span className="text-xs font-black text-acid uppercase tracking-wider">{booking.teamName}</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                             {booking.teamDetails?.map((m: any, i: number) => (
                                                <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded ${m.isLeader ? 'bg-acid text-black font-black' : 'bg-white/5 text-zinc-500'}`}>
                                                   {m.name.split(' ')[0]}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    ) : (
                                       <span className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">— Individual —</span>
                                    )}
                                 </td>
                                 <td className="px-6 py-4">
                                    {booking.verified ? (
                                       <div className="flex items-center gap-2 text-green-400 bg-green-400/5 px-3 py-1 rounded-full border border-green-400/20 w-fit">
                                          <div className="size-1.5 rounded-full bg-green-400"></div>
                                          <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-2 text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 w-fit">
                                          <div className="size-1.5 rounded-full bg-zinc-600"></div>
                                          <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                       </div>
                                    )}
                                 </td>
                                 <td className="px-6 py-4">
                                    {booking.verified ? (
                                       <div className="space-y-0.5">
                                          <div className="flex items-center gap-1.5 text-zinc-400">
                                             <Clock className="size-3" />
                                             <span className="text-[10px] font-medium">{new Date(booking.scannedAt!).toLocaleTimeString()}</span>
                                          </div>
                                          <div className="text-[10px] text-zinc-600 font-bold uppercase truncate max-w-[120px]">
                                             Admin: {booking.scannedBy?.split("@")[0] || "Scanner"}
                                          </div>
                                       </div>
                                    ) : (
                                       <span className="text-zinc-700 text-[10px] font-bold uppercase">— Standby —</span>
                                    )}
                                 </td>
                                 <td className="px-8 py-4 text-right">
                                    <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white">
                                       <MoreVertical className="size-4" />
                                    </Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === "details" && (
                <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-3xl">
                   <div className="space-y-12">
                      <section className="space-y-4">
                         <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Event Protocol</h3>
                            <div className="h-px flex-1 bg-white/5"></div>
                         </div>
                         <p className="text-zinc-400 leading-relaxed font-body">
                            {event.description || "The mission parameters for this event have not been detailed. Please coordinate with the campus event leads for specific operational requirements and entry protocols."}
                         </p>
                      </section>

                       <section className="space-y-4">
                          <div className="flex items-center gap-4">
                             <h3 className="text-2xl font-display font-bold uppercase text-white tracking-tighter">Mission Readiness</h3>
                             <div className="h-px flex-1 bg-white/5"></div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                             <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Registration Window</p>
                                <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                      <span className="text-xs text-zinc-400">Deployment</span>
                                      <span className="text-xs font-bold text-white">{event.registration_start ? new Date(event.registration_start).toLocaleString("en-GB") : "TBA"}</span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                      <span className="text-xs text-zinc-400">Termination</span>
                                      <span className="text-xs font-bold text-white">{event.registration_end ? new Date(event.registration_end).toLocaleString("en-GB") : "TBA"}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Result Protocol</p>
                                <p className="text-xl font-display font-bold text-acid uppercase">
                                   {event.result_date ? new Date(event.result_date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "TBA"}
                                </p>
                             </div>
                          </div>
                       </section>

                       <section className="space-y-4">
                          <div className="flex items-center gap-4">
                             <h3 className="text-2xl font-display font-bold uppercase text-white tracking-tighter">Field Operatives</h3>
                             <div className="h-px flex-1 bg-white/5"></div>
                          </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {Array.isArray(event.performers) ? event.performers.map((p: any, i: number) => (
                               <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 group">
                                  <div className="size-12 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-acid/30 transition-all">
                                     {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <User className="size-6 text-zinc-600" />}
                                  </div>
                                  <div>
                                     <p className="font-bold text-white group-hover:text-acid transition-colors">{p.name}</p>
                                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{p.role}</p>
                                  </div>
                               </div>
                            )) : event.performers ? (
                              <div className="col-span-2 p-6 rounded-3xl bg-white/5 border border-white/5">
                                 <p className="text-white font-medium">{event.performers}</p>
                              </div>
                            ) : (
                               <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                  <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No operatives assigned</p>
                               </div>
                            )}
                         </div>
                      </section>
                   </div>
                </div>
            )}

            {activeTab === "timeline" && (
                <div className="p-8 md:p-12 animate-in fade-in slide-in-from-left-5 duration-500">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Event Timeline</h3>
                      {event.timelineDocument && (
                         <Button 
                           onClick={() => {
                             setCurrentDocument({
                               url: event.timelineDocument!.url,
                               title: event.timelineDocument!.title,
                               type: event.timelineDocument!.type
                             });
                             setIsDocumentOpen(true);
                           }}
                           className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-4 py-2"
                         >
                           <Eye className="mr-2 size-4" />
                           View Document
                         </Button>
                      )}
                   </div>
                   
                   <div className="relative pl-8 space-y-12">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-acid via-white/10 to-transparent"></div>
                      
                      {event.timeline?.length ? event.timeline.map((item, idx) => (
                         <div key={idx} className="relative">
                            <div className="absolute -left-[32px] top-0 size-4 rounded-full bg-black border-2 border-acid flex items-center justify-center">
                               <div className="size-1.5 rounded-full bg-acid animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                               <div className="flex items-center gap-4">
                                  <span className="text-acid font-mono font-black text-sm">{item.time}</span>
                                  <h4 className="text-xl font-display font-bold text-white uppercase tracking-tighter">{item.title}</h4>
                               </div>
                               <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">{item.description}</p>
                            </div>
                         </div>
                      )) : (
                        <div className="py-20 text-center">
                           <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Operational timeline pending approval</p>
                        </div>
                      )}
                   </div>
                </div>
            )}

            {activeTab === "ppt" && (
                <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-5 duration-500">
                   <div className="space-y-8">
                      <div className="flex items-center gap-4">
                         <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Event Presentation</h3>
                         <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      
                      {event.pptUrl ? (
                        <div className="space-y-6">
                           <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                              <div className="flex items-center gap-4">
                                 <div className="size-12 rounded-2xl bg-acid/10 border border-acid/20 flex items-center justify-center">
                                    <Presentation className="size-6 text-acid" />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-bold text-white">{event.pptTitle || 'Event Presentation'}</h4>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">PowerPoint Presentation</p>
                                 </div>
                              </div>
                              <div className="flex gap-3">
                                 <Button 
                                   onClick={() => {
                                     setCurrentDocument({
                                       url: event.pptUrl!,
                                       title: event.pptTitle || 'Event Presentation',
                                       type: 'ppt'
                                     });
                                     setIsDocumentOpen(true);
                                   }}
                                   className="bg-acid hover:bg-white text-black font-black rounded-xl px-6"
                                 >
                                    <Eye className="mr-2 size-4" />
                                    View PPT
                                 </Button>
                                 <Button 
                                   variant="outline"
                                   onClick={() => window.open(event.pptUrl, '_blank')}
                                   className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl px-6"
                                 >
                                    <ExternalLink className="mr-2 size-4" />
                                    Open External
                                 </Button>
                              </div>
                           </div>
                           
                           <div className="rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                              <iframe 
                                src={event.pptUrl}
                                className="w-full h-[600px] border-0"
                                title={event.pptTitle || 'Event Presentation'}
                              />
                           </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center space-y-4">
                           <div className="size-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <Presentation className="size-8 text-zinc-600" />
                           </div>
                           <div>
                              <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No presentation available</p>
                              <p className="text-zinc-700 text-xs mt-1">Event presentation will be displayed here when uploaded</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
            )}

            {activeTab === "assignments" && (
                <div className="p-8 md:p-12 animate-in fade-in duration-500">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Staff Assignments</h3>
                         <p className="text-xs text-zinc-500 mt-1">Allocate LOs and Moderators to venues and sessions</p>
                      </div>
                      <div className="flex gap-3">
                         <Button 
                           onClick={() => setIsStaffModalOpen(true)}
                           variant="outline"
                           className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl px-6"
                         >
                            <UserPlus className="mr-2 size-4" />
                            Create Staff
                         </Button>
                         <Button 
                           onClick={() => setIsAssignmentModalOpen(true)}
                           className="bg-acid hover:bg-white text-black font-black rounded-xl px-6"
                         >
                            <UserPlus className="mr-2 size-4" />
                            New Assignment
                         </Button>
                      </div>
                   </div>
                   
                   <div className="grid gap-4">
                      {assignments.length > 0 ? assignments.map((assignment) => (
                         <div key={assignment.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-start justify-between">
                               <div className="flex items-start gap-4 flex-1">
                                  <div className="size-12 rounded-2xl bg-acid/10 border border-acid/20 flex items-center justify-center">
                                     <User className="size-6 text-acid" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-bold text-white">{assignment.userName}</h4>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                                          assignment.role === 'LO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }`}>
                                          {assignment.role}
                                        </span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                                          assignment.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                          assignment.status === 'completed' ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' :
                                          'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                          {assignment.status}
                                        </span>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-sm text-zinc-400">
                                           <span className="text-zinc-500 font-bold">Venue:</span> {assignment.venue || 'Not specified'}
                                        </p>
                                        {assignment.session && (
                                           <p className="text-sm text-zinc-400">
                                              <span className="text-zinc-500 font-bold">Session:</span> {assignment.session}
                                           </p>
                                        )}
                                        <p className="text-xs text-zinc-600 mt-2">
                                           {new Date(assignment.assignedAt).toLocaleString()}
                                        </p>
                                     </div>
                                  </div>
                               </div>
                               <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white">
                                  <MoreVertical className="size-4" />
                               </Button>
                            </div>
                         </div>
                      )) : (
                        <div className="py-20 text-center space-y-4">
                           <div className="size-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <UserPlus className="size-8 text-zinc-600" />
                           </div>
                           <div>
                              <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No assignments yet</p>
                              <p className="text-zinc-700 text-xs mt-1">Start by assigning staff to venues and sessions</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
            )}

            {activeTab === "tasks" && (
                <div className="p-8 md:p-12 animate-in fade-in duration-500">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Task Management</h3>
                         <p className="text-xs text-zinc-500 mt-1">Assign and track tasks for event staff</p>
                      </div>
                      <div className="flex gap-3">
                         <Button 
                           onClick={() => setIsTaskModalOpen(true)}
                           className="bg-acid hover:bg-white text-black font-black rounded-xl px-6"
                         >
                            <Plus className="mr-2 size-4" />
                            Create Task
                         </Button>
                      </div>
                   </div>
                   
                   <div className="grid gap-4">
                      {tasks.length > 0 ? tasks.map((task) => (
                         <div key={task.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-start justify-between">
                               <div className="flex items-start gap-4 flex-1">
                                  <div className={`size-12 rounded-2xl flex items-center justify-center border ${
                                    task.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20' :
                                    task.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                                    task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                    'bg-blue-500/10 border-blue-500/20'
                                  }`}>
                                     <ListTodo className={`size-6 ${
                                       task.priority === 'urgent' ? 'text-red-400' :
                                       task.priority === 'high' ? 'text-orange-400' :
                                       task.priority === 'medium' ? 'text-yellow-400' :
                                       'text-blue-400'
                                     }`} />
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-bold text-white">{task.title}</h4>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                          task.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                          {task.priority}
                                        </span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                                          task.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                          task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                          'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                        }`}>
                                          {task.status}
                                        </span>
                                     </div>
                                     <p className="text-sm text-zinc-400 mb-3">{task.description}</p>
                                     <div className="flex items-center gap-4 text-xs">
                                        <span className="text-zinc-500">
                                           <span className="font-bold">Assigned to:</span> {task.assignedToName}
                                        </span>
                                        {task.dueDate && (
                                           <span className="text-zinc-500">
                                              <span className="font-bold">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                                           </span>
                                        )}
                                        {task.venue && (
                                           <span className="text-zinc-500">
                                              <span className="font-bold">Venue:</span> {task.venue}
                                           </span>
                                        )}
                                     </div>
                                  </div>
                               </div>
                               <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white">
                                  <MoreVertical className="size-4" />
                               </Button>
                            </div>
                         </div>
                      )) : (
                        <div className="py-20 text-center space-y-4">
                           <div className="size-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <ListTodo className="size-8 text-zinc-600" />
                           </div>
                           <div>
                              <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No tasks assigned</p>
                              <p className="text-zinc-700 text-xs mt-1">Create tasks to organize your event workflow</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
            )}

            {activeTab === "messages" && (
                <div className="p-8 md:p-12 animate-in fade-in duration-500">
                   {msgView === "list" && (
                     <>
                       <div className="flex items-center justify-between mb-8">
                          <div>
                             <h3 className="text-2xl font-display font-bold uppercase text-acid tracking-tighter">Messages</h3>
                             <p className="text-xs text-zinc-500 mt-1">Communication with event staff</p>
                          </div>
                          <div className="flex gap-3">
                             <Link href="/admin/messages" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold rounded-xl px-4 py-2.5 border border-white/5 text-sm transition">
                                <ExternalLink className="size-4" />
                                All Messages
                             </Link>
                             <Button 
                               onClick={() => setIsMessageModalOpen(true)}
                               className="bg-acid hover:bg-white text-black font-black rounded-xl px-6"
                             >
                                <Send className="mr-2 size-4" />
                                Send Message
                             </Button>
                          </div>
                       </div>
                       
                       {(() => {
                         const eventConversations = getEventConversations();
                         const broadcastMsgs = messages.filter(m => m.isBroadcast);
                         return (
                           <div className="space-y-2">
                             {broadcastMsgs.length > 0 && (
                               <div className="mb-4">
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Broadcasts</p>
                                 {broadcastMsgs.map((b: any) => (
                                   <div key={b.id} className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 mb-2">
                                     <div className="flex items-center gap-3 mb-2">
                                       <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                         <Radio className="size-4 text-purple-400" />
                                       </div>
                                       <span className="font-bold text-white text-sm">{b.senderName}</span>
                                       <span className="text-[10px] text-zinc-600 font-mono ml-auto">{formatMsgTime(b.createdAt)}</span>
                                     </div>
                                     {b.subject && <p className="text-xs font-bold text-white mb-1">{b.subject}</p>}
                                     <p className="text-sm text-zinc-400">{b.message}</p>
                                   </div>
                                 ))}
                               </div>
                             )}
                             
                             {eventConversations.length > 0 ? (
                               <>
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Conversations</p>
                                 {eventConversations.map((conv) => (
                                   <div key={conv.contactEmail} onClick={() => openEventThread(conv)}
                                     className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all hover:border-acid/30 ${conv.unreadCount > 0 ? "bg-acid/5 border border-acid/20" : "bg-white/[0.02] border border-white/5"}`}>
                                     <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                       <span className="text-lg font-black text-acid">{conv.contactName[0]?.toUpperCase() || "?"}</span>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                         <span className={`font-bold ${conv.unreadCount > 0 ? "text-white" : "text-zinc-300"}`}>{conv.contactName}</span>
                                         {conv.contactRole && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${getRoleBadgeColor(conv.contactRole)}`}>{conv.contactRole}</span>}
                                       </div>
                                       <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-zinc-300" : "text-zinc-600"}`}>
                                         {conv.lastMessage.senderEmail === userEmail ? "You: " : ""}{conv.lastMessage.message}
                                       </p>
                                     </div>
                                     <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                       <span className="text-[10px] text-zinc-600 font-mono">{formatMsgTime(conv.lastMessage.createdAt)}</span>
                                       {conv.unreadCount > 0 && (
                                         <span className="bg-acid text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{conv.unreadCount}</span>
                                       )}
                                       <ChevronRight className="size-4 text-zinc-700" />
                                     </div>
                                   </div>
                                 ))}
                               </>
                             ) : broadcastMsgs.length === 0 && (
                               <div className="py-20 text-center space-y-4">
                                 <div className="size-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                   <MessageSquare className="size-8 text-zinc-600" />
                                 </div>
                                 <div>
                                   <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No messages yet</p>
                                   <p className="text-zinc-700 text-xs mt-1">Start a conversation with your event staff</p>
                                 </div>
                               </div>
                             )}
                           </div>
                         );
                       })()}
                     </>
                   )}

                   {msgView === "thread" && activeThread && (
                     <div className="flex flex-col" style={{ minHeight: "60vh" }}>
                       <div className="flex items-center gap-4 pb-4 border-b border-white/5 flex-shrink-0">
                         <button onClick={() => { setMsgView("list"); setActiveThread(null); }} className="p-2 rounded-xl hover:bg-white/5 transition">
                           <ArrowLeft className="w-5 h-5 text-zinc-400" />
                         </button>
                         <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                           <span className="text-lg font-black text-acid">{activeThread.name[0]?.toUpperCase() || "?"}</span>
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <h2 className="font-bold text-white">{activeThread.name}</h2>
                             {activeThread.role && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${getRoleBadgeColor(activeThread.role)}`}>{activeThread.role}</span>}
                           </div>
                           <p className="text-[10px] text-zinc-600 font-mono">{activeThread.email}</p>
                         </div>
                       </div>

                       <div className="flex-1 overflow-y-auto py-4 space-y-3" style={{ maxHeight: "50vh" }}>
                         {threadLoading ? (
                           <div className="text-center text-zinc-600 py-8 font-mono text-sm">Loading messages...</div>
                         ) : threadMessages.length === 0 ? (
                           <div className="text-center text-zinc-600 py-8 font-mono text-sm">No messages yet</div>
                         ) : (
                           threadMessages.map((msg: any) => {
                             const isMine = msg.senderEmail === userEmail;
                             return (
                               <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                 <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMine ? "bg-acid text-black rounded-br-md" : "bg-white/[0.04] border border-white/5 text-white rounded-bl-md"}`}>
                                   {msg.subject && <p className={`text-[10px] font-black mb-1 uppercase tracking-wider ${isMine ? "text-black/50" : "text-zinc-500"}`}>{msg.subject}</p>}
                                   <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                   <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                                     <span className={`text-[10px] ${isMine ? "text-black/40" : "text-zinc-600"}`}>
                                       {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                     </span>
                                     {isMine && (msg.isRead ? <CheckCheck className="w-3 h-3 text-black/40" /> : <Check className="w-3 h-3 text-black/30" />)}
                                   </div>
                                 </div>
                               </div>
                             );
                           })
                         )}
                         <div ref={messagesEndRef} />
                       </div>

                       <div className="pt-4 border-t border-white/5 flex-shrink-0">
                         <div className="flex gap-3">
                           <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={handleReplyKeyDown}
                             placeholder="Type a reply..." rows={1}
                             className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-acid/30 font-mono" />
                           <button onClick={sendEventReply} disabled={replySending || !replyText.trim()}
                             className="bg-acid text-black p-3 rounded-xl hover:bg-white transition disabled:opacity-50">
                             <Send className="w-5 h-5" />
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
                </div>
            )}
         </div>
      </div>
      
      <Dialog open={isDocumentOpen} onOpenChange={setIsDocumentOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              {currentDocument?.title || 'Document Viewer'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {currentDocument?.type.toUpperCase()} Document Preview
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 rounded-xl overflow-hidden bg-white/5 border border-white/10">
            {currentDocument && (
              <iframe 
                src={currentDocument.url}
                className="w-full h-full border-0 rounded-xl"
                title={currentDocument.title}
              />
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => currentDocument && window.open(currentDocument.url, '_blank')}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <ExternalLink className="mr-2 size-4" />
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">New Staff Assignment</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Assign a staff member to a venue or session for this event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Staff Member</label>
              <select 
                value={assignmentForm.staffId}
                onChange={(e) => setAssignmentForm({...assignmentForm, staffId: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30"
              >
                <option value="" className="bg-zinc-900 text-white">Select staff member...</option>
                {staff.filter(s => s.role === 'LO' || s.role === 'MODERATOR').map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.firstName} {s.lastName} ({s.role})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Venue</label>
              <input 
                type="text"
                placeholder="e.g., Main Auditorium, Lab 101..."
                value={assignmentForm.venue}
                onChange={(e) => setAssignmentForm({...assignmentForm, venue: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Session (Optional)</label>
              <input 
                type="text"
                placeholder="e.g., Opening Ceremony, Round 1..."
                value={assignmentForm.session}
                onChange={(e) => setAssignmentForm({...assignmentForm, session: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setIsAssignmentModalOpen(false)}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssignment}
              className="bg-acid hover:bg-white text-black font-black rounded-xl"
            >
              Create Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Create New Task</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Assign a task to a staff member for this event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Task Title</label>
              <input 
                type="text"
                placeholder="e.g., Setup registration desk..."
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Description</label>
              <textarea 
                placeholder="Detailed task description..."
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Assign To</label>
                <select 
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30"
                >
                  <option value="" className="bg-zinc-900 text-white">Select staff...</option>
                  {staff.filter(s => s.role === 'LO' || s.role === 'MODERATOR').map(s => (
                    <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Priority</label>
                <select 
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30"
                >
                  <option value="low" className="bg-zinc-900 text-white">Low</option>
                  <option value="medium" className="bg-zinc-900 text-white">Medium</option>
                  <option value="high" className="bg-zinc-900 text-white">High</option>
                  <option value="urgent" className="bg-zinc-900 text-white">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Due Date</label>
                <input 
                  type="datetime-local"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Venue (Optional)</label>
                <input 
                  type="text"
                  placeholder="Location..."
                  value={taskForm.venue}
                  onChange={(e) => setTaskForm({...taskForm, venue: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setIsTaskModalOpen(false)}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              className="bg-acid hover:bg-white text-black font-black rounded-xl"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Send Message</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Send a message to staff members for this event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white text-sm font-bold">Recipient</label>
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  <input 
                    type="checkbox" 
                    checked={messageForm.broadcast}
                    onChange={(e) => setMessageForm({...messageForm, broadcast: e.target.checked})}
                    className="rounded" 
                  />
                  Broadcast to all staff
                </label>
              </div>
              <select 
                value={messageForm.receiverId}
                onChange={(e) => setMessageForm({...messageForm, receiverId: e.target.value})}
                disabled={messageForm.broadcast}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30 disabled:opacity-50"
              >
                <option value="" className="bg-zinc-900 text-white">Select recipient...</option>
                {staff.filter(s => s.role === 'LO' || s.role === 'MODERATOR').map(s => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.firstName} {s.lastName} ({s.role})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Subject</label>
              <input 
                type="text"
                placeholder="Message subject..."
                value={messageForm.subject}
                onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Message</label>
              <textarea 
                placeholder="Type your message here..."
                rows={6}
                value={messageForm.content}
                onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30 resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setIsMessageModalOpen(false)}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-acid hover:bg-white text-black font-black rounded-xl"
            >
              <Send className="mr-2 size-4" />
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-2xl bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Create New Staff Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a new LO or Moderator to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">First Name *</label>
                <input 
                  type="text"
                  placeholder="John"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({...staffForm, firstName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Last Name *</label>
                <input 
                  type="text"
                  placeholder="Doe"
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({...staffForm, lastName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white text-sm font-bold">Email *</label>
              <input 
                type="email"
                placeholder="john.doe@rkade.com"
                value={staffForm.email}
                onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Role *</label>
                <select 
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({...staffForm, role: e.target.value as 'LO' | 'MODERATOR'})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-acid/30"
                >
                  <option value="LO" className="bg-zinc-900 text-white">LO (Logistics Officer)</option>
                  <option value="MODERATOR" className="bg-zinc-900 text-white">Moderator</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="+91"
                    value={staffForm.countryCode}
                    onChange={(e) => setStaffForm({...staffForm, countryCode: e.target.value})}
                    className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                  />
                  <input 
                    type="text"
                    placeholder="9812345678"
                    value={staffForm.phoneNumber}
                    onChange={(e) => setStaffForm({...staffForm, phoneNumber: e.target.value})}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Country</label>
                <input 
                  type="text"
                  placeholder="India"
                  value={staffForm.country}
                  onChange={(e) => setStaffForm({...staffForm, country: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm font-bold">Current City</label>
                <input 
                  type="text"
                  placeholder="Mumbai"
                  value={staffForm.currentCity}
                  onChange={(e) => setStaffForm({...staffForm, currentCity: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-acid/30"
                />
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-zinc-400">
                <span className="font-bold text-white">Note:</span> A default password will be assigned. The staff member should change it upon first login.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setIsStaffModalOpen(false)}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateStaff}
              className="bg-acid hover:bg-white text-black font-black rounded-xl"
            >
              <UserPlus className="mr-2 size-4" />
              Create Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
