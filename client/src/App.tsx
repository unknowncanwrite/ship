import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import NotFound from "@/pages/not-found";
import Dashboard from "@/components/dashboard/Dashboard";
import ShipmentDetail from "@/components/shipment/ShipmentDetail";
import NotesTable from "@/components/dashboard/NotesTable";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/shipment/:id" component={ShipmentDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Router />
          
          {/* Global Notes Toggle Button */}
          <Button 
            variant="outline" 
            size="icon"
            className="fixed top-20 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsNotesOpen(true)}
            title="Open Notes"
          >
            <BookOpen className="h-6 w-6" />
          </Button>

          <NotesTable open={isNotesOpen} onOpenChange={setIsNotesOpen} />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
