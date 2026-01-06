import { useState } from "react";
import { format } from "date-fns";
import { QuoteBanner } from "@/components/QuoteBanner";
import { TaskModal } from "@/components/TaskModal";
import { HabitTracker } from "@/components/HabitTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Trash2, Wand2, Loader2, Heart, Stars, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { user, logout } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = useTasks(date);
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const setupScheduleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/user/setup-schedule");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", date] });
    },
    onError: (error: any) => {
      console.error("Failed to setup schedule:", error);
    }
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleTaskToggle = (task: any) => {
    updateTask({ id: task.id, completed: !task.completed, date });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Welcome to DayStream! ✨", {
          body: "Notifications are now enabled for your glamorous day.",
          icon: "/favicon.ico"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0f6] via-[#f3e5f5] to-[#fff0f6] pb-20 selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full animate-pulse">
              <Heart className="h-5 w-5 text-primary fill-primary" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight text-primary">DayStream</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={requestNotificationPermission}
              className="rounded-full hover:bg-primary/10 text-primary"
              title="Enable Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const confirmed = window.confirm("This will reset today's schedule to your template. Any custom tasks for today will be kept, but duplicates may be created. Proceed?");
                if (confirmed) setupScheduleMutation.mutate();
              }}
              disabled={setupScheduleMutation.isPending}
              className="hidden md:flex gap-2 rounded-full border-primary/30 text-primary hover:bg-primary/10 bg-white/50"
            >
              {setupScheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stars className="h-4 w-4 text-accent" />}
              Reset to Template
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline font-semibold">
              Hello Gorgeous, {user?.displayName?.split(' ')[0] || 'Love'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => logout()} className="hover:bg-primary/10 rounded-full">
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Inspirational Quote */}
        <QuoteBanner />

        {/* Date Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <div className="absolute -top-6 -left-4 text-primary/10 select-none">
              <Stars className="h-12 w-12" />
            </div>
            <h2 className="text-4xl font-display font-bold text-primary drop-shadow-sm flex items-center gap-3">
              {format(new Date(date), 'EEEE, MMMM do')}
              <Stars className="h-6 w-6 text-accent animate-bounce" />
            </h2>
            <p className="text-muted-foreground mt-1 font-medium italic opacity-80">Make today absolutely wonderful, Queen ✨</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} className="rounded-full border-primary/20 bg-white/50">
              Today
            </Button>
            <div className="flex items-center border border-primary/10 rounded-full px-4 py-1.5 text-sm bg-white/60 shadow-sm ring-1 ring-primary/5 backdrop-blur-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-primary/60" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none font-medium text-primary/80"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Schedule - 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-display text-2xl font-semibold text-primary/90 flex items-center gap-2">
                Your Magical Day <Heart className="h-4 w-4 fill-primary/20 text-primary" />
              </h3>
              <TaskModal date={date} />
            </div>

            <div className="relative bg-white/60 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-white p-8 min-h-[600px]">
              {tasksLoading ? (
                <div className="space-y-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-24 bg-primary/5 animate-pulse rounded-[2rem]" />)}
                </div>
              ) : (
                <div className="space-y-8">
                  {hours.map(hour => {
                    const hourString = `${hour.toString().padStart(2, '0')}:00`;
                    const hourTasks = tasks?.filter(t => {
                      const startHour = parseInt(t.startTime.split(':')[0]);
                      const endHour = parseInt(t.endTime.split(':')[0]);
                      
                      // Handle tasks that cross midnight (like 11pm - 2am)
                      if (startHour > endHour) {
                        return hour >= startHour || hour < endHour;
                      }
                      
                      return hour >= startHour && hour < (endHour === 0 ? 24 : endHour);
                    });
                    
                    return (
                      <div key={hour} className="group flex gap-8 border-b border-primary/5 last:border-0 pb-8 min-h-[100px]">
                        <div className="w-20 text-right font-mono text-sm text-primary/40 pt-1 font-bold">
                          {hourString}
                        </div>
                        <div className="flex-1 space-y-4">
                          {hourTasks?.map(task => (
                            <div 
                              key={task.id}
                              className={cn(
                                "flex items-start gap-5 p-6 rounded-[2rem] transition-all duration-500 border border-white/50 shadow-sm",
                                task.completed 
                                  ? "bg-white/20 opacity-60 grayscale-[0.5]" 
                                  : "bg-gradient-to-br from-white to-secondary/20 hover:to-secondary/40 shadow-md hover:shadow-lg hover:border-primary/20 scale-100 hover:scale-[1.02]"
                              )}
                            >
                              <Checkbox 
                                checked={task.completed}
                                onCheckedChange={() => handleTaskToggle(task)}
                                className="mt-1 h-6 w-6 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full"
                              />
                              <div className="flex-1">
                                <h4 className={cn("text-lg font-bold text-primary/80", task.completed && "line-through text-muted-foreground")}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground/80 mt-2 font-medium leading-relaxed">{task.description}</p>
                                )}
                                <div className="text-xs font-bold text-primary/40 mt-3 flex items-center gap-1.5 uppercase tracking-widest">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.startTime} - {task.endTime}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="opacity-0 group-hover:opacity-100 h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full transition-all"
                                onClick={() => deleteTask({ id: task.id!, date })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!hourTasks || hourTasks.length === 0) && (
                            <div className="h-full w-full border-l-2 border-primary/5 group-hover:border-primary/20 transition-colors pl-6 min-h-[20px]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 4 cols */}
          <div className="lg:col-span-4 space-y-10">
            {/* Habits Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-white">
              <HabitTracker date={date} />
            </div>

            {/* Journal Section */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-white">
              <DailyJournal date={date} />
            </div>

            {/* Helpful Reminders */}
            <div className="bg-gradient-to-br from-accent/20 to-primary/10 rounded-[2.5rem] p-8 border border-white shadow-xl">
              <h3 className="font-display font-bold text-xl text-primary/80 mb-6 flex items-center gap-2">
                <Stars className="h-6 w-6 text-accent fill-accent/20 animate-pulse" /> Sweet Reminders
              </h3>
              <ul className="space-y-5">
                <li className="flex gap-4 items-center group">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors animate-bounce" />
                  <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">Hydrate like a star (8 glasses!) 💧</span>
                </li>
                <li className="flex gap-4 items-center group">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent/30 group-hover:bg-accent transition-colors animate-bounce delay-100" />
                  <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">Stretch like a queen 👑</span>
                </li>
                <li className="flex gap-4 items-center group">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors animate-bounce delay-200" />
                  <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">Tidy space, tidy mind ✨</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
