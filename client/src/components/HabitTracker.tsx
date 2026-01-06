import { useHabits, useCreateHabit, useDeleteHabit, useLogHabit } from "@/hooks/use-habits";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, Flame } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function HabitTracker() {
  const { data: habits, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const logHabit = useLogHabit();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    
    await createHabit.mutateAsync({
      title: newHabitTitle,
      description: "",
    });
    setNewHabitTitle("");
    setIsAdding(false);
  };

  const handleLog = (id: number) => {
    logHabit.mutate({ id, date: today });
  };

  const isCompletedToday = (logs: any[]) => {
    return logs.some(log => log.completedDate === today);
  };

  return (
    <Card className="h-full border-border/50 shadow-sm bg-white/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:pb-4">
        <CardTitle className="text-lg md:text-xl font-serif font-medium">Habits</CardTitle>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-border/50 w-[90vw] max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-serif">New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Habit Name</Label>
                <Input 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g. Drink Water"
                  className="bg-muted/30"
                />
              </div>
              <Button type="submit" disabled={createHabit.isPending} className="w-full">
                {createHabit.isPending ? "Creating..." : "Start Habit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="p-2 md:p-6 pt-0 space-y-2 md:space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 w-full bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : habits?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs italic">
            No habits yet.
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {habits?.map((habit) => {
                const completed = isCompletedToday(habit.logs);
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "group flex items-center justify-between p-2 md:p-3 rounded-xl border transition-all duration-300",
                      completed 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-background border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={() => !completed && handleLog(habit.id)}
                        disabled={completed || logHabit.isPending}
                        className={cn(
                          "flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full border transition-all duration-300",
                          completed 
                            ? "bg-primary border-primary text-white" 
                            : "border-muted-foreground/30 text-transparent"
                        )}
                      >
                        <Check className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      </button>
                      <span className={cn(
                        "text-sm md:text-base font-medium transition-colors",
                        completed ? "text-primary line-through opacity-70" : "text-foreground"
                      )}>
                        {habit.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-orange-500/80 bg-orange-50 px-1.5 py-0.5 rounded-full">
                          <Flame className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                          {habit.streak}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => deleteHabit.mutate(habit.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
