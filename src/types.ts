
export enum UserRole {
  ADMIN = 'ADMIN',
  SCORER = 'SCORER',
  PLAYER = 'PLAYER',
  GUEST = 'GUEST', // For non-logged-in users
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  profilePictureUrl?: string;
}

export interface League {
  id: string;
  name: string;
  location: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  numberOfTeams?: number; // Optional, could be derived
  teams?: Team[]; // Populated on demand
}

export interface Team {
  id: string;
  name: string;
  leagueId: string;
  captainId?: string;
  players?: Player[]; // Populated on demand
  logoUrl?: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email?: string; // Non-fidelity as per req
  profilePictureUrl?: string;
  teamIds: string[]; // Player can be in multiple teams across leagues
  // Stats would be more complex, e.g., battingStats: {}, bowlingStats: {}
}

export enum MatchStatus {
  SCHEDULED = 'Scheduled',
  LIVE = 'Live',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
  POSTPONED = 'Postponed',
}

export interface Match {
  id: string;
  leagueId: string;
  teamAId: string;
  teamBId: string;
  dateTime: string; // ISO Date string
  venue: string;
  overs: number;
  status: MatchStatus;
  tossWonByTeamId?: string;
  choseTo?: 'Bat' | 'Bowl';
  umpire1?: string;
  umpire2?: string;
  result?: string; // e.g., "Team A won by 5 wickets"
  scorecardId?: string;
  playingTeamA?: Player[];
  playingTeamB?: Player[];
}

// Simplified Scorecard structure
export interface Ball {
  over: number;
  ballInOver: number;
  bowlerId: string;
  batsmanId: string; // Striker
  nonStrikerId: string;
  runsScored: number;
  extras: { type?: 'Wd' | 'Nb' | 'Lb' | 'B'; runs?: number };
  wicket?: { type: string; playerId: string; fielderId?: string }; // e.g., 'Bowled', 'Caught'
  commentary?: string;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  score: number;
  wickets: number;
  oversPlayed: number; // e.g. 10.2 for 10 overs and 2 balls
  balls: Ball[];
  // Could add fallOfWickets, partnerships etc.
}

export interface Scorecard {
  id: string;
  matchId: string;
  innings1: Innings;
  innings2?: Innings; // Optional for second innings
}

// For forms - partial types are useful
export type LeagueFormData = Omit<League, 'id' | 'teams'>;
export type TeamFormData = Omit<Team, 'id' | 'players' | 'leagueId'> & { leagueId?: string }; // leagueId is needed for creation
export type PlayerFormData = Omit<Player, 'id' | 'teamIds'> & { teamId?: string }; // Primary team for initial assignment
export type MatchFormData = Omit<Match, 'id' | 'status' | 'scorecardId' | 'playingTeamA' | 'playingTeamB' | 'result'>;
