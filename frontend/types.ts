export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

export interface DayStatus {
  day: string;
  completed: boolean;
  active?: boolean;
}