import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import snoopyHeart from "@assets/IMG_0317_1767672528677.png";
import snoopyAviator from "@assets/IMG_0318_1767672528678.png";
import snoopyRoof from "@assets/IMG_0319_1767672528678.png";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Landing() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      login({ email, password, rememberMe });
    } else {
      register({ email, password });
    }
  };

  return (
    <div className="min-h-screen relative z-10 text-foreground flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2">
          <img src={snoopyHeart} alt="Snoopy Heart" className="w-12 h-12 object-contain snoopy-float" />
          <span className="text-2xl font-bold tracking-tight text-primary">Zen Snoopy</span>
        </div>
        <div className="flex gap-4 items-center">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="grid gap-1.5">
              <Input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-40"
              />
            </div>
            <div className="grid gap-1.5">
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-40"
              />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-xs text-muted-foreground">Remember</Label>
            </div>
            <Button 
              type="submit"
              variant="default" 
              disabled={isLoggingIn || isRegistering}
              className="rounded-full px-6 h-9"
            >
              {isLoginView ? (isLoggingIn ? "..." : "Sign In") : (isRegistering ? "..." : "Register")}
            </Button>
          </form>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-xs"
          >
            {isLoginView ? "Need account?" : "Have account?"}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto mt-10 md:mt-20 relative">
        <div className="absolute -left-20 top-0 opacity-20 hidden lg:block">
           <img src={snoopyAviator} alt="Snoopy Aviator" className="w-48 h-48 object-contain -rotate-12" />
        </div>
        <div className="absolute -right-20 bottom-0 opacity-20 hidden lg:block">
           <img src={snoopyRoof} alt="Snoopy Roof" className="w-48 h-48 object-contain rotate-12" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 relative z-10"
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
              onClick={() => login()}
              disabled={isLoggingIn}
              className="rounded-full px-10 py-8 text-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
            >
              {isLoggingIn ? "Starting..." : "Start My Journey"}
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
      className="p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-primary/10 shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
