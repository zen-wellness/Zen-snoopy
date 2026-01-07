import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Smile, Utensils, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { MoodCheck } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function TrendsHistory() {
  const { data: moodChecks = [], isLoading } = useQuery<MoodCheck[]>({ queryKey: ["/api/mood-checks"] });

  const chartData = useMemo(() => {
    if (!moodChecks.length) return [];
    
    // Group by date and calculate average mood
    const moodMap: Record<string, number> = { happy: 3, okay: 2, sad: 1 };
    const grouped = moodChecks.reduce((acc: any, check) => {
      if (!acc[check.date]) acc[check.date] = { date: check.date, total: 0, count: 0 };
      acc[check.date].total += moodMap[check.mood as keyof typeof moodMap] || 2;
      acc[check.date].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [moodChecks]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading trends...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <TrendingUp className="w-8 h-8" /> Trends & History
        </h1>
        <p className="text-muted-foreground">See how your food affects your mood over time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-primary/10 bg-white/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), "MMM d")}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => val === 3 ? "Happy" : val === 2 ? "Okay" : "Sad"} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={(d: any) => d.total / d.count} 
                  name="Average Mood"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 bg-white/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Recent Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {moodChecks.map((check) => (
                <div key={check.id} className="p-3 rounded-lg bg-white/60 border border-primary/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {check.timeOfDay} • {format(parseISO(check.date), "MMM d")}
                    </span>
                    <span className="text-xs">
                      {check.mood === "happy" ? "😊" : check.mood === "okay" ? "😐" : "😔"}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{check.mood.charAt(0).toUpperCase() + check.mood.slice(1)}</p>
                  {check.meal && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Utensils className="w-3 h-3" /> {check.meal}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
