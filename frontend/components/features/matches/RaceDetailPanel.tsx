import Image from "next/image";
import type { HKJCRace } from "@/types/race-meeting";

const RACE_HORSE = "/assets/race-horse.png";
const RACE_VECTOR = "/assets/race-vector.png";
const RACE_BAR1 = "/assets/Vector-1.png";
const RACE_BAR2 = "/assets/Vector-2.png";
const RACE_BAR3 = "/assets/Vector-3.png";
const RACE_BAR4 = "/assets/Vector-4.png";

const POSITION_STYLES: Record<number, string> = {
  1: "bg-[#F7A83B] text-white",
  2: "bg-[#28E88E] text-white",
  3: "bg-[#3B82F6] text-white",
  4: "bg-[#8B5CF6] text-white",
};

const HORSE_BOX_LEFT_OFFSET: Record<number, string> = {
  1: "lg:-ml-20",
  2: "lg:-ml-12",
  3: "lg:-ml-8",
  4: "lg:-ml-20",
};

type RaceDetailPanelProps = {
  race: HKJCRace | null;
};

export function RaceDetailPanel({ race }: RaceDetailPanelProps) {
  if (!race) {
    return (
      <article className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5 lg:p-6 shadow-xl min-w-0 flex items-center justify-center min-h-[300px]">
        <p className="text-white/40 text-sm">Select a race to view details</p>
      </article>
    );
  }

  // Pick top 4 runners by lowest odds (favourites first)
  const sorted = [...(race.runners ?? [])]
    .filter((r) => r.status !== "Scratched")
    .sort((a, b) => {
      const ao = parseFloat(a.winOdds) || 999;
      const bo = parseFloat(b.winOdds) || 999;
      return ao - bo;
    })
    .slice(0, 4);

  return (
    <article className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5 lg:p-6 shadow-xl min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0">
            <Image src={RACE_HORSE} alt="" width={40} height={40} className="object-contain h-9 w-9 sm:h-10 sm:w-10" />
          </div>
          <div className="min-w-0">
            <h2 className="font-inter text-base sm:text-lg font-bold text-white truncate">
              {race.raceName_en || `Race ${race.no}`}
            </h2>
            <p className="font-inter text-xs sm:text-sm text-white/60 mt-0.5">
              Race {race.no} · {race.distance}m · {race.raceClass_en}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="font-inter text-xs text-white/50">
            {race.raceCourse?.description_en} · {race.raceTrack?.description_en}
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-0 items-center">
        <div>
          <Image src={RACE_VECTOR} alt="Race track" width={260} height={450} />
          <div className="absolute top-[60px] left-[60px] hidden min-[1600px]:block pointer-events-none">
            <Image src={RACE_BAR1} alt="" width={70} height={20} className="object-contain" />
          </div>
          <div className="absolute top-[145px] left-[130px] hidden min-[1600px]:block pointer-events-none">
            <Image src={RACE_BAR2} alt="" width={30} height={20} className="object-contain" />
          </div>
          <div className="absolute top-[230px] left-[150px] hidden min-[1600px]:block pointer-events-none">
            <Image src={RACE_BAR3} alt="" width={30} height={20} className="object-contain" />
          </div>
          <div className="absolute top-[315px] left-[100px] hidden min-[1600px]:block pointer-events-none">
            <Image src={RACE_BAR4} alt="" width={30} height={20} className="object-contain" />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 py-2 sm:py-3 lg:py-4 min-w-0">
          {sorted.length === 0 ? (
            <p className="text-white/40 text-xs">No runner data</p>
          ) : (
            sorted.map((runner, idx) => (
              <div
                key={runner.id}
                className={`w-[250px] rounded-lg sm:rounded-xl bg-[#1e1e1e] p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border border-white/5 min-w-0 ${HORSE_BOX_LEFT_OFFSET[idx + 1] ?? ""}`}
              >
                <div className="flex items-center justify-between gap-2 sm:gap-[10px]">
                  <span
                    className={`inline-flex h-6 sm:h-[28px] min-w-[26px] sm:min-w-[30px] shrink-0 items-center justify-center rounded-[8px] py-1.5 sm:py-2 px-2 sm:px-2.5 font-inter text-[11px] sm:text-xs font-medium ${POSITION_STYLES[idx + 1]}`}
                  >
                    {runner.no}
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
                    <span className="font-sans font-medium text-[14px] sm:text-[16px] leading-[1.3] text-white truncate">
                      {runner.name_en}
                    </span>
                    <p className="font-inter font-normal text-[11px] sm:text-[12px] leading-[1.3] text-[#FFFFFF80] whitespace-nowrap truncate">
                      {runner.jockey.name_en}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-inter font-light text-[11px] sm:text-[12px] leading-[1.4] text-[#B3B3B3]">
                      Odds
                    </p>
                    <p className="font-inter font-medium text-[12px] sm:text-[14px] leading-[1.5] text-[#28E88E]">
                      {runner.winOdds || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
