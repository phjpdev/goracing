export type Race = {
  id: string;
  raceNumber: number;
  name: string;
  venue: string;
  time: string;
  distance: string;
  going: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  prizePool: string;
  fieldSize: string;
  topFavourite: string;
  longshot: string;
};

export type RacecardRow = {
  rank: number;
  horse: string;
  age: string;
  sire: string;
  jockey: string;
  trainer: string;
  turf: string;
  speed: number;
  class: number;
  winPct: string;
  betStatus: "Accepting" | "Closed";
};
