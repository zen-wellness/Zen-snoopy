import { useAuth } from "@/hooks/use-auth";
import { QuoteBanner } from "@/components/QuoteBanner";
import { TaskList } from "@/components/TaskList";
import { HabitTracker } from "@/components/HabitTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles, Calendar as CalendarIcon, List, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import snoopyStanding from "@assets/IMG_0320_1767672528678.jpeg";
import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { format, parse, isWithinInterval, startOfDay, addHours } from "date-fns";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<'list' | 'calendar' | 'timeline'>('timeline');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
  const { data: tasks } = useTasks(dateStr);
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
          duration: endHour - startHour
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }, [tasks]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
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
        <QuoteBanner />

        {view === 'timeline' ? (
          <Card className="border-primary/20 bg-white/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b border-primary/10 bg-white/40">
              <CardTitle className="flex items-center justify-between">
                <span>Daily Timeline - {format(selectedDate || new Date(), "EEEE, MMMM do")}</span>
                <div className="flex gap-2">
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

                {/* Task Rows */}
                <div className="relative min-h-[400px]">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex">
                    <div className="w-20 border-r border-primary/10 bg-primary/5" />
                    <div className="flex-1 grid grid-cols-24">
                      {hours.map(h => <div key={h} className="border-r border-primary/5" />)}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="relative py-4 space-y-2">
                    {timelineTasks.map((task: any) => (
                      <div key={task.id} className="flex group">
                        <div className="w-20 flex-shrink-0" />
                        <div className="flex-1 relative h-12">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "absolute h-10 top-1 rounded-lg border shadow-sm p-2 text-xs font-medium flex items-center justify-between overflow-hidden transition-all group-hover:shadow-md cursor-pointer",
                              task.completed 
                                ? "bg-muted/30 border-muted text-muted-foreground line-through" 
                                : "bg-primary/20 border-primary/30 text-primary-foreground text-primary shadow-primary/10"
                            )}
                            style={{
                              left: `${(task.startHour / 24) * 100}%`,
                              width: `${(task.duration / 24) * 100}%`
                            }}
                            onClick={() => updateTask.mutate({ id: task.id, completed: !task.completed })}
                          >
                            <span className="truncate pr-2">{task.title}</span>
                            <span className="text-[10px] opacity-60 whitespace-nowrap">{task.startTime}</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
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
