export interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'paused' | 'prospect' | 'ex-client';
  billingInfo: object;
  projects: string[];
}

export interface Task {
  id: string;
  title: string;
  clientId?: string;
  dueDate?: Date;
  status: 'todo' | 'in-progress' | 'done' | 'on-hold';
  subtasks?: Task[];
}

export interface Document {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'sent' | 'paid' | 'overdue';
  dateIssued: Date;
}


export interface User {
  fullName: string;
  email: string;
  businessName: string;
  role: 'VA' | 'Team Lead' | 'Client';
  phone: string;
  timeZone: string;
  businessType: string;
  services: string[];
}

type BlockType = "task" | "meeting" | "focus";

export interface TimeBlock {
  id: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  title: string;
  type: BlockType;
}
