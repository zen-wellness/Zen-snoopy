import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const QUOTES = [
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Smile, breathe and go slowly.", author: "Thich Nhat Hanh" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Do less, be more.", author: "Unknown" },
];

export function QuoteBanner() {
  // Simple random quote for now. In a real app, this could cycle daily.
  const randomQuote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10 border border-primary/10 shadow-sm"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Quote size={120} />
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground leading-relaxed italic">
          "{randomQuote.text}"
        </h2>
        <p className="mt-4 text-sm font-sans font-medium text-muted-foreground uppercase tracking-widest">
          — {randomQuote.author}
        </p>
      </div>
    </motion.div>
  );
}
