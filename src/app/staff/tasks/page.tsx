"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessStaffRoutes } from "@/lib/staff-auth";
import { Calendar, Clock, AlertCircle, CheckCircle2, PlayCircle, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TaskStatus = "pending" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  assignedTo: string;
  assignedToEmail: string;
  assignedToName: string;
  assignedToRole: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  venue?: string;
  notes?: string;
  completedAt?: string;
}

export default function StaffTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [updating, setUpdating] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    if (!canAccessStaffRoutes(session.user.role)) {
      router.push("/dashboard");
      return;
    }

    fetchTasks();
  }, [session, status, router]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/admin/tasks?assignedTo=${session?.user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const data = await response.json();
      const tasksArray = Array.isArray(data) ? data : [];
      setTasks(tasksArray);
      setFilteredTasks(tasksArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tasks];

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [statusFilter, priorityFilter, tasks]);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      if (!response.ok) throw new Error("Failed to update task");

      await fetchTasks();
      
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!selectedTask || !noteText.trim()) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId: selectedTask.id, 
          notes: noteText.trim() 
        })
      });

      if (!response.ok) throw new Error("Failed to add note");

      await fetchTasks();
      setSelectedTask(prev => prev ? { ...prev, notes: noteText.trim() } : null);
      setNoteText("");
      setIsNoteModalOpen(false);
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending": return <AlertCircle className="w-4 h-4" />;
      case "in-progress": return <PlayCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending": return "text-gray-400 bg-gray-500/10";
      case "in-progress": return "text-[#ccff00] bg-[#ccff00]/10";
      case "completed": return "text-green-500 bg-green-500/10";
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    if (currentStatus === "pending") return "in-progress";
    if (currentStatus === "in-progress") return "completed";
    return null;
  };

  const statsCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ccff00] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#ccff00]">My Tasks</span>
          </h1>
          <p className="text-gray-400">Manage and track your assigned tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#ccff00] mb-2">{statsCounts.total}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-gray-400 mb-2">{statsCounts.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-[#ccff00] mb-2">{statsCounts.inProgress}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-500 mb-2">{statsCounts.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
                className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-[#ccff00]"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
                className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-[#ccff00]"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {(statusFilter !== "all" || priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="text-sm text-[#ccff00] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No tasks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-[#ccff00]/30 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setIsDetailModalOpen(true);
                }}
              >
                {/* Priority Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded border uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="capitalize">{task.status.replace("-", " ")}</span>
                  </div>
                </div>

                {/* Task Title */}
                <h3 className="text-lg font-semibold mb-2 text-white">{task.title}</h3>

                {/* Event Info */}
                <div className="text-sm text-[#ccff00] font-semibold mb-2">
                  📌 {task.eventTitle}
                </div>

                {/* Venue */}
                {task.venue && (
                  <div className="text-sm text-gray-400 mb-3">
                    📍 {task.venue}
                  </div>
                )}

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#ccff00]">
                  {selectedTask.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Status and Priority */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="capitalize font-semibold">{selectedTask.status.replace("-", " ")}</span>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded border uppercase ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority} Priority
                  </span>
                </div>

                {/* Event and Venue */}
                <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Event:</span>
                    <span className="ml-2 text-[#ccff00] font-semibold">{selectedTask.eventTitle}</span>
                  </div>
                  {selectedTask.venue && (
                    <div className="text-sm">
                      <span className="text-gray-400">Venue:</span>
                      <span className="ml-2 text-white">{selectedTask.venue}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Description</h4>
                    <p className="text-white bg-zinc-800 rounded-lg p-4">{selectedTask.description}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedTask.dueDate && (
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Due Date</div>
                      <div className="text-sm text-white">{new Date(selectedTask.dueDate).toLocaleString()}</div>
                    </div>
                  )}
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Created</div>
                    <div className="text-sm text-white">{new Date(selectedTask.createdAt).toLocaleString()}</div>
                  </div>
                  {selectedTask.completedAt && (
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Completed</div>
                      <div className="text-sm text-green-500">{new Date(selectedTask.completedAt).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-400">Notes</h4>
                    <button
                      onClick={() => {
                        setNoteText(selectedTask.notes || "");
                        setIsNoteModalOpen(true);
                      }}
                      className="text-xs text-[#ccff00] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {selectedTask.notes ? "Update Reply" : "Add Reply"}
                    </button>
                  </div>
                  {selectedTask.notes ? (
                    <div className="bg-zinc-800 rounded-lg p-4 text-white whitespace-pre-wrap">
                      {selectedTask.notes}
                    </div>
                  ) : (
                    <div className="bg-zinc-800 rounded-lg p-4 text-gray-500 text-sm italic">
                      No notes added yet
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                  {getNextStatus(selectedTask.status) && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(selectedTask.status);
                        if (nextStatus) {
                          updateTaskStatus(selectedTask.id, nextStatus);
                        }
                      }}
                      disabled={updating}
                      className="flex-1 bg-[#ccff00] text-black font-semibold py-3 rounded hover:bg-[#b8e600] transition disabled:opacity-50"
                    >
                      {updating ? "Updating..." : `Mark as ${getNextStatus(selectedTask.status)?.replace("-", " ")}`}
                    </button>
                  )}
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-6 py-3 bg-zinc-800 rounded hover:bg-zinc-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Update Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#ccff00]">
              {selectedTask?.notes ? "Update Reply" : "Add Reply to Task"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="text-sm text-gray-400 mb-2">
              Reply to admin about: <span className="text-white font-semibold">{selectedTask?.title}</span>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your progress update, questions, or notes here..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white min-h-[150px] focus:outline-none focus:border-[#ccff00]"
            />

            <div className="flex gap-3">
              <button
                onClick={addNote}
                disabled={updating || !noteText.trim()}
                className="flex-1 bg-[#ccff00] text-black font-semibold py-2 rounded hover:bg-[#b8e600] transition disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Reply"}
              </button>
              <button
                onClick={() => {
                  setIsNoteModalOpen(false);
                  setNoteText("");
                }}
                className="px-6 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
