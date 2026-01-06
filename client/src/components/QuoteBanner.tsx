import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import snoopyImg from "@assets/IMG_0336_1767718090891.jpeg";

const QUOTES = [
  { text: "Keep looking up... that's the secret of life. ✨", author: "Snoopy" },
  { text: "Don't worry about tomorrow. Just focus on today. 🌸", author: "Snoopy" },
  { text: "A good day is any day you decide to make it one. 💖", author: "Snoopy" },
  { text: "The more you like yourself, the less you are like anyone else. 🎀", author: "Snoopy" },
  { text: "To live is to dance, to dance is to live. 💃", author: "Snoopy" },
  { text: "Happiness is a warm puppy. 🐶", author: "Snoopy" },
  { text: "Learn from yesterday, live for today, look to tomorrow. 🌈", author: "Snoopy" },
  { text: "Be yourself. No one can say you're doing it wrong. ✨", author: "Snoopy" },
];

export function QuoteBanner() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-white border border-border shadow-sm p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner bg-pink-50/50">
          <img 
            src={snoopyImg} 
            alt="Zen Snoopy" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="inline-block p-2 bg-primary/10 rounded-full mb-1">
            <Quote className="w-4 h-4 text-primary" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={quote.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-xl md:text-2xl font-serif font-medium text-foreground leading-relaxed italic">
                "{quote.text}"
              </h2>
              <p className="mt-2 text-sm font-sans font-medium text-muted-foreground uppercase tracking-widest">
                — {quote.author}
              </author>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
