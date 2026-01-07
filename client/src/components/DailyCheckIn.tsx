import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, Utensils, Send, MessageCircle, X, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "wouter";
import { MoodCheck, ChatMessage } from "@shared/schema";

export function DailyCheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mood, setMood] = useState<string | null>(null);
  const [meal, setMeal] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");

  const { data: moodChecks = [] } = useQuery<MoodCheck[]>({ queryKey: ["/api/mood-checks"] });
  const { data: messages = [] } = useQuery<ChatMessage[]>({ queryKey: ["/api/chat-messages"] });

  const moodMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/mood-checks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-checks"] });
      toast({ title: "Check-in complete! 🌸", description: "Your mood and meal have been logged." });
      setMood(null);
      setMeal("");
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat-messages", { content, role: "user" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      setChatInput("");
    },
  });

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "night";
  }, []);

  const hasCheckedInToday = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return moodChecks.some((c) => c.date === today && c.timeOfDay === timeOfDay);
  }, [moodChecks, timeOfDay]);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Link href="/trends">
          <Button variant="outline" size="sm" className="gap-2 bg-white/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5">
            <TrendingUp className="w-4 h-4 text-primary" /> 
            <span className="font-medium text-primary">Trends & History</span>
          </Button>
        </Link>
      </div>
      {!hasCheckedInToday && (
        <Card className="border-primary/20 bg-white/60 backdrop-blur-md shadow-xl mb-6 overflow-hidden">
          <CardHeader className="p-4 bg-primary/5">
            <CardTitle className="text-lg font-serif flex items-center gap-2 text-primary">
              <Smile className="w-5 h-5" /> {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>How are you feeling right now?</Label>
              <div className="flex gap-4">
                {[
                  { icon: Smile, label: "Happy", value: "happy" },
                  { icon: Meh, label: "Okay", value: "okay" },
                  { icon: Frown, label: "Sad", value: "sad" },
                ].map((m) => (
                  <Button
                    key={m.value}
                    variant={mood === m.value ? "default" : "outline"}
                    className={cn("flex-1 gap-2", mood === m.value && "bg-primary text-white")}
                    onClick={() => setMood(m.value)}
                  >
                    <m.icon className="w-4 h-4" /> {m.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Utensils className="w-4 h-4" /> What did you eat?
              </Label>
              <Input
                placeholder="e.g., Avocado toast, Salad, Pasta..."
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                className="bg-white/50"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={!mood || moodMutation.isPending}
              onClick={() => moodMutation.mutate({
                mood,
                meal,
                timeOfDay,
                date: format(new Date(), "yyyy-MM-dd")
              })}
            >
              Log Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Floating Chat Bot */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4"
            >
              <Card className="w-[320px] h-[450px] border-primary/20 bg-white/90 backdrop-blur-lg shadow-2xl flex flex-col">
                <CardHeader className="p-4 border-b bg-primary text-white rounded-t-xl">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Guide & Therapist
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {messages.slice().reverse().map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-xs",
                        msg.role === "user"
                          ? "bg-primary text-white ml-auto rounded-tr-none"
                          : "bg-muted text-foreground mr-auto rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="bg-muted text-foreground mr-auto rounded-tl-none max-w-[80%] p-3 rounded-2xl text-xs flex gap-1">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                    </div>
                  )}
                  {messages.length === 0 && !chatMutation.isPending && (
                    <div className="text-center text-muted-foreground text-xs py-10">
                      Hi {user?.displayName}! I'm here to listen and guide you through your day. How are you feeling?
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t bg-white/50 flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && chatInput.trim() && chatMutation.mutate(chatInput)}
                    className="h-9 text-xs"
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-primary"
                    disabled={!chatInput.trim() || chatMutation.isPending}
                    onClick={() => chatMutation.mutate(chatInput)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95",
            isChatOpen ? "bg-muted text-foreground" : "bg-primary text-white"
          )}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>
    </>
  );
}
