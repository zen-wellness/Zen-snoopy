import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white snoopy-float">
            <Moon size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">Zen Snoopy</span>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogin}
          className="rounded-full px-6 border-primary/20 hover:bg-primary/10 hover:text-primary"
        >
          Sweet Dreams Sign In
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto mt-10 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium tracking-wide">
            Glam up your sleep routine ✨
          </span>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-primary">
            Sleep like Snoopy, <br />
            <span className="text-accent-foreground italic">glow every day.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ultimate girly sanctuary for your sleep patterns, habits, and dreams. 
            Maintain a regular schedule with style and grace.
          </p>
          
          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="rounded-full px-10 py-8 text-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
            >
              Start My Journey
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          <FeatureCard 
            icon={<Moon className="w-6 h-6 text-indigo-400" />}
            title="Sleep Tracker"
            description="Log your restful nights and wake up feeling like a star."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-pink-400" />}
            title="Girly Habits"
            description="Build consistent routines with cute streaks and reminders."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Heart className="w-6 h-6 text-red-400" />}
            title="Daily Glow"
            description="Journal your thoughts and track your mood patterns."
            delay={0.6}
          />
        </div>
      </main>

      <footer className="p-8 text-center text-sm text-muted-foreground mt-20">
        <p>© {new Date().getFullYear()} Zen Snoopy. Rest well, darling.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="p-8 rounded-3xl bg-white border border-primary/10 shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
