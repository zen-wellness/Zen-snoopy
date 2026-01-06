import { useJournalEntries } from "@/hooks/use-journal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const MOODS = [
  { label: "Peaceful", emoji: "🌿", color: "bg-green-100 text-green-700" },
  { label: "Happy", emoji: "☀️", color: "bg-yellow-100 text-yellow-700" },
  { label: "Reflective", emoji: "🌙", color: "bg-indigo-100 text-indigo-700" },
  { label: "Stressed", emoji: "🌪️", color: "bg-gray-100 text-gray-700" },
  { label: "Grateful", emoji: "✨", color: "bg-pink-100 text-pink-700" },
];

export default function JournalHistory() {
  const { data: entries, isLoading } = useJournalEntries(); // Assuming useJournalEntries without date fetches all
  const { user } = useAuth();

  if (isLoading) return <div className="p-8 text-center">Loading journal history...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">Journal History</h1>
      </div>

      <div className="grid gap-4">
        {entries && entries.length > 0 ? (
          entries.map((entry) => {
            const moodObj = MOODS.find(m => m.label === entry.mood) || MOODS[0];
            return (
              <Card key={entry.id} className="border-border/50 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", moodObj.color)}>
                      <span>{moodObj.emoji}</span> {moodObj.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.date}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.createdAt ? format(new Date(entry.createdAt), "h:mm a") : ""}
                  </span>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed italic whitespace-pre-wrap">
                    "{entry.content}"
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border text-muted-foreground italic">
            No journal entries found.
          </div>
        )}
      </div>
    </div>
  );
}
