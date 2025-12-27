import { useState } from 'react';
import { calculateProgress } from '@/lib/shipment-utils';
import { initialShipmentData } from '@/types/shipment';
import { useShipments, useCreateShipment } from '@/hooks/useShipments';
import ShipmentCard from './ShipmentCard';
import NotesTable from './NotesTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, LayoutGrid, List, Moon, Sun, BookOpen, Loader2, TrendingUp, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { data: shipments = [], isLoading } = useShipments();
  const createShipment = useCreateShipment();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'in-progress'>('all');
  const [_, setLocation] = useLocation();
  const [newId, setNewId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const filteredShipments = shipments
    .filter((s) => {
      const progress = calculateProgress(s as any);
      const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.details.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.details.container.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (statusFilter === 'all') return true;
      if (statusFilter === 'completed') return progress === 100;
      if (statusFilter === 'pending') return progress < 100;
      if (statusFilter === 'in-progress') return progress > 0 && progress < 100;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      if (sortBy === 'progress') return calculateProgress(b as any) - calculateProgress(a as any);
      return 0;
    });

  const handleCreate = () => {
    if (newId) {
      createShipment.mutate(
        {
          ...initialShipmentData,
          id: newId,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setNewId('');
            setLocation(`/shipment/${newId}`);
          },
        }
      );
    }
  };

  const stats = {
    total: shipments.length,
    completed: shipments.filter(s => calculateProgress(s as any) === 100).length,
    pending: shipments.filter(s => calculateProgress(s as any) < 100).length,
    inProgress: shipments.filter(s => {
      const p = calculateProgress(s as any);
      return p > 0 && p < 100;
    }).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const avgProgress = stats.total > 0 ? Math.round(shipments.reduce((sum, s) => sum + calculateProgress(s as any), 0) / stats.total) : 0;
  const recentShipments = shipments.slice(0, 3).sort((a, b) => b.createdAt - a.createdAt);
  const topProgressShipments = shipments.sort((a, b) => calculateProgress(b as any) - calculateProgress(a as any)).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary hidden sm:block">
              Shipment Manager
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsNotesOpen(true)}
              title="Open Notes"
            >
              <BookOpen className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white shadow-md transition-all hover:-translate-y-0.5">
                <Plus className="mr-2 h-4 w-4" /> New Shipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shipment</DialogTitle>
                <DialogDescription>
                  Enter the unique Invoice ID for the new shipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="invoice-id" className="text-right">
                    Invoice ID
                  </Label>
                  <Input
                    id="invoice-id"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="col-span-3 uppercase font-mono"
                    placeholder="INV-..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center justify-between hover:border-primary/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
              <h3 className="text-3xl font-bold text-primary mt-1">{stats.total}</h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <LayoutGrid className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center justify-between hover:border-success/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <h3 className="text-3xl font-bold text-success mt-1">{stats.completed}</h3>
              <p className="text-xs text-muted-foreground mt-1">{completionRate}% completion</p>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center justify-between hover:border-blue-500/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h3 className="text-3xl font-bold text-blue-500 mt-1">{stats.inProgress}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center justify-between hover:border-warning/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Action</p>
              <h3 className="text-3xl font-bold text-warning mt-1">{stats.pending}</h3>
              <p className="text-xs text-muted-foreground mt-1">Average {avgProgress}%</p>
            </div>
            <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Insights & Progress Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Progress */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Fleet Completion</span>
                  <span className="text-sm font-bold text-primary">{avgProgress}%</span>
                </div>
                <Progress value={avgProgress} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                {stats.completed} of {stats.total} shipments complete
              </div>
            </div>
          </div>

          {/* Recent Shipments Preview */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Shipments</h3>
            <div className="space-y-3">
              {recentShipments.length > 0 ? (
                recentShipments.map((shipment) => {
                  const progress = calculateProgress(shipment as any);
                  return (
                    <div 
                      key={shipment.id} 
                      className="p-2 bg-muted/30 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/shipment/${shipment.id}`)}
                      data-testid={`recent-shipment-${shipment.id}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-mono font-semibold text-foreground">{shipment.id}</span>
                        <Badge variant="outline" className="text-[10px]">{progress}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{shipment.details.customer}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No shipments yet</p>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Closest to Completion</h3>
            <div className="space-y-3">
              {topProgressShipments.length > 0 ? (
                topProgressShipments.map((shipment) => {
                  const progress = calculateProgress(shipment as any);
                  return (
                    <div 
                      key={shipment.id} 
                      className="p-2 bg-muted/30 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/shipment/${shipment.id}`)}
                      data-testid={`top-shipment-${shipment.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-semibold text-foreground">{shipment.id}</span>
                        <span className="text-xs font-bold text-success">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">No shipments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              data-testid="filter-all"
              className="transition-all"
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
              data-testid="filter-completed"
              className="transition-all"
            >
              Completed
            </Button>
            <Button 
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in-progress')}
              data-testid="filter-in-progress"
              className="transition-all"
            >
              In Progress
            </Button>
            <Button 
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
              data-testid="filter-pending"
              className="transition-all"
            >
              Pending
            </Button>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, Customer, Container..." 
                className="pl-9 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Created</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex bg-muted rounded-md p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm bg-background shadow-sm">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-muted-foreground hover:text-foreground">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredShipments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} data={shipment as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            <p className="text-lg">No shipments found</p>
            <p className="text-sm">Try adjusting your search or create a new one.</p>
          </div>
        )}
      </main>

      {/* Notes Drawer */}
      <NotesTable open={isNotesOpen} onOpenChange={setIsNotesOpen} />
    </div>
  );
}
