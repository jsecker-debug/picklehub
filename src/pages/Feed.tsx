import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  Trophy,
  Users,
  Clock,
  MessageCircle,
  PlusCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";

// Mock data for feed items - in a real app this would come from your backend
const mockFeedData = [
  {
    id: 1,
    type: "session_created",
    title: "New Session Scheduled",
    content: "A new pickleball session has been scheduled for this weekend at Riverside Courts.",
    author: {
      name: "Club Admin",
      avatar: "",
      initials: "CA"
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 5,
    comments: 2,
    metadata: {
      date: "2024-01-15",
      venue: "Riverside Courts"
    }
  },
  {
    id: 2,
    type: "member_joined",
    title: "New Member Joined",
    content: "Sarah Johnson has joined the club! Welcome to the community.",
    author: {
      name: "Sarah Johnson",
      avatar: "",
      initials: "SJ"
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: 12,
    comments: 4,
    metadata: {
      level: 4.2
    }
  },
  {
    id: 3,
    type: "tournament_result",
    title: "Tournament Results",
    content: "Congratulations to Mike Chen and Lisa Parker for winning the doubles tournament!",
    author: {
      name: "Tournament Director",
      avatar: "",
      initials: "TD"
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likes: 23,
    comments: 8,
    metadata: {
      winners: ["Mike Chen", "Lisa Parker"],
      tournament: "Spring Doubles"
    }
  },
  {
    id: 4,
    type: "announcement",
    title: "Court Maintenance Notice",
    content: "Courts 1 and 2 will be under maintenance this Thursday from 8 AM to 12 PM.",
    author: {
      name: "Facilities Manager",
      avatar: "",
      initials: "FM"
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    likes: 3,
    comments: 1,
    metadata: {
      courts: [1, 2],
      maintenanceDate: "2024-01-18"
    }
  },
  {
    id: 5,
    type: "session_completed",
    title: "Session Completed",
    content: "Great games today! 16 players participated in today's session at Central Park Courts.",
    author: {
      name: "Session Host",
      avatar: "",
      initials: "SH"
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    likes: 18,
    comments: 6,
    metadata: {
      participants: 16,
      venue: "Central Park Courts"
    }
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "session_created":
      return <Calendar className="h-5 w-5 text-chart-1" />;
    case "session_completed":
      return <Clock className="h-5 w-5 text-chart-2" />;
    case "member_joined":
      return <Users className="h-5 w-5 text-chart-3" />;
    case "tournament_result":
      return <Trophy className="h-5 w-5 text-chart-4" />;
    case "announcement":
      return <MessageSquare className="h-5 w-5 text-chart-5" />;
    default:
      return <MessageCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const getActivityBadge = (type: string) => {
  switch (type) {
    case "session_created":
      return <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">New Session</Badge>;
    case "session_completed":
      return <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">Completed</Badge>;
    case "member_joined":
      return <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">New Member</Badge>;
    case "tournament_result":
      return <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">Tournament</Badge>;
    case "announcement":
      return <Badge variant="secondary" className="bg-chart-5/10 text-chart-5">Announcement</Badge>;
    default:
      return <Badge variant="outline">Activity</Badge>;
  }
};

const Feed = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with club activities and announcements
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="default" size="sm">All</Button>
        <Button variant="outline" size="sm">Sessions</Button>
        <Button variant="outline" size="sm">Members</Button>
        <Button variant="outline" size="sm">Tournaments</Button>
        <Button variant="outline" size="sm">Announcements</Button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {mockFeedData.map((item) => (
          <Card key={item.id} className="p-6 bg-card border-border">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.author.avatar} />
                      <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                        {item.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-card-foreground text-sm">
                        {item.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                {getActivityBadge(item.type)}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.content}
                </p>

                {/* Metadata */}
                {item.metadata && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    {item.metadata.venue && (
                      <span className="text-muted-foreground">📍 {item.metadata.venue}</span>
                    )}
                    {item.metadata.date && (
                      <span className="text-muted-foreground">
                        📅 {format(new Date(item.metadata.date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {item.metadata.level && (
                      <span className="text-muted-foreground">⭐ Level {item.metadata.level}</span>
                    )}
                    {item.metadata.participants && (
                      <span className="text-muted-foreground">👥 {item.metadata.participants} players</span>
                    )}
                    {item.metadata.winners && (
                      <span className="text-muted-foreground">🏆 {item.metadata.winners.join(" & ")}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-2 ${
                    likedPosts.has(item.id) ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 ${likedPosts.has(item.id) ? 'fill-current' : ''}`} 
                  />
                  {item.likes + (likedPosts.has(item.id) ? 1 : 0)}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {item.comments}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full sm:w-auto">
          Load More Activities
        </Button>
      </div>
    </div>
  );
};

export default Feed;