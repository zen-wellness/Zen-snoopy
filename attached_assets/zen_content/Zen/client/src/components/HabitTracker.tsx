import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHabits, useCreateHabit, useLogHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useState } from "react";
import { Check, Flame, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function HabitTracker({ date }: { date: string }) {
  const { data: habits, isLoading } = useHabits();
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();
  const { mutate: logHabit } = useLogHabit();
  const { mutate: deleteHabit } = useDeleteHabit();
  const { toast } = useToast();
  
  const [newHabit, setNewHabit] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    
    createHabit({ title: newHabit, description: "" }, {
      onSuccess: () => {
        setNewHabit("");
        toast({ title: "Habit Added", description: "Let's build a streak!" });
      }
    });
  };

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-xl" />;

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-display text-primary/80">Daily Glow-Up</CardTitle>
          <span className="text-xs font-bold uppercase tracking-wider text-primary/40 bg-primary/5 px-3 py-1 rounded-full">{habits?.length || 0} habits</span>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input 
            placeholder="Add a new glow-up habit..." 
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="rounded-full bg-white/50 border-primary/10 focus-visible:ring-primary/20 h-11 px-6 font-medium"
          />
          <Button type="submit" size="icon" disabled={isCreating} className="rounded-full h-11 w-11 shadow-lg shadow-primary/20">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
          </Button>
        </form>

        <div className="space-y-4">
          {habits?.map((habit) => (
            <div 
              key={habit.id}
              className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-white/40 backdrop-blur-sm border border-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-10 w-10 transition-all duration-300 border-primary/10",
                    "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  )}
                  onClick={() => logHabit({ id: habit.id!, date })}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-bold text-primary/80 leading-none">{habit.title}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-accent">
                    <Stars className="h-3 w-3 fill-accent/20" />
                    <span className="uppercase tracking-widest">{habit.streak} day streak</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                onClick={() => deleteHabit(habit.id!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {habits?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No habits yet. Start small!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
