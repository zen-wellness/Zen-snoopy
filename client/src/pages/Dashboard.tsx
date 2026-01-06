import { useAuth } from "@/hooks/use-auth";
import { QuoteBanner } from "@/components/QuoteBanner";
import { TaskList } from "@/components/TaskList";
import { HabitTracker } from "@/components/HabitTracker";
import { DailyJournal } from "@/components/DailyJournal";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import snoopyStanding from "@assets/IMG_0320_1767672528678.jpeg";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/10 snoopy-float overflow-hidden border-2 border-primary/20">
            <img src={snoopyStanding} alt="Snoopy" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Princess'} <Sparkles className="w-5 h-5 text-accent-foreground" />
            </h1>
            <p className="text-sm text-muted-foreground">Keep that glow and maintain your sleep schedule! ✨</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => logout()}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full px-6"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Goodnight Sign Out
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Quote Section */}
        <section>
          <QuoteBanner />
        </section>

        {/* Dashboard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          {/* Left Column: Tasks (Take up more space) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7 lg:col-span-8 flex flex-col gap-6"
          >
            <div className="flex-1 min-h-[400px]">
              <TaskList />
            </div>
            <div className="min-h-[250px]">
              <DailyJournal />
            </div>
          </motion.div>

          {/* Right Column: Habits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-5 lg:col-span-4 min-h-[400px]"
          >
            <HabitTracker />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
