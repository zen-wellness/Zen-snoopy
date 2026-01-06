import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TaskModalProps {
  children: React.ReactNode;
  task?: { id: number } & InsertTask;
  defaultDate?: string;
}

export function TaskModal({ children, task, defaultDate }: TaskModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = !!task;

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: task || {
      title: "",
      description: "",
      date: defaultDate || format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
      completed: false
    },
  });

  const onSubmit = async (data: InsertTask) => {
    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({ id: task.id, ...data });
        toast({ title: "Task updated", description: "Your zen garden is organized." });
      } else {
        await createTask.mutateAsync(data);
        toast({ title: "Task created", description: "One step at a time." });
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal text-primary">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">What needs to be done?</Label>
            <Input 
              id="title" 
              {...form.register("title")} 
              placeholder="e.g., Meditation, Reading, Project Work"
              className="bg-muted/30 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time" 
                {...form.register("startTime")} 
                className="bg-muted/30 border-muted-foreground/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="time" 
                {...form.register("endTime")} 
                className="bg-muted/30 border-muted-foreground/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (Optional)</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              placeholder="Add details..."
              className="resize-none bg-muted/30 border-muted-foreground/20"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEditing ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
