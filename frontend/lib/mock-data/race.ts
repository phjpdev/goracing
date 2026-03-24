import type { Race, RacecardRow } from "@/types";

export const MOCK_RACE: Race = {
  id: "1",
  raceNumber: 1,
  name: "Opening Sprint",
  venue: "Royal Axcot",
  time: "02:00 PM",
  distance: "1200m",
  going: "Firm",
  status: "UPCOMING",
  prizePool: "$150,000",
  fieldSize: "6 Horses",
  topFavourite: "2.8",
  longshot: "15.0",
};

export const MOCK_RACECARD: RacecardRow[] = [
  {
    rank: 1,
    horse: "Golden Arrow",
    age: "5yo",
    sire: "Dubwai",
    jockey: "J. Smith",
    trainer: "T. Brown",
    turf: "Course B",
    speed: 97,
    class: 92,
    winPct: "32.2%",
    betStatus: "Closed",
  },
  {
    rank: 2,
    horse: "Silver Bolt",
    age: "4yo",
    sire: "Frankel",
    jockey: "A. Jones",
    trainer: "R. Wilson",
    turf: "Course B",
    speed: 95,
    class: 90,
    winPct: "28.1%",
    betStatus: "Accepting",
  },
  {
    rank: 3,
    horse: "Storm Runner",
    age: "6yo",
    sire: "Galileo",
    jockey: "M. Davis",
    trainer: "K. Evans",
    turf: "Course A",
    speed: 93,
    class: 88,
    winPct: "24.5%",
    betStatus: "Accepting",
  },
  {
    rank: 4,
    horse: "Thunder Strike",
    age: "5yo",
    sire: "Sea The Stars",
    jockey: "C. Lee",
    trainer: "P. Clark",
    turf: "Course B",
    speed: 91,
    class: 86,
    winPct: "18.2%",
    betStatus: "Accepting",
  },
  {
    rank: 5,
    horse: "Wind Dancer",
    age: "4yo",
    sire: "Kingman",
    jockey: "L. Taylor",
    trainer: "S. Moore",
    turf: "Course A",
    speed: 89,
    class: 84,
    winPct: "12.0%",
    betStatus: "Accepting",
  },
  {
    rank: 6,
    horse: "Night Shadow",
    age: "5yo",
    sire: "Camelot",
    jockey: "D. Wright",
    trainer: "N. Harris",
    turf: "Course B",
    speed: 87,
    class: 82,
    winPct: "8.5%",
    betStatus: "Accepting",
  },
];

/** Radar chart axes: Surface, Speed, Class, Distance, Form (values 0–100) */
export const PEDIGREE_VALUES = [85, 92, 78, 88, 82];
export const RADAR_LABELS = ["Surface", "Speed", "Class", "Distance", "Form"];

/** Donut segment percentages for AI Win Probability (other horses) */
export const DONUT_SEGMENTS = [25, 20, 15, 10];
export const WIN_PCT = 35.2;
