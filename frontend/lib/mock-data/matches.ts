import type { LeaderboardRow, Match, OddsRow } from "@/types";

export const MOCK_MATCHES: Match[] = [
  {
    id: "1",
    name: "New Alley",
    frontRunnerBias: "Detected",
    class: "Class III",
    track: "1200 Turf",
    trackCondition: "Good",
    duration: "14:20",
  },
  { id: "2", name: "Match 2", frontRunnerBias: "—", class: "Class II", track: "1000 Dirt", trackCondition: "Good", duration: "14:45" },
  { id: "3", name: "Match 3", frontRunnerBias: "—", class: "Class III", track: "1400 Turf", trackCondition: "Yielding", duration: "15:10" },
  { id: "4", name: "Match 4", frontRunnerBias: "—", class: "Class I", track: "1600 All-Weather", trackCondition: "Good", duration: "15:35" },
];

export const MOCK_LEADERBOARD: LeaderboardRow[] = [
  { position: 1, horse: "Horse 3", highlight: "Gold Highlight", winRate: "32%" },
  { position: 2, horse: "Horse 3", highlight: "Gold Highlight", winRate: "32%" },
  { position: 3, horse: "Horse 3", highlight: "Gold Highlight", winRate: "32%" },
  { position: 4, horse: "Horse 3", highlight: "Gold Highlight", winRate: "32%" },
];

export const MOCK_ODDS: OddsRow[] = [
  { horse: "#Hamper89", odds: "4.5", trend: "down", ai: "32%", speed: "91", ev: "+18%" },
  { horse: "#Rambo89", odds: "4.5", trend: "up", ai: "21%", speed: "4.84", ev: "-9%" },
  { horse: "#Rambo89", odds: "4.5", trend: "up", ai: "21%", speed: "4.84", ev: "-9%" },
  { horse: "#Peter89", odds: "4.5", trend: "up", ai: "15%", speed: "80", ev: "+4%" },
];
