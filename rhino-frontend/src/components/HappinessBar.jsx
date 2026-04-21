import { useContract } from "../hooks/useContract";
import { TIER_INFO, TIER_IMAGES } from "../constants/contract";

export default function HappinessBar() {
  const { happinessTier, tierProgress } = useContract();
  const progress = tierProgress();
  const currentTierInfo = TIER_INFO[happinessTier];
  const nextTierInfo = happinessTier < 4 ? TIER_INFO[happinessTier + 1] : null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="tag">Happiness Tier {happinessTier}</span>
          <p className="text-stone-700 font-black text-lg mt-1">{currentTierInfo.name}</p>
        </div>
        {nextTierInfo ? (
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-stone-400 text-xs mb-1">Next tier</p>
              <p className="text-stone-600 text-sm font-semibold">{nextTierInfo.mood}</p>
            </div>
            <img src={TIER_IMAGES[happinessTier + 1]} alt={nextTierInfo.name} className="w-10 h-10 rounded-xl object-cover opacity-50 grayscale" />
          </div>
        ) : (
          <span className="text-conservation text-sm font-bold">MAX TIER 🌿</span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress.pct}%`, background: `linear-gradient(90deg, ${currentTierInfo.color}, ${nextTierInfo?.color || currentTierInfo.color})` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-stone-400">
          <span>{progress.current} buys</span>
          {happinessTier < 4 ? (
            <span>{progress.target - progress.current} more to reach <span className="text-ochre font-bold">{TIER_INFO[happinessTier + 1].mood}</span></span>
          ) : (
            <span className="text-conservation font-bold">Rhino population thriving 🦏</span>
          )}
          {happinessTier < 4 && <span>{progress.target} buys</span>}
        </div>
      </div>
      <div className="flex gap-1.5 mt-4">
        {TIER_INFO.map((t, i) => (
          <div key={i} className="flex-1 h-2 rounded-full transition-all duration-500" style={{ background: i <= happinessTier ? t.color : 'rgba(0,0,0,0.08)' }} />
        ))}
      </div>
    </div>
  );
}