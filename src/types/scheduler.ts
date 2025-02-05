
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
}
