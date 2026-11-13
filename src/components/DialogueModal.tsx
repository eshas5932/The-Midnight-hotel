import React, { useState } from 'react';
import { X, Heart, Sparkles, BookOpen, Check } from 'lucide-react';
import { GUESTS, MYSTERY_CLUES } from '../data/hotelData';
import { DialogueChoice, GuestNightProgress } from '../types/game';

interface DialogueModalProps {
  guestId: string;
  progress: GuestNightProgress;
  onSelectChoice: (guestId: string, choice: DialogueChoice) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  guestId,
  progress,
  onSelectChoice,
  onClose,
}) => {
  const guest = GUESTS[guestId];
  const stageIndex = Math.min(
    Math.floor(progress.trust / 2),
    guest.dialogueStages.length - 1
  );
  const stage = guest.dialogueStages[stageIndex];

  const [chosen, setChosen] = useState<DialogueChoice | null>(null);

  const handlePick = (choice: DialogueChoice) => {
    setChosen(choice);
    onSelectChoice(guestId, choice);
  };

  const unlockedClue = chosen?.clueUnlockedId ? MYSTERY_CLUES[chosen.clueUnlockedId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-amber-200/20 bg-[#111725] shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-tabular text-amber-300">
              {stage.timePrompt}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close conversation"
            className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Guest Portrait & Trust */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={guest.portraitUrl}
              alt={guest.name}
              referrerPolicy="no-referrer"
              className="h-24 w-24 rounded-2xl object-cover border border-amber-300/35 shrink-0 shadow-lg"
            />
            <div className="flex-1">
              <p className="text-xs text-[#a99e8b]">
                {guest.species} · {guest.title}
              </p>
              <h2 className="font-display text-2xl font-semibold text-[#f6eedb] mt-0.5">
                {guest.name}
              </h2>

              {/* Trust Meter */}
              <div className="mt-3 max-w-xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="inline-flex items-center gap-1.5 text-amber-200">
                    <Heart className="h-3.5 w-3.5 text-rose-400" />
                    Trust Level
                  </span>
                  <span className="font-mono-tabular text-[#d6cbb9]">
                    {Math.min(5, progress.trust + (chosen ? chosen.trustDelta : 0))} / 5
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#090d16] overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-300"
                    style={{
                      width: `${
                        (Math.min(5, progress.trust + (chosen ? chosen.trustDelta : 0)) / 5) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Story Dialogue Box */}
          <div className="rounded-xl border border-amber-200/15 bg-[#161e30] p-5">
            <p className="text-base text-[#f3ead8] leading-relaxed">
              {chosen ? chosen.response : stage.openingLine}
            </p>

            {chosen && (
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-emerald-300 font-medium">{chosen.moodNote}</span>
                {chosen.trustDelta > 0 && (
                  <span className="text-rose-300 font-mono-tabular">
                    +{chosen.trustDelta} Trust
                  </span>
                )}
                {chosen.stardustReward && (
                  <span className="inline-flex items-center gap-1 text-indigo-200 font-mono-tabular">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-300" />+{chosen.stardustReward} Stardust
                  </span>
                )}
                {chosen.mooncoinReward && (
                  <span className="text-amber-200 font-mono-tabular">
                    +{chosen.mooncoinReward} Mooncoins
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Clue Unlocked Banner */}
          {unlockedClue && (
            <div className="rounded-xl border border-indigo-400/30 bg-indigo-950/35 p-4 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-200">
                  Story Clue Added to Journal: {unlockedClue.title}
                </p>
                <p className="text-xs text-[#cfc5b4] mt-1 leading-relaxed">
                  {unlockedClue.content}
                </p>
              </div>
            </div>
          )}

          {/* Choices or Continue */}
          {!chosen ? (
            <div className="space-y-2.5">
              <p className="text-xs text-[#9c9281]">Choose your response:</p>
              {stage.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handlePick(choice)}
                  className="w-full text-left rounded-xl border border-white/12 bg-[#161e2f] px-4 py-3.5 text-sm text-[#f3ead8] transition hover:border-amber-400/55 hover:bg-[#1c263b] cursor-pointer"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Return to Hotel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
