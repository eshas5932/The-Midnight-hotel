import React, { useState } from 'react';
import { Heart, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS, GUESTS, MYSTERY_CLUES } from '../data/hotelData';
import { GameState } from '../types/game';

interface JournalViewProps {
  gameState: GameState;
}

export const JournalView: React.FC<JournalViewProps> = ({ gameState }) => {
  const [tab, setTab] = useState<'guests' | 'mystery' | 'achievements'>('guests');

  const guestList = Object.values(GUESTS);
  const allClues = Object.values(MYSTERY_CLUES);

  return (
    <div className="rounded-2xl border border-amber-200/15 bg-[#0e1422] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#f6eedb]">
            Keeper’s Story Journal
          </h2>
          <p className="text-sm text-[#a99e8b] mt-1">
            Guest biographies, trust milestones, Madame Nocturne’s mystery clues, and hotel achievements.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'guests', label: 'Guests & Stories' },
              { id: 'mystery', label: `Mystery Clues (${gameState.unlockedClues.length})` },
              { id: 'achievements', label: `Achievements (${gameState.unlockedAchievements.length}/${ACHIEVEMENTS.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? 'bg-amber-500 text-[#120d06]'
                  : 'bg-[#161e2f] text-[#cfc5b4] hover:text-white border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'guests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guestList.map((guest) => {
            const prog = gameState.guestProgress[guest.id] ?? {
              trust: 0,
              visits: 0,
              storyCompleted: false,
            };
            const met = prog.visits > 0 || gameState.activeGuests.some((g) => g.guestId === guest.id);

            return (
              <div
                key={guest.id}
                className="rounded-xl border border-white/12 bg-[#141b2b] p-5 flex gap-4"
              >
                {met ? (
                  <img
                    src={guest.portraitUrl}
                    alt={guest.name}
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 rounded-xl object-cover border border-amber-300/35 shrink-0"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl border border-white/10 bg-[#0c111d] flex items-center justify-center shrink-0">
                    <Lock className="h-6 w-6 text-[#6f6658]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-300">
                    {met ? `${guest.species} · Visits: ${prog.visits}` : 'Unmet Visitor'}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-[#f6eedb]">
                    {met ? guest.name : 'Unknown Traveler'}
                  </h3>

                  {met ? (
                    <>
                      <p className="text-xs text-[#bfb5a2] mt-1.5 leading-relaxed">
                        {guest.backstory}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-rose-300 font-mono-tabular">
                          <Heart className="h-3.5 w-3.5" /> Trust {prog.trust}/5
                        </span>
                        <span className="text-[#8f8575]">·</span>
                        <span className="text-[#cfc5b4] truncate">
                          Needs: {guest.specialRequestText}
                        </span>
                      </div>

                      {prog.trust >= 3 && (
                        <p className="mt-2.5 rounded-lg bg-[#0d121d] border border-amber-200/15 px-3 py-2 text-xs text-amber-100/90">
                          Secret Uncovered: {guest.secret}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-[#8f8575] mt-2">
                      Grow your hotel reputation and keep hosting nights to welcome this guest.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'mystery' && (
        <div className="space-y-4">
          {gameState.unlockedClues.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#141b2b] p-6 text-sm text-[#a99e8b]">
              No clues uncovered yet. Speak with your guests at 2:00 AM, inspect the Manager’s Office, and watch the hotel at 3:13 AM.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allClues
                .filter((c) => gameState.unlockedClues.includes(c.id))
                .map((clue) => (
                  <div
                    key={clue.id}
                    className="rounded-xl border border-indigo-400/25 bg-[#141b2d] p-5 space-y-2"
                  >
                    <p className="text-xs text-indigo-300">{clue.source}</p>
                    <h3 className="font-display text-base font-semibold text-[#f6eedb]">
                      {clue.title}
                    </h3>
                    <p className="text-xs text-[#cfc5b4] leading-relaxed">{clue.content}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = gameState.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                  unlocked
                    ? 'border-amber-400/40 bg-[#172033]'
                    : 'border-white/10 bg-[#121826] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-display text-base font-semibold text-[#f6eedb]">
                      {ach.title}
                    </h3>
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-[#7c7364] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#b5aa97] leading-relaxed">{ach.description}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-3 text-xs font-mono-tabular text-amber-200">
                  <span>Reward: +{ach.rewardMooncoins} Mooncoins</span>
                  <span className="inline-flex items-center gap-1 text-indigo-200">
                    <Sparkles className="h-3 w-3" />+{ach.rewardStardust}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
