import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

const LOVE_NOTES = [
  "I love you! ❤️",
  "You are loved so much, never forget that! ✨",
  "You are amazing and capable! 🌸",
  "Sending you a big hug! 🤗",
  "You're doing a great job! 🎀",
  "You make the world brighter! ☀️",
  "Always remember how special you are! 💖",
];

export function LoveNotes() {
  const [currentNote, setCurrentNote] = useState<string | null>(null);

  useEffect(() => {
    // Show a message every 3-5 minutes
    const showMessage = () => {
      const randomNote = LOVE_NOTES[Math.floor(Math.random() * LOVE_NOTES.length)];
      setCurrentNote(randomNote);
      
      // Hide after 6 seconds
      setTimeout(() => {
        setCurrentNote(null);
      }, 6000);
    };

    const interval = setInterval(showMessage, 180000 + Math.random() * 120000);
    
    // Show first message after 10 seconds
    const initialTimeout = setTimeout(showMessage, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {currentNote && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="bg-white border-2 border-primary/30 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3 pointer-events-auto"
          >
            <div className="bg-pink-100 p-2 rounded-full">
              <Heart className="w-5 h-5 text-primary fill-current" />
            </div>
            <p className="text-sm md:text-base font-serif font-medium text-foreground italic">
              {currentNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
