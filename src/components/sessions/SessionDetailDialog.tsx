
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import CourtDisplay from "@/components/CourtDisplay";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { useSessionSchedule } from "@/hooks/useSessionSchedule";
import type { Session } from "@/hooks/useSessions";

interface SessionDetailDialogProps {
  sessionId: string | null;
  onClose: () => void;
  sessions: Session[] | undefined;
}

const SessionDetailDialog = ({ sessionId, onClose, sessions }: SessionDetailDialogProps) => {
  const { data: scheduleData, isLoading: isLoadingSchedule } = useSessionSchedule(sessionId);
  
  if (!sessionId) return null;
  
  const session = sessions?.find(s => s.id === sessionId);

  return (
    <Dialog open={!!sessionId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-none h-[100vh] max-h-[100vh] m-0 p-0 rounded-none flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b p-2 sm:p-4 flex justify-between items-center">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl sm:text-4xl font-bold text-primary">
              {session?.Venue} - {
                session?.Date 
                  ? format(new Date(session?.Date), 'PPP')
                  : ''
              }
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-xl">
              Session Schedule
            </DialogDescription>
          </DialogHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 sm:p-6">
          {isLoadingSchedule ? (
            <div className="text-center py-2 sm:py-4 text-base sm:text-2xl">Loading schedule...</div>
          ) : scheduleData ? (
            <div className="space-y-4 sm:space-y-8">
              {(scheduleData.randomRotations.length > 0 || scheduleData.kingCourtRotation) ? (
                <>
                  <DownloadPdfButton 
                    contentId="session-schedule"
                    fileName="session-schedule"
                    className="w-full p-3 sm:p-6 text-base sm:text-2xl flex items-center justify-center gap-2 sm:gap-3 bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-5 h-5 sm:w-8 sm:h-8" />
                    Download Session Schedule
                  </DownloadPdfButton>
                  <div id="session-schedule">
                    {scheduleData.randomRotations.length > 0 && (
                      <CourtDisplay 
                        rotations={scheduleData.randomRotations} 
                        isKingCourt={false}
                        sessionId={sessionId}
                        sessionStatus={session?.Status}
                      />
                    )}
                    {scheduleData.kingCourtRotation && (
                      <CourtDisplay 
                        rotations={[scheduleData.kingCourtRotation]} 
                        isKingCourt={true}
                        sessionId={sessionId}
                        sessionStatus={session?.Status}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-2 sm:py-4 text-base sm:text-2xl text-gray-500">
                  No Session Generated
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 sm:py-4 text-base sm:text-2xl text-gray-500">
              No schedule found for this session.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailDialog;
