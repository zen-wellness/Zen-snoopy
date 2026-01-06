import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, BookOpen, CheckCircle, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import generatedImage from "@assets/generated_images/snoopy_and_woodstock_on_pink_cloud.png";

export default function Landing() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
      <nav className="border-b p-4 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-display font-bold text-2xl text-primary">
            <Heart className="text-primary fill-primary animate-pulse" size={24} />
            DayStream
          </div>
          <Button onClick={() => login()} variant="ghost" className="hover-elevate">
            Sign In
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-accent/30 rounded-full blur-3xl animate-bounce duration-&lsqb;3000ms&rsqb;" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center z-10">
          
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-primary/20 px-4 py-1 rounded-full text-primary text-sm font-medium animate-in">
              <Heart className="fill-primary" size={14} />
              Super Girly Snoopy Planner
            </div>
            <h1 className="font-display text-4xl md:text-7xl font-bold leading-tight text-primary">
              Stay Snoopy,<br/>
              <span className="text-pink-600 italic">Stay Organized.</span>
            </h1>
            <p className="text-2xl md:text-3xl text-pink-950 leading-relaxed max-w-lg mx-auto lg:mx-0 font-black tracking-widest drop-shadow-md">
              Your Snoopy sanctuary for habits, journaling, and dreams. Soft pink bows and puppy love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all active-elevate-2 font-bold"
                onClick={() => login()}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-7 rounded-full border-2 border-primary/20 bg-white/50 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 -z-10 group-hover:scale-110 transition-transform" />
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-4 shadow-2xl transition-all duration-500 overflow-hidden">
              <img 
                src={generatedImage} 
                alt="Cute Snoopy and Woodstock" 
                className="w-full h-auto rounded-[1.5rem] object-cover mb-6 border-4 border-white shadow-sm"
              />
              <div className="space-y-4 px-4 pb-4">
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-primary/10">
                  <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">Daily Magic</h3>
                    <p className="text-xs text-muted-foreground">Plan your cute day with ease</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-primary/10">
                  <div className="h-10 w-10 bg-accent/40 rounded-xl flex items-center justify-center text-primary">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">Habit Hearts</h3>
                    <p className="text-xs text-muted-foreground">Build lovely streaks together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-white/30">
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="h-4 w-4 fill-primary text-primary" /> for Snoopy fans
        </p>
        <p className="mt-2">© {new Date().getFullYear()} DayStream. All rights reserved.</p>
      </footer>
    </div>
  );
}
