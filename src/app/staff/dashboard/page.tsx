"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { canAccessStaffRoutes } from "@/lib/staff-auth";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ListTodo,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import type { Assignment, Task, Message } from "@/types/staff";

interface StaffStats {
  totalAssignments: number;
  activeTasks: number;
  completedTasks: number;
  unreadMessages: number;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StaffStats>({
    totalAssignments: 0,
    activeTasks: 0,
    completedTasks: 0,
    unreadMessages: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.email) {
      router.push("/auth/signin");
      return;
    }

    // @ts-ignore - role exists on user
    if (!canAccessStaffRoutes(session?.user?.role)) {
      router.push("/dashboard");
      return;
    }

    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user ID from session
      // @ts-ignore
      const userId = session?.user?.id || session?.user?.email;

      // Load assignments
      const assignmentsRes = await fetch(`/api/admin/assignments?userId=${userId}`);
      if (!assignmentsRes.ok) {
        console.error('Failed to fetch assignments:', assignmentsRes.status);
      }
      const assignmentsData = await assignmentsRes.json();
      const assignmentsArray = Array.isArray(assignmentsData) ? assignmentsData : [];
      setAssignments(assignmentsArray.filter((a: Assignment) => a.status === 'active').slice(0, 5));

      // Load tasks
      const tasksRes = await fetch(`/api/admin/tasks?assignedTo=${userId}`);
      if (!tasksRes.ok) {
        console.error('Failed to fetch tasks:', tasksRes.status);
      }
      const tasksData = await tasksRes.json();
      const tasksArray = Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []);
      const activeTasks = tasksArray.filter((t: Task) => t.status !== 'completed' && t.status !== 'cancelled');
      const completedTasks = tasksArray.filter((t: Task) => t.status === 'completed');
      setRecentTasks(activeTasks.slice(0, 5));

      // Load messages
      const messagesRes = await fetch(`/api/admin/messages?userId=${userId}`);
      if (!messagesRes.ok) {
        console.error('Failed to fetch messages:', messagesRes.status);
      }
      const messagesData = await messagesRes.json();
      const messagesArray = Array.isArray(messagesData) ? messagesData : [];
      const unread = messagesArray.filter((m: Message) => !m.isRead);
      setRecentMessages(messagesArray.slice(0, 5));

      setStats({
        totalAssignments: assignmentsArray.filter((a: Assignment) => a.status === 'active').length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        unreadMessages: unread.length,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-12 bg-white/5 rounded-xl w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-3xl"></div>
            ))}
          </div>
          <div className="h-96 bg-white/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold uppercase text-acid tracking-tighter">
                Staff Dashboard
              </h1>
              <Link
                href="/dashboard"
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1"
              >
                <span>←</span> User Dashboard
              </Link>
            </div>
            <p className="text-zinc-500">
              Welcome back, <span className="text-white font-bold">{session?.user?.name}</span>
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Manage your assigned tasks, view event assignments, and communicate with admins
            </p>
          </div>
          {/* @ts-ignore */}
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {/* @ts-ignore */}
              {session?.user?.role}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <MapPin className="size-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalAssignments}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Active Assignments</p>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Clock className="size-6 text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.activeTasks}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Pending Tasks</p>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.completedTasks}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Completed Tasks</p>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <MessageSquare className="size-6 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats.unreadMessages}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Unread Messages</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold uppercase text-white tracking-tighter">
                Your Assignments
              </h2>
              <Link href="/staff/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  View All <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {assignments.length > 0 ? assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center">
                        <Calendar className="size-5 text-acid" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{assignment.eventTitle}</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                          {assignment.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="size-4" />
                      <span>{assignment.venue || 'Venue TBA'}</span>
                    </div>
                    {assignment.session && (
                      <p className="text-xs text-zinc-500">Session: {assignment.session}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-2">
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <MapPin className="size-12 mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No active assignments</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold uppercase text-white tracking-tighter">
                Recent Tasks
              </h2>
              <Link href="/staff/tasks">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  View All <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentTasks.length > 0 ? recentTasks.map((task) => (
                <Link key={task.id} href="/staff/tasks">
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center border ${
                          task.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20' :
                          task.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                          task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <ListTodo className={`size-5 ${
                            task.priority === 'urgent' ? 'text-red-400' :
                            task.priority === 'high' ? 'text-orange-400' :
                            task.priority === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold">{task.title}</p>
                          <p className="text-xs text-[#ccff00] mb-1">📌 {task.eventTitle}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                        task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.dueDate && (
                      <p className="text-xs text-zinc-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              )) : (
                <div className="py-12 text-center">
                  <ListTodo className="size-12 mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No pending tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold uppercase text-white tracking-tighter">
              Recent Messages
            </h2>
            <Link href="/staff/messages">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                View All <ChevronRight className="ml-1 size-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentMessages.length > 0 ? recentMessages.map((message) => (
              <Link key={message.id} href="/staff/messages">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="size-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-white font-bold">{message.subject || 'New Message'}</h4>
                            {message.isBroadcast && (
                              <span className="text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Broadcast
                              </span>
                            )}
                            {!message.isRead && (
                              <div className="size-2 rounded-full bg-acid animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            From: <span className="font-bold text-zinc-400">{message.senderName}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-12 text-center">
                <MessageSquare className="size-12 mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">No messages</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/staff/tasks">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-acid/30 hover:bg-white/[0.03] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold mb-1">Manage Tasks</p>
                  <p className="text-xs text-zinc-500">Update task status and add notes</p>
                </div>
                <ArrowRight className="size-5 text-zinc-600 group-hover:text-acid transition-colors" />
              </div>
            </div>
          </Link>

          <Link href="/staff/messages">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-acid/30 hover:bg-white/[0.03] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold mb-1">View Messages</p>
                  <p className="text-xs text-zinc-500">Read and reply to messages</p>
                </div>
                <ArrowRight className="size-5 text-zinc-600 group-hover:text-acid transition-colors" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-acid/30 hover:bg-white/[0.03] transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold mb-1">My Profile</p>
                  <p className="text-xs text-zinc-500">View your account details</p>
                </div>
                <ArrowRight className="size-5 text-zinc-600 group-hover:text-acid transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
