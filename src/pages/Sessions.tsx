import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";

const Sessions = () => {
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: sessions, isLoading, error } = useSessions();

  const addSession = useMutation({
    mutationFn: async ({ date, venue }: { date: Date; venue: string }) => {
      console.log('Adding session:', { date, venue });
      const status = date < new Date() ? 'Completed' : 'Upcoming';
      
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ 
          Date: date.toISOString(),
          venue,
          status 
        }])
        .select();
      
      if (error) {
        console.error('Error adding session:', error);
        throw error;
      }
      
      console.log('Session added:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setIsDialogOpen(false);
      setDate(undefined);
      setVenue(undefined);
      toast.success("Session added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add session");
      console.error("Error adding session:", error);
    },
  });

  const handleSubmit = () => {
    if (!date || !venue) {
      toast.error("Please fill in all fields");
      return;
    }
    addSession.mutate({ date, venue });
  };

  if (error) {
    return <div className="container mx-auto p-6">Error loading sessions</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sessions</h1>
          <p className="text-gray-600 mt-2">Manage your pickleball sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="rounded-md border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <Select onValueChange={setVenue} value={venue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eton">Eton</SelectItem>
                    <SelectItem value="Windsor">Windsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={!date || !venue}
              >
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading sessions...</div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{format(new Date(session.Date), 'PPP')}</p>
                  <p className="text-gray-500">{session.venue}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm",
                  session.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No sessions found. Start by creating a new session.
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sessions;
