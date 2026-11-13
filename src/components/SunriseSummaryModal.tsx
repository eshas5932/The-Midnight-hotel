import React from 'react';
import { Star, Coins, Sparkles, Award, Sun } from 'lucide-react';
import { CheckoutReview } from '../types/game';

interface SunriseSummaryModalProps {
  night: number;
  reviews: CheckoutReview[];
  newlyUnlockedClueTitle?: string | null;
  onContinueToSunrisePrep: () => void;
}

export const SunriseSummaryModal: React.FC<SunriseSummaryModalProps> = ({
  night,
  reviews,
  newlyUnlockedClueTitle,
  onContinueToSunrisePrep,
}) => {
  const totalCoins = reviews.reduce((sum, r) => sum + r.mooncoinsEarned, 0);
  const totalStardust = reviews.reduce((sum, r) => sum + r.stardustEarned, 0);
  const totalRep = reviews.reduce((sum, r) => sum + r.reputationEarned, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-amber-300/25 bg-[#111725] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="border-b border-white/10 bg-gradient-to-r from-[#1a1f31] to-[#231922] px-6 py-5">
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Sun className="h-4 w-4" />
            <span>5:00 AM · Dawn Checkout</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#f6eedb]">
            Night {night} Summary & Guest Reviews
          </h2>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Totals Strip */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-amber-200/15 bg-[#161e2f] p-4 font-mono-tabular">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-[#9c9281] font-sans">Earned</p>
                <p className="text-base font-semibold text-amber-200">+{totalCoins} Mooncoins</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-xs text-[#9c9281] font-sans">Collected</p>
                <p className="text-base font-semibold text-indigo-200">+{totalStardust} Stardust</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-[#9c9281] font-sans">Standing</p>
                <p className="text-base font-semibold text-emerald-200">+{totalRep} Reputation</p>
              </div>
            </div>
          </div>

          {/* Guest Review Cards */}
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.guestId}
                className="rounded-xl border border-white/10 bg-[#151c2d] p-4 flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={rev.portraitUrl}
                  alt={rev.guestName}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-xl object-cover border border-amber-300/30 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#f6eedb]">
                        {rev.guestName}
                      </h3>
                      <p className="text-xs text-[#9c9281]">
                        {rev.species} · Stayed in {rev.roomName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1" aria-label={`${rev.stars} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= rev.stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-[#49433a]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#d6cbb9] italic mt-2 leading-relaxed">
                    “{rev.quote}”
                  </p>
                </div>
              </div>
            ))}
          </div>

          {newlyUnlockedClueTitle && (
            <div className="rounded-xl border border-indigo-400/35 bg-indigo-950/35 p-4 text-xs text-indigo-100">
              <strong className="text-indigo-200">Dawn Discovery:</strong> {newlyUnlockedClueTitle} has appeared in the Manager’s Office and your Story Journal!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onContinueToSunrisePrep}
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-[#120d06] hover:bg-amber-400 transition cursor-pointer"
            >
              Continue to Sunrise Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
