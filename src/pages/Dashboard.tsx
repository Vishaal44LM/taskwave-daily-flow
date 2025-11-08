import { useState, useEffect, useMemo } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";

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
  created_at?: string;
  updated_at?: string;
}

const timeSlots = [
  { id: "morning", title: "Morning", icon: "🌅" },
  { id: "afternoon", title: "Afternoon", icon: "🌞" },
  { id: "evening", title: "Evening", icon: "🌙" },
  { id: "done", title: "Done", icon: "✅" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_date", today)
        .order("position", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async (taskData: Omit<Task, "id" | "user_id" | "status" | "task_date" | "position">) => {
    if (!session?.user) return;

    try {
      const newTask = {
        ...taskData,
        user_id: session.user.id,
        status: "pending",
        task_date: new Date().toISOString().split("T")[0],
        position: tasks.filter((t) => t.time_slot === taskData.time_slot).length,
      };

      const { error } = await supabase.from("tasks").insert([newTask]);
      if (error) throw error;

      toast({
        title: "Task added!",
        description: "Your task has been created successfully.",
      });
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, "id" | "user_id" | "status" | "task_date" | "position">) => {
    if (!editTask) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", editTask.id);

      if (error) throw error;

      toast({
        title: "Task updated!",
        description: "Your changes have been saved.",
      });
      setEditTask(null);
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Task deleted",
        description: "Task removed successfully.",
      });
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overContainer = over.id as string;
    if (timeSlots.find((slot) => slot.id === overContainer)) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === active.id
            ? { ...task, time_slot: overContainer, status: overContainer === "done" ? "completed" : "pending" }
            : task
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    try {
      const updates = {
        time_slot: activeTask.time_slot,
        status: activeTask.time_slot === "done" ? "completed" : "pending",
      };

      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", activeTask.id);

      if (error) throw error;
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter]);

  const getTasksByTimeSlot = (timeSlot: string) => {
    return filteredTasks.filter((task) => task.time_slot === timeSlot);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Today's Tasks</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            
            <Button
              onClick={() => {
                setEditTask(null);
                setIsAddDialogOpen(true);
              }}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Task
            </Button>
          </div>

          <TaskFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {timeSlots.map((slot) => (
                <TaskColumn
                  key={slot.id}
                  id={slot.id}
                  title={slot.title}
                  icon={<span className="text-2xl">{slot.icon}</span>}
                  tasks={getTasksByTimeSlot(slot.id)}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={(task) => {
                    setEditTask(task);
                    setIsAddDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </main>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={editTask ? handleUpdateTask : handleAddTask}
        editTask={editTask}
      />
    </div>
  );
}