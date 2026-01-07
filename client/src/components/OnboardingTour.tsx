import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, X } from "lucide-react";

const steps = [
  {
    title: "Welcome to Zen! ✨",
    description: "I'm Snoopy, your AI guide. Let me show you how to maintain your glow!",
    target: "header"
  },
  {
    title: "Your Daily Timeline ⏰",
    description: "Track your tasks and see what's next. Click on a task to mark it done!",
    target: "timeline"
  },
  {
    title: "Habit Tracking 🌸",
    description: "Stay consistent with your habits and watch your streaks grow.",
    target: "habits"
  },
  {
    title: "Mood & Wellness 💖",
    description: "Check in with how you're feeling and keep a journal of your journey.",
    target: "checkin"
  },
  {
    title: "AI Guidance 🤖",
    description: "I'm always here at the bottom right to chat, give advice, or help manage your schedule!",
    target: "chat"
  }
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="max-w-md w-full"
        >
          <Card className="border-primary/20 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-6 pb-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                  <span>Snoopy's Tour</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onComplete} className="h-8 w-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-2xl font-serif text-primary">
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {steps[currentStep].description}
              </p>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-primary/20"
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white gap-2 px-6 shadow-lg shadow-primary/20 rounded-full h-11">
                  {currentStep === steps.length - 1 ? "Get Started!" : "Next Step"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
