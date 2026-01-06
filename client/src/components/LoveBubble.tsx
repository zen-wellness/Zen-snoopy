import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";

const messages = [
  "You are so incredibly loved! ✨",
  "You're doing an amazing job today! 🌸",
  "The world is better because you're in it! 🌎",
  "You deserve all the happiness in the world! 💖",
  "You're a shining star! 🌟",
  "Keep glowing, you're beautiful! ✨",
  "You're appreciated more than you know! 🙌",
  "You're a gift to everyone around you! 🎁",
  "Your smile brightens the day! 😊",
  "You are strong and capable! 💪",
  "You are worthy of all good things! 🎀",
  "Sending you a huge hug! 🤗",
];

export function LoveBubble() {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Pick a unique message on load
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMsg);

    // Random position on the screen
    const randomX = Math.random() * (window.innerWidth - 250) + 50;
    const randomY = Math.random() * (window.innerHeight - 150) + 50;
    setPosition({ x: randomX, y: randomY });

    // Show after a short delay
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, x: position.x, y: position.y }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: position.y - 20, // Gentle floating up
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 10,
          y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
        drag
        dragConstraints={{ left: 0, right: window.innerWidth - 200, top: 0, bottom: window.innerHeight - 100 }}
        onClick={() => setIsVisible(false)}
        className="fixed z-[100] cursor-pointer active:cursor-grabbing"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-6 py-4 bg-white/80 backdrop-blur-md border border-pink-100 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-full">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {message}
            </p>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
