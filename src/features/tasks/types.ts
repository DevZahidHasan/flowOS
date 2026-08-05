export type TaskStatus = 'Todo' | 'In Progress' | 'Blocked' | 'Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskCategory = 'Operations' | 'Administration' | 'Finance' | 'Sales' | 'Marketing' | 'HR' | 'IT' | 'Maintenance' | 'Cleaning' | 'General' | string;

export interface TaskLabel {
  name: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  category: TaskCategory | null;
  labels: string[];
  estimatedHours: number;
  actualHours: number;
  dueDate: string | null;
  orderIndex: number;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Future-proofing architecture interfaces
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  checklists?: TaskChecklist[];
  activities?: TaskActivity[];
  dependencies?: TaskDependency[];
}

export interface TaskFilters {
  workspaceId: string;
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  category?: string;
  labels?: string[];
  dueDate?: string;
  overdue?: boolean;
  archived?: boolean;
  sort?: string;
}

export interface TaskStatistics {
  totalCount: number;
  completedCount: number;
  overdueCount: number;
  todoCount: number;
  inProgressCount: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  staffId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface TaskChecklist {
  id: string;
  taskId: string;
  title: string;
  items: TaskChecklistItem[];
  orderIndex: number;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorId: string;
  action: string;
  details: any;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: 'blocks' | 'is_blocked_by' | 'relates_to';
}

export interface CreateTaskInput {
  workspaceId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory | null;
  labels?: string[];
  assigneeId?: string | null;
  estimatedHours?: number;
  dueDate?: string | null;
  createdBy?: string | null;
}

export interface UpdateTaskInput {
  workspaceId: string;
  taskId: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory | null;
  labels?: string[];
  assigneeId?: string | null;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string | null;
  orderIndex?: number;
}
