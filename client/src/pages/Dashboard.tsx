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
import { format, parse, isWithinInterval, startOfDay, addHours } from "date-fns";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col">
      <header className="max-w-7xl w-full mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/10 snoopy-float overflow-hidden border-2 border-primary/20">
            <img src={snoopyStanding} alt="Snoopy" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Princess'} <Sparkles className="w-5 h-5 text-accent-foreground" />
            </h1>
            <p className="text-sm text-muted-foreground">Keep that glow and maintain your sleep schedule! ✨</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/40 backdrop-blur-md rounded-full p-1 border border-primary/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('timeline')}
              className={cn("rounded-full px-4 h-8", view === 'timeline' && "bg-primary text-white hover:bg-primary/90")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              className={cn("rounded-full px-4 h-8", view === 'list' && "bg-primary text-white hover:bg-primary/90")}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('calendar')}
              className={cn("rounded-full px-4 h-8", view === 'calendar' && "bg-primary text-white hover:bg-primary/90")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full px-6"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-white/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-primary">{currentTask?.title || "No active task"}</h3>
                  <p className="text-sm text-muted-foreground">{currentTask?.startTime} - {currentTask?.endTime}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-white/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Up Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-accent-foreground">{nextTask?.title || "Nothing scheduled"}</h3>
                  <p className="text-sm text-muted-foreground">Starts in {timeLeft || "0m"} (at {nextTask?.startTime})</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <QuoteBanner />

        {view === 'timeline' ? (
          <Card className="border-primary/20 bg-white/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-primary/10 bg-white/40">
              <CardTitle className="flex items-center justify-between">
                <span>Daily Timeline - {format(selectedDate || new Date(), "EEEE, MMMM do")}</span>
                <div className="flex gap-2">
                  <TaskModal defaultDate={dateStr}>
                    <Button variant="outline" size="sm" className="rounded-full">Add Event</Button>
                  </TaskModal>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="rounded-full">Today</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[800px] relative">
                {/* 24h Grid */}
                <div className="flex border-b border-primary/5">
                  <div className="w-20 flex-shrink-0 border-r border-primary/10 bg-primary/5 py-4 text-center text-xs font-bold text-primary">TIME</div>
                  <div className="flex-1 grid grid-cols-24">
                    {hours.map(h => (
                      <div key={h} className="border-r border-primary/5 py-4 text-center text-[10px] font-medium text-muted-foreground uppercase">
                        {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vertical Timeline Layout */}
                <div className="relative flex min-h-[1200px]">
                  {/* Time Axis (Left) */}
                  <div className="w-20 flex-shrink-0 border-r border-primary/10 bg-primary/5 relative">
                    {hours.map(h => (
                      <div 
                        key={h} 
                        className="absolute w-full text-center text-[10px] font-bold text-primary border-t border-primary/5"
                        style={{ top: `${(h / 24) * 100}%`, height: `${(1 / 24) * 100}%` }}
                      >
                        <span className="relative -top-2 bg-primary/5 px-1 rounded">
                          {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tasks Content (Right) */}
                  <div className="flex-1 relative bg-white/40">
                    {/* Horizontal Grid Lines */}
                    {hours.map(h => (
                      <div 
                        key={h} 
                        className="absolute w-full border-t border-primary/5"
                        style={{ top: `${(h / 24) * 100}%` }}
                      />
                    ))}

                    <AnimatePresence>
                      {timelineTasks.map((task: any) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={cn(
                            "absolute left-4 right-4 rounded-xl border shadow-sm p-4 text-sm font-medium flex flex-col justify-center overflow-hidden transition-all hover:shadow-xl hover:z-50 cursor-pointer group",
                            task.completed 
                              ? "bg-muted/30 border-muted text-muted-foreground line-through" 
                              : "bg-white border-primary/20 text-primary shadow-primary/5 hover:border-primary/40"
                          )}
                          style={{
                            top: `${(task.startHour / 24) * 100}%`,
                            height: `calc(${(task.duration / 24) * 100}% - 4px)`,
                            minHeight: "60px"
                          }}
                          onClick={() => updateTask.mutate({ id: task.id, completed: !task.completed })}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 truncate">
                              {!task.completed && <Sparkles className="w-4 h-4 text-accent-foreground animate-pulse" />}
                              <span className="truncate font-bold text-lg">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              <span>{task.startTime} - {task.endTime}</span>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="h-8 text-[10px] rounded-full">
                              {task.completed ? "Mark Incomplete" : "Complete Task"}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : view === 'list' ? (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-7 lg:col-span-8 flex flex-col gap-6"
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
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <Card className="md:col-span-4 border-primary/20 bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-primary/10"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-8 border-primary/20 bg-white/60 backdrop-blur-md">
              <CardHeader>
                <CardTitle>
                  Tasks for {selectedDate ? format(selectedDate, "MMMM do, yyyy") : 'Selected Date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList date={dateStr} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
