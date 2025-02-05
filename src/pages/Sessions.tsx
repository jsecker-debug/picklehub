
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { PlusIcon, Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSessions } from "@/hooks/useSessions";
import { useSessionSchedule } from "@/hooks/useSessionSchedule";
import { Session } from "@/hooks/useSessions";
import CourtDisplay from "@/components/CourtDisplay";
import DownloadPdfButton from "@/components/DownloadPdfButton";

const Sessions = () => {
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: sessions, isLoading, error } = useSessions();
  const { data: scheduleData, isLoading: isLoadingSchedule } = useSessionSchedule(selectedSessionId);

  const addSession = useMutation({
    mutationFn: async ({ date, venue }: { date: Date; venue: string }) => {
      const Status = date < new Date() ? 'Completed' : 'Upcoming';
      
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ 
          Date: date.toISOString(),
          Venue: venue,
          Status
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

  const getNextSession = (sessions: Session[]) => {
    const now = new Date();
    return sessions
      .filter(session => new Date(session.Date) > now)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())[0];
  };

  const getUpcomingSessions = (sessions: Session[]) => {
    const now = new Date();
    const nextSession = getNextSession(sessions);
    return sessions
      .filter(session => 
        new Date(session.Date) > now && 
        (!nextSession || session.id !== nextSession.id)
      )
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
  };

  const getCompletedSessions = (sessions: Session[]) => {
    return sessions
      .filter(session => new Date(session.Date) <= new Date())
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  };

  const SessionCard = ({ title, sessions }: { title: string; sessions: Session[] | undefined }) => (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedSessionId(session.id)}
            >
              <div>
                <p className="font-medium">{format(new Date(session.Date), 'PPP')}</p>
                <p className="text-gray-500">{session.Venue}</p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm",
                session.Status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              )}>
                {session.Status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No {title.toLowerCase()} sessions found.
        </div>
      )}
    </Card>
  );

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

      {isLoading ? (
        <div className="text-center text-gray-500">Loading sessions...</div>
      ) : sessions ? (
        <>
          <SessionCard 
            title="Next Session" 
            sessions={getNextSession(sessions) ? [getNextSession(sessions)!] : []} 
          />
          <SessionCard 
            title="Upcoming Sessions" 
            sessions={getUpcomingSessions(sessions)} 
          />
          <SessionCard 
            title="Completed Sessions" 
            sessions={getCompletedSessions(sessions)} 
          />

          {selectedSessionId && (
            <Dialog open={!!selectedSessionId} onOpenChange={(open) => !open && setSelectedSessionId(null)}>
              <DialogContent className="max-w-4xl max-h-[calc(100vh-24px)] my-12 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-primary">Session Schedule</DialogTitle>
                </DialogHeader>
                {isLoadingSchedule ? (
                  <div className="text-center py-4">Loading schedule...</div>
                ) : scheduleData ? (
                  <div className="space-y-6 pt-4">
                    <DownloadPdfButton 
                      contentId="session-schedule"
                      fileName="session-schedule"
                      className="w-full p-6 text-lg flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-6 h-6" />
                      Download Session Schedule
                    </DownloadPdfButton>
                    <div id="session-schedule">
                      {scheduleData.randomRotations.length > 0 && (
                        <CourtDisplay 
                          rotations={scheduleData.randomRotations} 
                          isKingCourt={false} 
                        />
                      )}
                      {scheduleData.kingCourtRotation && (
                        <CourtDisplay 
                          rotations={[scheduleData.kingCourtRotation]} 
                          isKingCourt={true} 
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No schedule found for this session.
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Sessions;

