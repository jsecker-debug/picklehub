
export interface Court {
  team1: string[];
  team2: string[];
}

export interface Rotation {
  courts: Court[];
  resters: string[];
  id?: string;
}

export interface Participant {
  id: string;
  name: string;
  level?: number;
}

export interface Session {
  id: string;
  Date: string;
  Venue: string;
  Status: 'Upcoming' | 'Completed' | 'Ready';
}
