export type HKJCJockey = {
  code: string;
  name_en: string;
  name_ch?: string;
};

export type HKJCTrainer = {
  code: string;
  name_en: string;
  name_ch?: string;
};

export type HKJCRunner = {
  id: string;
  no: string;
  status: string;
  name_en: string;
  name_ch: string;
  barrierDrawNumber: string;
  handicapWeight: string;
  currentRating: string;
  last6run: string;
  winOdds: string;
  gearInfo: string;
  jockey: HKJCJockey;
  trainer: HKJCTrainer;
};

export type HKJCRace = {
  id: string;
  no: number;
  status: string;
  raceName_en: string;
  raceName_ch: string;
  postTime: string;
  distance: number;
  wageringFieldSize: number;
  go_en: string;
  go_ch?: string;
  ratingType: string;
  raceTrack: { description_en: string; description_ch?: string };
  raceCourse: { description_en: string; description_ch?: string; displayCode: string };
  raceClass_en: string;
  raceClass_ch?: string;
  runners: HKJCRunner[];
};

export type HKJCMeeting = {
  id: string;
  status: string;
  venueCode: string;
  date: string;
  totalNumberOfRace: number;
  currentNumberOfRace: number;
  meetingType: string;
  races: HKJCRace[];
};
