
export interface Court {
  team1: string[];
  team2: string[];
}

export interface Rotation {
  courts: Court[];
  resters: string[];
}

export interface Participant {
  id: string;
  name: string;
  level?: number; // Making it optional since existing records won't have it
}
