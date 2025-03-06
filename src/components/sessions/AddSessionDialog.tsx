
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSessionDialog = ({ open, onOpenChange }: AddSessionDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState<string>();
  const queryClient = useQueryClient();

  const addSession = useMutation({
    mutationFn: async ({ date, venue }: { date: Date; venue: string }) => {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ 
          Date: date.toISOString(),
          Venue: venue,
          Status: 'Upcoming'
        }])
        .select();
      
      if (error) {
        console.error('Error adding session:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
          <DialogDescription>
            Select a date and venue for the new session.
          </DialogDescription>
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
  );
};

export default AddSessionDialog;
