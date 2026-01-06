import { useTasks, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskModal } from "@/components/TaskModal";
import { Plus, Clock, Trash2 } from "lucide-react";
import { format, parse, subMinutes, isBefore, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function TaskList({ date }: { date?: string }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const activeDate = date || today;
  const { data: tasks, isLoading } = useTasks(activeDate);
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const { toast } = useToast();
  const notifiedTasks = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!tasks) return;

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach((task) => {
        if (!task.startTime || task.completed || notifiedTasks.current.has(task.id)) return;

        try {
          const startTime = parse(task.startTime, "HH:mm", new Date());
          const reminderTime = subMinutes(startTime, 5);

          if (isAfter(now, reminderTime) && isBefore(now, startTime)) {
            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🌸 Task Reminder!", {
                body: `"${task.title}" starts in 5 minutes (at ${task.startTime})! ✨`,
                icon: "/attached_assets/IMG_0320_1767672528678.jpeg"
              });
            }

            // Fallback Toast
            toast({
              title: "🌸 Task Reminder!",
              description: `"${task.title}" starts in 5 minutes (at ${task.startTime})! ✨`,
              variant: "default",
            });
            notifiedTasks.current.add(task.id);
          }
        } catch (e) {
          console.error("Failed to parse time for task:", task.title);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, toast]);

  const handleToggle = (id: number, completed: boolean) => {
    updateTask.mutate({ id, completed });
    if (completed) {
      toast({
        title: "✨ Task complete!",
        description: "Great job maintaining your zen schedule.",
      });
    }
  };

  return (
    <Card className="h-full border-border/50 shadow-sm bg-white/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-4">
        <div className="flex flex-col">
          <CardTitle className="text-lg md:text-xl font-serif font-medium">Today's Tasks</CardTitle>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5 md:mt-1">{format(new Date(), "EEEE, MMM do")}</p>
        </div>
        <TaskModal defaultDate={today}>
          <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none shadow-none h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </TaskModal>
      </CardHeader>
      
      <CardContent className="p-2 md:p-6 pt-0 space-y-3 md:space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-full bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 md:py-10 text-muted-foreground/60 border border-dashed border-border rounded-xl">
            <div className="bg-muted/30 p-2 rounded-full mb-2">
              <CheckIcon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            <AnimatePresence mode="popLayout">
              {tasks?.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group relative flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border transition-all duration-300",
                    task.completed 
                      ? "bg-muted/20 border-border/50 opacity-60" 
                      : "bg-background border-border hover:shadow-md"
                  )}
                >
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)}
                    className="mt-0.5 md:mt-1 h-4 w-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm md:text-base truncate transition-all",
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {task.title}
                    </p>
                    
                    {(task.description || task.startTime) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-muted-foreground">
                        {task.startTime && (
                          <span className="flex items-center gap-1 bg-muted/50 px-1 py-0.5 rounded">
                            <Clock className="w-2.5 h-2.5" />
                            {task.startTime}
                          </span>
                        )}
                        {task.description && (
                          <span className="truncate max-w-[150px] md:max-w-[200px]">{task.description}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <TaskModal task={task}>
                      <button className="text-[10px] md:text-xs text-primary hover:underline mr-2 md:mr-3 font-medium">Edit</button>
                    </TaskModal>
                    <button 
                      onClick={() => deleteTask.mutate(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
