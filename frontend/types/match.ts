export type Match = {
  id: string;
  name: string;
  frontRunnerBias: string;
  class: string;
  track: string;
  trackCondition: string;
  duration: string;
};

export type LeaderboardRow = {
  position: number;
  horse: string;
  highlight: string;
  winRate: string;
};

export type OddsRow = {
  horse: string;
  odds: string;
  trend: "up" | "down";
  ai: string;
  speed: string;
  ev: string;
};
