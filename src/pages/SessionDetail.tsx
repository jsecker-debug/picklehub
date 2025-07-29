import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/useSessions";
import { useSessionSchedule, useDeleteSessionSchedule } from "@/hooks/useSessionSchedule";
import { useSessionRegistrations, useUserSessionRegistration, useRegisterForSession, useUnregisterFromSession } from "@/hooks/useSessionRegistration";
import { useAuth } from "@/contexts/AuthContext";
import CourtDisplay from "@/components/CourtDisplay";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import SessionScheduleDialog from "@/components/session/SessionScheduleDialog";
import TemporaryParticipantManager from "@/components/session/TemporaryParticipantManager";
import { useTemporaryParticipants } from "@/hooks/useTemporaryParticipants";

const SessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const { data: scheduleData, isLoading: isLoadingSchedule } = useSessionSchedule(sessionId || null);
  const { data: registrations, isLoading: isLoadingRegistrations } = useSessionRegistrations(sessionId || '');
  const { data: userRegistration } = useUserSessionRegistration(sessionId || '');
  const { data: temporaryParticipants = [] } = useTemporaryParticipants(sessionId || '');
  const registerMutation = useRegisterForSession();
  const unregisterMutation = useUnregisterFromSession();
  const deleteScheduleMutation = useDeleteSessionSchedule();

  const session = sessions?.find(s => s.id.toString() === sessionId);
  
  
  // Calculate registration stats
  const registeredUsers = registrations?.filter(r => r.status === 'registered') || [];
  const waitlistUsers = registrations?.filter(r => r.status === 'waitlist') || [];
  const totalPlayers = registeredUsers.length + temporaryParticipants.length;
  const maxParticipants = session?.max_participants || 16;
  const isSessionFull = registeredUsers.length >= maxParticipants;
  const isUserRegistered = !!userRegistration && ['registered', 'waitlist'].includes(userRegistration.status);

  const handleRegister = () => {
    if (!sessionId || !session) return;
    registerMutation.mutate({ 
      sessionId: session.id, 
      session: {
        max_participants: session.max_participants,
        fee_per_player: session.fee_per_player
      }
    });
  };

  const handleUnregister = () => {
    if (!sessionId || !session) return;
    unregisterMutation.mutate({ sessionId: session.id });
  };

  const handleDeleteSchedule = () => {
    if (!sessionId) return;
    if (confirm("Are you sure you want to delete the current schedule? This action cannot be undone.")) {
      deleteScheduleMutation.mutate(sessionId);
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/schedule')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
        </div>
        <Card className="p-8 text-center bg-card border-border">
          <p className="text-muted-foreground">Loading session...</p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/schedule')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
        </div>
        <Card className="p-8 text-center bg-card border-border">
          <p className="text-muted-foreground">Session not found</p>
        </Card>
      </div>
    );
  }

  const sessionDate = new Date(session.Date);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Helper function to get participant display name
  const getParticipantName = (participant: any) => {
    if (participant.user_profiles?.first_name && participant.user_profiles?.last_name) {
      return `${participant.user_profiles.first_name} ${participant.user_profiles.last_name}`;
    }
    if (participant.user_profiles?.first_name) {
      return participant.user_profiles.first_name;
    }
    return 'Unknown User';
  };

  // Helper function to get participant initials
  const getParticipantInitials = (participant: any) => {
    if (participant.user_profiles?.first_name || participant.user_profiles?.last_name) {
      return `${participant.user_profiles.first_name?.[0] || ''}${participant.user_profiles.last_name?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/schedule')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Session Details
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(sessionDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {session.Status === 'Upcoming' && user && (
            <>
              {isUserRegistered ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleUnregister}
                  disabled={unregisterMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {unregisterMutation.isPending ? 'Removing...' : 'Unregister'}
                </Button>
              ) : (
                <Button 
                  size="sm"
                  variant={isSessionFull ? "outline" : "default"}
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {registerMutation.isPending ? 'Registering...' : isSessionFull ? 'Join Waitlist' : 'Register'}
                </Button>
              )}
            </>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Session
          </Button>
          {session.Status === 'Upcoming' && (
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          )}
        </div>
      </div>

      {/* Session Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Session Overview
            </CardTitle>
            <Badge className={cn("text-sm", getStatusColor(session.Status))}>
              {session.Status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-card-foreground">
                    {format(sessionDate, 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(sessionDate, 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium text-card-foreground">{session.Venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-medium text-card-foreground">
                    {registeredUsers.length}/{maxParticipants} registered
                  </p>
                  {waitlistUsers.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {waitlistUsers.length} on waitlist
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {session.registration_deadline ? 'Registration Deadline' : 'Duration'}
                  </p>
                  <p className="font-medium text-card-foreground">
                    {session.registration_deadline 
                      ? format(new Date(session.registration_deadline), 'MMM d, yyyy h:mm a')
                      : '2 hours'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Session Fee</p>
                <p className="font-medium text-card-foreground">
                  {session.fee_per_player ? `$${Number(session.fee_per_player).toFixed(2)} per player` : 'Free'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Status</p>
                <p className="font-medium text-card-foreground">
                  {isUserRegistered 
                    ? userRegistration?.status === 'registered' 
                      ? 'You are registered' 
                      : 'You are on the waitlist'
                    : 'Not registered'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({(registrations || []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRegistrations ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading participants...
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="space-y-6">
              {/* Registered Players */}
              {registeredUsers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Registered ({registeredUsers.length}/{maxParticipants})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {registeredUsers.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-accent/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {getParticipantInitials(participant)}
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{getParticipantName(participant)}</p>
                            <p className="text-sm text-muted-foreground">
                              {participant.email || 'No email'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Level {participant.user_profiles?.skill_level || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="default" className="text-xs">
                            Registered
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waitlist */}
              {waitlistUsers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Waitlist ({waitlistUsers.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {waitlistUsers.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-accent/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {getParticipantInitials(participant)}
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{getParticipantName(participant)}</p>
                            <p className="text-sm text-muted-foreground">
                              {participant.email || 'No email'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Level {participant.user_profiles?.skill_level || 'N/A'} • #{index + 1} in line
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <Badge variant="secondary" className="text-xs">
                            Waitlist
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Temporary Participants Section */}
              {session.Status === 'Upcoming' && (
                <div className="mt-8 pt-6 border-t border-border">
                  <TemporaryParticipantManager sessionId={sessionId || ''} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                No participants registered yet.
              </div>
              {session.Status === 'Upcoming' && user && !isUserRegistered && (
                <Button onClick={handleRegister} disabled={registerMutation.isPending}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Be the first to register!
                </Button>
              )}
              
              {/* Temporary Participants Section - Show even when no registered users */}
              {session.Status === 'Upcoming' && (
                <div className="mt-8 pt-6 border-t border-border">
                  <TemporaryParticipantManager sessionId={sessionId || ''} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Court Schedule */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Court Schedule
            </CardTitle>
            {scheduleData?.rotations && scheduleData.rotations.length > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteSchedule}
                  disabled={deleteScheduleMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteScheduleMutation.isPending ? 'Deleting...' : 'Delete Schedule'}
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setScheduleDialogOpen(true)}
                  disabled={totalPlayers < 4}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Regenerate Schedule
                </Button>
                <DownloadPdfButton
                  rotations={scheduleData.rotations}
                  sessionId={sessionId || ''}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading court schedule...
            </div>
          ) : scheduleData?.rotations && scheduleData.rotations.length > 0 ? (
            <CourtDisplay
              rotations={scheduleData.rotations}
              isKingCourt={false}
              sessionId={sessionId || ''}
              sessionStatus={session.Status}
            />
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                No court schedule generated for this session yet.
              </div>
              <Button 
                onClick={() => setScheduleDialogOpen(true)}
                disabled={totalPlayers < 4}
              >
                <Play className="h-4 w-4 mr-2" />
                Generate Schedule
              </Button>
              {totalPlayers < 4 && (
                <p className="text-sm text-muted-foreground">
                  Need at least 4 players total (registered + temporary) to generate a schedule
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Generation Dialog */}
      <SessionScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        sessionId={sessionId || ''}
        registeredUsers={registrations || []}
        sessionStatus={session.Status}
      />
    </div>
  );
};

export default SessionDetail;