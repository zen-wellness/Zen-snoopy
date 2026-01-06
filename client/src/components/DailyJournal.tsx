import { useJournalEntries, useCreateJournalEntry } from "@/hooks/use-journal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Loader2, Save, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

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
  const [, setLocation] = useLocation();
  
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
    <Card className="h-full border-border/50 shadow-sm bg-white transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg md:text-xl font-serif font-medium">Reflection</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/journal-history")}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title="View History"
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary h-8 text-xs"
        >
          {isExpanded ? "Close" : "New"}
        </Button>
      </CardHeader>
      <CardContent className="p-2 md:p-6 pt-0 space-y-4 md:space-y-6">
        {isExpanded && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 border-b border-border/40 pb-4">
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
              {MOODS.map(mood => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 rounded-lg min-w-[50px] border transition-all text-[10px] font-medium gap-1",
                    selectedMood === mood.label
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  {mood.label}
                </button>
              ))}
            </div>
            
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px] bg-background/50 border-muted-foreground/20 text-sm focus:ring-primary/20 resize-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-8 text-xs">Cancel</Button>
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={createEntry.isPending || !content.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-8 text-xs"
              >
                {createEntry.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's History</h4>
          {entries && entries.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {entries.map((entry) => {
                const moodObj = MOODS.find(m => m.label === entry.mood) || MOODS[0];
                return (
                  <div key={entry.id} className="p-3 rounded-xl border border-border/40 bg-white/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1", moodObj.color)}>
                        <span>{moodObj.emoji}</span> {moodObj.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {entry.createdAt ? format(new Date(entry.createdAt), "h:mm a") : ""}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
                      "{entry.content}"
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground/60 text-xs italic">
              No entries.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
