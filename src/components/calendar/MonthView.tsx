import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";

interface Task {
  id: string;
  title: string;
  task_date: string;
  priority?: string | null;
  status: string;
}

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  onDateClick: (date: Date) => void;
}

const priorityColors = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

export function MonthView({ currentDate, tasks, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks.filter((task) => task.task_date === dateStr);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={day.toISOString()}
              className={`min-h-[120px] p-2 cursor-pointer transition-all hover:shadow-card-hover ${
                !isCurrentMonth ? "opacity-50" : ""
              } ${isToday ? "ring-2 ring-primary" : ""}`}
              onClick={() => onDateClick(day)}
            >
              <div className="font-semibold text-sm mb-2">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate ${
                      task.priority && priorityColors[task.priority as keyof typeof priorityColors]
                        ? priorityColors[task.priority as keyof typeof priorityColors] + " text-white"
                        : "bg-muted"
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}