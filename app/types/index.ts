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