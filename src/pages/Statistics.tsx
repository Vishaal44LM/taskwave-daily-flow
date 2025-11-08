import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Statistics() {
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    byPriority: { low: 0, medium: 0, high: 0 },
  });
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*");

      if (error) throw error;

      const total = data.length;
      const completed = data.filter((t) => t.status === "completed").length;
      const pending = data.filter((t) => t.status === "pending").length;
      
      const byPriority = {
        low: data.filter((t) => t.priority === "low").length,
        medium: data.filter((t) => t.priority === "medium").length,
        high: data.filter((t) => t.priority === "high").length,
      };

      setStats({ total, completed, pending, byPriority });
    } catch (error: any) {
      toast({
        title: "Error loading statistics",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completionData = [
    { name: "Completed", value: stats.completed, color: "hsl(var(--primary))" },
    { name: "Pending", value: stats.pending, color: "hsl(var(--muted))" },
  ];

  const priorityData = [
    { name: "High", count: stats.byPriority.high, fill: "hsl(var(--priority-high))" },
    { name: "Medium", count: stats.byPriority.medium, fill: "hsl(var(--priority-medium))" },
    { name: "Low", count: stats.byPriority.low, fill: "hsl(var(--priority-low))" },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Your Statistics</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-4xl font-bold">{stats.total}</CardTitle>
                <CardDescription>Total Tasks</CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">{stats.completed}</CardTitle>
                <CardDescription>Completed Tasks</CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-4xl font-bold">{completionRate}%</CardTitle>
                <CardDescription>Completion Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Overview of completed vs pending tasks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Tasks by Priority</CardTitle>
                <CardDescription>Distribution of task priorities</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}