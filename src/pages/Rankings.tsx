import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParticipants } from "@/hooks/useParticipants";
import { useClub } from "@/contexts/ClubContext";
import { useState } from "react";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Crown,
  Star,
  BarChart3
} from "lucide-react";

type SortOption = "level" | "winrate" | "games" | "wins";
type FilterOption = "all" | "active" | "male" | "female";

const Rankings = () => {
  const { selectedClub } = useClub();
  const { data: participants, isLoading, error } = useParticipants();
  const [sortBy, setSortBy] = useState<SortOption>("level");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Filter and sort participants
  const processedParticipants = participants
    ?.filter(participant => {
      switch (filterBy) {
        case "active":
          return participant.total_games_played > 0;
        case "male":
          return participant.gender === "M";
        case "female":
          return participant.gender === "F";
        default:
          return true;
      }
    })
    ?.map(participant => ({
      ...participant,
      winRate: participant.total_games_played > 0 
        ? (participant.wins / participant.total_games_played) * 100 
        : 0
    }))
    ?.sort((a, b) => {
      switch (sortBy) {
        case "level":
          return (b.level || 0) - (a.level || 0);
        case "winrate":
          return b.winRate - a.winRate;
        case "games":
          return b.total_games_played - a.total_games_played;
        case "wins":
          return b.wins - a.wins;
        default:
          return 0;
      }
    }) || [];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getLevelBadge = (level: number) => {
    if (level >= 6) return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Pro</Badge>;
    if (level >= 4.5) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Advanced</Badge>;
    if (level >= 3.5) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Intermediate</Badge>;
    return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Beginner</Badge>;
  };

  const getWinRateTrend = (winRate: number) => {
    if (winRate >= 60) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (winRate <= 40) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  // Calculate stats for the overview
  const totalPlayers = processedParticipants.length;
  const averageLevel = totalPlayers > 0 
    ? (processedParticipants.reduce((sum, p) => sum + (p.level || 0), 0) / totalPlayers).toFixed(1)
    : "0.0";
  const topPlayer = processedParticipants[0];
  const averageWinRate = totalPlayers > 0
    ? (processedParticipants.reduce((sum, p) => sum + p.winRate, 0) / totalPlayers).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rankings</h1>
        <p className="text-muted-foreground mt-2">
          {selectedClub ? `${selectedClub.name} - Player rankings and statistics` : 'Player rankings and statistics'}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Players</p>
              <p className="text-2xl font-bold text-card-foreground">{totalPlayers}</p>
            </div>
            <Trophy className="h-8 w-8 text-chart-1" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Level</p>
              <p className="text-2xl font-bold text-card-foreground">{averageLevel}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-chart-2" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top Player</p>
              <p className="text-2xl font-bold text-card-foreground">
                {topPlayer ? topPlayer.name.split(' ')[0] : 'N/A'}
              </p>
            </div>
            <Crown className="h-8 w-8 text-chart-3" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Win Rate</p>
              <p className="text-2xl font-bold text-card-foreground">{averageWinRate}%</p>
            </div>
            <Star className="h-8 w-8 text-chart-4" />
          </div>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              Sort by
            </label>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="level">Skill Level</SelectItem>
                <SelectItem value="winrate">Win Rate</SelectItem>
                <SelectItem value="games">Games Played</SelectItem>
                <SelectItem value="wins">Total Wins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-card-foreground mb-2 block">
              Filter
            </label>
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Players</SelectItem>
                <SelectItem value="active">Active Players</SelectItem>
                <SelectItem value="male">Male Players</SelectItem>
                <SelectItem value="female">Female Players</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Rankings Table */}
      <Card className="bg-card border-border">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">
            Leaderboard
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading rankings...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive">Failed to load rankings</div>
            </div>
          ) : !selectedClub ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Please select a club to view rankings</div>
            </div>
          ) : processedParticipants.length > 0 ? (
            <div className="space-y-4">
              {processedParticipants.map((participant, index) => (
                <div 
                  key={participant.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    index < 3 
                      ? 'border-primary/20 bg-primary/5' 
                      : 'border-border bg-accent/5 hover:bg-accent/10'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>

                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar_url || undefined} />
                      <AvatarFallback className="text-sm bg-sidebar-accent text-sidebar-accent-foreground">
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">
                        {participant.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getLevelBadge(participant.level || 0)}
                        <span className="text-xs text-muted-foreground">
                          {participant.gender === 'M' ? 'Male' : 'Female'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-card-foreground">
                        {participant.level?.toFixed(1) || '0.0'}
                      </p>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-card-foreground">
                          {participant.winRate.toFixed(1)}%
                        </p>
                        {getWinRateTrend(participant.winRate)}
                      </div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-card-foreground">
                        {participant.total_games_played}
                      </p>
                      <p className="text-xs text-muted-foreground">Games</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-500">
                        {participant.wins}
                      </p>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="sm:hidden text-right">
                    <p className="font-medium text-card-foreground">
                      {participant.level?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant.wins}W / {participant.total_games_played}G
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {participants && participants.length === 0 
                ? 'No participants in this club yet'
                : 'No players found matching the current filters.'
              }
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Rankings;