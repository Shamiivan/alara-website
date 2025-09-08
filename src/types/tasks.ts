import { Id } from "../../convex/_generated/dataModel";

export type Priority = "low" | "medium" | "high";

export interface ConvexTask {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  due: string;
  timezone: string;
  status?: string;
  source?: string;
}

export interface Task {
  _id: Id<"tasks">;
  _creationTime: number;
  title: string;
  completed: boolean;
  due: string;
  timezone: string;
  priority: Priority;
  status?: string;
}

export interface CreateTaskData {
  title: string;
  due: string;
  timezone: string;
  reminderMinutesBefore: number;
}

export interface UpdateTaskData {
  status?: string;
  title?: string;
  due?: string;
}