import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Calendar, Home, TrendingUp, LogOut, Waves, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "See you next time!",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Today" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/statistics", icon: TrendingUp, label: "Statistics" },
  ];

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8">
        <Waves className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          TaskWave
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-5 w-5" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="mr-2 h-5 w-5" />
              Light Mode
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}