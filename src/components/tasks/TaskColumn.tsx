import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { Card } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  status: string;
  time_slot?: string | null;
  user_id: string;
  task_date: string;
  position: number;
}

interface TaskColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export function TaskColumn({ id, title, icon, tasks, onDeleteTask, onEditTask }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <Card className="flex-1 min-w-[280px] p-4 bg-gradient-card">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        id={id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="space-y-3 min-h-[400px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </div>
      </SortableContext>
    </Card>
  );
}