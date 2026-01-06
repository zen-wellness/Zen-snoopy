import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useJournal, useCreateJournalEntry } from "@/hooks/use-journal";
import { useState } from "react";
import { Loader2, Save, Smile, Meh, Frown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DailyJournal({ date }: { date: string }) {
  const { data: entries, isLoading } = useJournal(date);
  const { mutate: saveEntry, isPending } = useCreateJournalEntry();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);

  const handleSave = () => {
    if (!content.trim()) return;
    
    saveEntry({
      content,
      mood: mood || undefined,
      date
    }, {
      onSuccess: () => {
        setContent("");
        setMood(null);
        toast({ title: "Journal Saved", description: "Your thoughts have been recorded." });
      }
    });
  };

  const todaysEntry = entries?.[0];

  if (isLoading) return <div className="h-64 animate-pulse bg-muted rounded-xl" />;

  if (todaysEntry) {
    return (
      <Card className="h-full bg-gradient-to-br from-secondary/50 to-background border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reflection</span>
            {todaysEntry.mood && (
              <span className="text-2xl" role="img" aria-label="mood">
                {todaysEntry.mood === 'happy' && '😊'}
                {todaysEntry.mood === 'neutral' && '😐'}
                {todaysEntry.mood === 'sad' && '😔'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-muted-foreground italic">
            "{todaysEntry.content}"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-dashed border-2 shadow-none hover:border-primary/20 transition-colors">
      <CardHeader>
        <CardTitle>Daily Reflection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder="How was your day? What are you grateful for?"
          className="min-h-[120px] resize-none border-none bg-secondary/30 focus-visible:ring-0 text-lg font-serif"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setMood('happy')}
              className={cn("p-2 rounded-full hover:bg-muted transition-colors", mood === 'happy' && "bg-green-100 text-green-600")}
            >
              <Smile className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setMood('neutral')}
              className={cn("p-2 rounded-full hover:bg-muted transition-colors", mood === 'neutral' && "bg-yellow-100 text-yellow-600")}
            >
              <Meh className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setMood('sad')}
              className={cn("p-2 rounded-full hover:bg-muted transition-colors", mood === 'sad' && "bg-blue-100 text-blue-600")}
            >
              <Frown className="h-5 w-5" />
            </button>
          </div>
          
          <Button onClick={handleSave} disabled={isPending || !content.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
