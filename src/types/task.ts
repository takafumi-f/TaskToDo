import { Timestamp } from "firebase/firestore";

export type Task = {
  id: string;
  title: string;
  dueDate: Timestamp;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};

export type TaskInput = {
  title: string;
  dueDate: Date;
  completed?: boolean;
};
