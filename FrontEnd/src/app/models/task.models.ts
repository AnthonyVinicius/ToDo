export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  uuid: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  dueAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  deadlineInDays: number;
}
