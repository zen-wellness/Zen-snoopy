import { useQuote } from "@/hooks/use-quote";
import { Sparkles, Quote } from "lucide-react";
import { motion } from "framer-motion";

export function QuoteBanner() {
  const { data: quote, isLoading } = useQuote();

  if (isLoading) return (
    <div className="h-32 w-full bg-muted/20 animate-pulse rounded-2xl" />
  );

  if (!quote) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary to-accent p-10 text-primary-foreground shadow-2xl shadow-primary/20 border border-white/20"
    >
      <div className="absolute top-0 right-0 p-6 opacity-20 animate-spin-slow">
        <Stars className="h-40 w-40" />
      </div>
      <div className="absolute bottom-0 left-0 p-6 opacity-10">
        <Heart className="h-32 w-32" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <Stars className="h-8 w-8 text-white mb-2 animate-pulse" />
        <p className="font-display text-3xl md:text-4xl font-bold leading-tight italic drop-shadow-md">
          "{quote.text}"
        </p>
        <div className="h-1 w-20 bg-white/40 rounded-full" />
        <p className="text-sm font-bold tracking-[0.3em] uppercase text-white/80">
          — {quote.author} —
        </p>
      </div>
    </motion.div>
  );
}
