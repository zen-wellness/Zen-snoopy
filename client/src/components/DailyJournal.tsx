import { useJournalEntries, useCreateJournalEntry } from "@/hooks/use-journal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
  { label: "Peaceful", emoji: "🌿", color: "bg-green-100 text-green-700" },
  { label: "Happy", emoji: "☀️", color: "bg-yellow-100 text-yellow-700" },
  { label: "Reflective", emoji: "🌙", color: "bg-indigo-100 text-indigo-700" },
  { label: "Stressed", emoji: "🌪️", color: "bg-gray-100 text-gray-700" },
  { label: "Grateful", emoji: "✨", color: "bg-pink-100 text-pink-700" },
];

export function DailyJournal() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: entries, isLoading } = useJournalEntries(today);
  const createEntry = useCreateJournalEntry();
  
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createEntry.mutateAsync({
      content,
      mood: selectedMood || "Peaceful",
      date: today
    });
    setContent("");
    setIsExpanded(false);
  };

  if (isLoading) return <div className="h-64 bg-muted/20 animate-pulse rounded-2xl" />;

  return (
    <Card className="h-full border-border/50 shadow-sm bg-card/50 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-serif font-medium">Daily Reflection</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary"
        >
          {isExpanded ? "Close" : "New Entry"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isExpanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border-b border-border/40 pb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {MOODS.map(mood => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] border transition-all text-xs font-medium gap-1",
                    selectedMood === mood.label
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
            
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="min-h-[120px] bg-background/50 border-muted-foreground/20 focus:ring-primary/20 resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>Cancel</Button>
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={createEntry.isPending || !content.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {createEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Entry
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's History</h4>
          {entries && entries.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {entries.map((entry) => {
                const moodObj = MOODS.find(m => m.label === entry.mood) || MOODS[0];
                return (
                  <div key={entry.id} className="p-4 rounded-xl border border-border/40 bg-white/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1", moodObj.color)}>
                        <span>{moodObj.emoji}</span> {moodObj.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.createdAt ? format(new Date(entry.createdAt), "h:mm a") : ""}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
                      "{entry.content}"
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground/60 text-sm italic">
              No entries for today yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
