import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Task, TaskInput } from "@/types/task";

function tasksRef(uid: string) {
  return collection(getFirebaseDb(), "users", uid, "tasks");
}

export function subscribeToTasks(
  uid: string,
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    tasksRef(uid),
    where("deletedAt", "==", null),
    orderBy("dueDate", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
    callback(tasks);
  });
}

export async function createTask(uid: string, input: TaskInput): Promise<void> {
  await addDoc(tasksRef(uid), {
    title: input.title,
    dueDate: Timestamp.fromDate(input.dueDate),
    completed: input.completed ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });
}

export async function updateTask(
  uid: string,
  taskId: string,
  input: Partial<TaskInput>
): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", uid, "tasks", taskId);
  await updateDoc(ref, {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.dueDate !== undefined && { dueDate: Timestamp.fromDate(input.dueDate) }),
    ...(input.completed !== undefined && { completed: input.completed }),
    updatedAt: serverTimestamp(),
  });
}

export async function toggleCompleted(
  uid: string,
  taskId: string,
  current: boolean
): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", uid, "tasks", taskId);
  await updateDoc(ref, {
    completed: !current,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  const ref = doc(getFirebaseDb(), "users", uid, "tasks", taskId);
  await updateDoc(ref, {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
