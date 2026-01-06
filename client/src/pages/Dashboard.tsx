import { useAuth } from "@/hooks/use-auth";
import { QuoteBanner } from "@/components/QuoteBanner";
import { TaskList } from "@/components/TaskList";
import { HabitTracker } from "@/components/HabitTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Calendar as CalendarIcon, List, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import snoopyStanding from "@assets/IMG_0320_1767672528678.jpeg";
import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { TaskModal } from "@/components/TaskModal";
import { LoveBubble } from "@/components/LoveBubble";
import { format, parse, isWithinInterval, startOfDay, addHours } from "date-fns";
import { cn } from "@/lib/utils";

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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'list' | 'calendar' | 'timeline'>('timeline');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  const { data: tasks, isLoading: tasksLoading } = useTasks(dateStr);
  
  useEffect(() => {
    console.log("DASHBOARD: Tasks updated", tasks);
  }, [tasks]);
  const updateTask = useUpdateTask();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const timelineTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.map(task => {
      if (!task.startTime || !task.endTime) return null;
      try {
        const start = parse(task.startTime, "HH:mm", new Date());
        const end = parse(task.endTime, "HH:mm", new Date());
        
        // Handle cross-day tasks (e.g., 23:00 to 02:00)
        let endHour = end.getHours() + end.getMinutes() / 60;
        let startHour = start.getHours() + start.getMinutes() / 60;
        
        if (endHour < startHour) endHour += 24;
        
        return {
          ...task,
          startHour,
          duration: endHour - startHour,
          startTimeObj: start,
          endTimeObj: end
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }, [tasks]);

  const { currentTask, nextTask, timeLeft } = useMemo(() => {
    if (!timelineTasks.length) return { currentTask: null, nextTask: null, timeLeft: null };
    
    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;
    
    let current = null;
    let next = null;
    
    // Sort tasks by start time
    const sorted = [...timelineTasks].sort((a, b) => (a as any).startHour - (b as any).startHour);
    
    for (let i = 0; i < sorted.length; i++) {
      const task: any = sorted[i];
      const taskEnd = task.startHour + task.duration;
      
      if (nowHour >= task.startHour && nowHour < taskEnd) {
        current = task;
        next = sorted[(i + 1) % sorted.length];
        break;
      }
    }
    
    if (!current) {
      // Find the first task that starts after now
      next = sorted.find((t: any) => t.startHour > nowHour) || sorted[0];
    }
    
    let timeDiff = null;
    if (next) {
      const nextStart: any = (next as any).startHour;
      let diffHours = nextStart - nowHour;
      if (diffHours < 0) diffHours += 24;
      
      const totalMinutes = Math.floor(diffHours * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      timeDiff = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    
    return { currentTask: current, nextTask: next, timeLeft: timeDiff };
  }, [timelineTasks]);

  return (
    <div className="min-h-screen p-2 md:p-8 relative z-10 flex flex-col max-w-full overflow-x-hidden">
      <LoveBubble />
      <header className="w-full mx-auto mb-4 md:mb-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/10 snoopy-float overflow-hidden border-2 border-primary/20">
            <img src={snoopyStanding} alt="Snoopy" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-primary flex items-center gap-1 md:gap-2 truncate">
              Hi, {user?.displayName?.split(' ')[0] || 'Princess'} <Sparkles className="w-4 h-4 text-accent-foreground flex-shrink-0" />
            </h1>
            <p className="text-[10px] md:text-sm text-muted-foreground truncate">Keep that glow! ✨</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive h-8 px-2 md:px-6 text-xs"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <Card className="border-primary/10 bg-white/40 backdrop-blur-md shadow-sm">
            <CardHeader className="p-3 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Current</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <h3 className="text-sm md:text-2xl font-bold text-primary truncate">{currentTask?.title || "None"}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground">{currentTask?.startTime || "--:--"}</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 bg-white/40 backdrop-blur-md shadow-sm">
            <CardHeader className="p-3 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Next</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <h3 className="text-sm md:text-2xl font-bold text-accent-foreground truncate">{nextTask?.title || "None"}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground">{timeLeft || "0m"}</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggles - Mobile Optimized */}
        <div className="flex bg-white/40 backdrop-blur-md rounded-xl p-1 border border-primary/5 sticky top-2 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('timeline')}
            className={cn("flex-1 rounded-lg h-9 text-xs", view === 'timeline' && "bg-primary text-white")}
          >
            <Clock className="w-3 h-3 mr-1" />
            Timeline
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('list')}
            className={cn("flex-1 rounded-lg h-9 text-xs", view === 'list' && "bg-primary text-white")}
          >
            <List className="w-3 h-3 mr-1" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('calendar')}
            className={cn("flex-1 rounded-lg h-9 text-xs", view === 'calendar' && "bg-primary text-white")}
          >
            <CalendarIcon className="w-3 h-3 mr-1" />
            Cal
          </Button>
        </div>

        <QuoteBanner />

        <div className="pb-4">
          {view === 'timeline' ? (
            <Card className="border-primary/10 bg-white/40 backdrop-blur-md overflow-hidden shadow-sm">
              <CardHeader className="p-4 border-b border-primary/5 bg-white/20">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{format(selectedDate || new Date(), "MMM do")}</span>
                  <div className="flex gap-1">
                    <TaskModal defaultDate={dateStr}>
                      <Button variant="outline" size="sm" className="h-8 rounded-full text-xs">Add</Button>
                    </TaskModal>
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="h-8 rounded-full text-xs px-2">Now</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="relative flex flex-col gap-2 p-2 min-h-[300px]">
                    <AnimatePresence>
                      {timelineTasks.length > 0 ? (
                        timelineTasks
                          .sort((a: any, b: any) => {
                            if (a.startTime === "02:00" && a.title === "Sleep") return -1;
                            if (b.startTime === "02:00" && b.title === "Sleep") return 1;
                            return a.startHour - b.startHour;
                          })
                          .filter((task: any) => {
                            const sleepTask = timelineTasks.find(t => t && t.title === "Sleep" && t.startTime === "02:00");
                            const sleepStartHour = sleepTask ? sleepTask.startHour : 2;
                            return task.startHour >= sleepStartHour || (task.title === "Sleep" && task.startTime === "02:00");
                          })
                          .map((task: any) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={cn(
                                "relative rounded-xl border shadow-sm p-3 md:p-4 transition-all hover:shadow-lg cursor-pointer group",
                                task.completed 
                                  ? "bg-muted/30 border-muted text-muted-foreground" 
                                  : "bg-white border-primary/10 text-primary shadow-primary/5 hover:border-primary/30"
                              )}
                              onClick={() => updateTask.mutate({ id: task.id, completed: !task.completed })}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                  <div className={cn(
                                    "p-1 rounded-full flex-shrink-0",
                                    task.completed ? "bg-muted/50" : "bg-primary/5"
                                  )}>
                                    <Clock className={cn("w-3 h-3 md:w-4 md:h-4", task.completed ? "text-muted-foreground" : "text-primary")} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1 truncate">
                                      <h3 className={cn(
                                        "font-bold text-sm md:text-lg tracking-tight truncate",
                                        task.completed && "line-through opacity-60"
                                      )}>
                                        {task.title}
                                      </h3>
                                      {!task.completed && <Sparkles className="w-3 h-3 text-accent-foreground animate-pulse flex-shrink-0" />}
                                    </div>
                                    <p className="text-[10px] md:text-xs font-medium opacity-60">
                                      {format(parse(task.startTime, "HH:mm", new Date()), "h:mm a")} - {format(parse(task.endTime, "HH:mm", new Date()), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                                {task.completed && (
                                  <div className="bg-green-100/50 text-green-700 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                                    <CheckIcon className="w-2 h-2 md:w-3 md:h-3" /> Done
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-50">
                          <CalendarIcon className="w-8 h-8 mb-2" />
                          <p className="text-xs font-medium">No tasks scheduled</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : view === 'list' ? (
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-7 lg:col-span-8 flex flex-col gap-4 md:gap-6"
              >
                <TaskList />
                <DailyJournal />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-5 lg:col-span-4"
              >
                <HabitTracker />
              </motion.div>
            </section>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
            >
              <Card className="md:col-span-4 border-primary/10 bg-white/40 backdrop-blur-md">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-primary/5"
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-8 border-primary/10 bg-white/40 backdrop-blur-md">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">
                    Tasks for {selectedDate ? format(selectedDate, "MMM do") : 'Selected Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                  <TaskList date={dateStr} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
