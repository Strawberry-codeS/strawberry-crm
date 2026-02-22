export type StudentStage = 'opportunity' | 'leading';
export type StudentStatus = 'explore_3' | 'explore_2' | 'followed' | 'pending_visit';

export interface Student {
  id: string;
  name: string;
  phone: string;
  age: number;
  tags: string[];
  status: StudentStatus;
  pauseTime: string;
  currentTask: string;
  stage: StudentStage;
  avatar?: string;
  createdAt: string;
}

export interface DashboardStats {
  classEnrollment: { current: number; target: number };
  refunds: { current: number; limit: number };
  recruitment: { current: number; target: number };
  cash: { current: number; target: number };
}
