import { createContext, useContext, useMemo, type ReactNode } from "react";
import { indexTasks, type TaskIndex } from "../lib/relations";
import type { Task } from "../types";

const EMPTY_INDEX: TaskIndex = indexTasks([]);

const TaskIndexContext = createContext<TaskIndex>(EMPTY_INDEX);

export function TaskIndexProvider({ tasks, children }: { tasks: Task[]; children: ReactNode }) {
  const index = useMemo(() => indexTasks(tasks), [tasks]);
  return <TaskIndexContext.Provider value={index}>{children}</TaskIndexContext.Provider>;
}

export function useTaskIndex(): TaskIndex {
  return useContext(TaskIndexContext);
}
