
import { Court, Rotation } from "./scheduler";

export interface CourtDisplayProps {
  rotations: Rotation[];
  isKingCourt: boolean;
  sessionId?: string;
  sessionStatus?: string;
  allPlayers?: string[];
}

export interface PlayerData {
  name: string;
  gender: string;
}

export interface SwapData {
  player: string;
  teamType: 'team1' | 'team2';
  courtIndex: number;
  rotationIndex: number;
  targetPlayer?: string;
}

export interface ScoreData {
  team1: string;
  team2: string;
}
