import type { Race } from "@/types";

type RaceStatBarProps = {
  race: Race;
};

export function RaceStatBar({ race }: RaceStatBarProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#1E1E1E] p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0">
        <div className="flex flex-col items-center justify-center py-4 text-center sm:items-start sm:justify-center sm:py-0 sm:text-left sm:pl-0">
          <p className="font-inter text-xl font-semibold text-white sm:text-2xl lg:text-[28px] leading-tight">
            {race.prizePool}
          </p>
          <p className="font-inter text-xs text-white/60 mt-1 sm:text-sm">Prize Pool</p>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-white/10 py-4 text-center sm:items-start sm:justify-center sm:py-0 sm:pl-6 sm:text-left">
          <p className="font-inter text-xl font-semibold text-white sm:text-2xl lg:text-[28px] leading-tight">
            {race.fieldSize}
          </p>
          <p className="font-inter text-xs text-white/60 mt-1 sm:text-sm">Field Size</p>
        </div>
        <div className="flex flex-col items-center justify-center border-t border-white/10 py-4 text-center sm:border-t-0 sm:border-l sm:border-white/10 sm:items-start sm:justify-center sm:py-0 sm:pl-6 sm:text-left">
          <p className="font-inter text-xl font-semibold text-white sm:text-2xl lg:text-[28px] leading-tight">
            {race.topFavourite}
          </p>
          <p className="font-inter text-xs text-white/60 mt-1 sm:text-sm">Top Favourite</p>
        </div>
        <div className="flex flex-col items-center justify-center border-t border-l border-white/10 py-4 text-center sm:border-t-0 sm:border-l sm:border-white/10 sm:items-start sm:justify-center sm:py-0 sm:pl-6 sm:text-left">
          <p className="font-inter text-xl font-semibold text-white sm:text-2xl lg:text-[28px] leading-tight">
            {race.longshot}
          </p>
          <p className="font-inter text-xs text-white/60 mt-1 sm:text-sm">Longshot</p>
        </div>
      </div>
    </section>
  );
}
