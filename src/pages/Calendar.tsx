import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Calendar() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Calendar View</h1>
          </div>

          <Card className="p-12 text-center shadow-card">
            <div className="max-w-md mx-auto">
              <CalendarIcon className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Calendar Coming Soon</h2>
              <p className="text-muted-foreground">
                We're working on an amazing calendar view with monthly and weekly layouts. 
                Stay tuned!
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}