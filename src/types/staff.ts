export interface Assignment {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'LO' | 'MODERATOR';
  venue?: string;
  session?: string;
  assignedAt: string;
  assignedBy: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Task {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  assignedTo: string; // userId
  assignedToEmail: string;
  assignedToName: string;
  assignedToRole: 'LO' | 'MODERATOR';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: string;
  venue?: string;
  session?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Message {
  id: string;
  eventId?: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'ADMIN' | 'LO' | 'MODERATOR';
  recipientId?: string; // optional for broadcast
  recipientEmail?: string;
  recipientName?: string;
  recipientRole?: 'ADMIN' | 'LO' | 'MODERATOR';
  subject?: string;
  message: string;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
  readAt?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'LO' | 'MODERATOR';
  phone?: string;
  assignedEvents: string[]; // event IDs
  activeTasks: number;
  completedTasks: number;
  createdAt: string;
}
