import React, { useState } from 'react';
import { X, Lock, DoorOpen, BookMarked, Sparkles } from 'lucide-react';
import { NightEvent } from '../types/game';

interface NightEventModalProps {
  event: NightEvent;
  onChoose: (choiceId: string) => { outcome: string; clueTitle?: string };
  onClose: () => void;
}

export const NightEventModal: React.FC<NightEventModalProps> = ({
  event,
  onChoose,
  onClose,
}) => {
  const [result, setResult] = useState<{ outcome: string; clueTitle?: string } | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-indigo-300/25 bg-[#111728] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono-tabular text-indigo-300">3:00 AM · Unexpected Event</p>
            <h2 className="font-display text-xl font-semibold text-[#f6eedb] mt-1">
              {event.title}
            </h2>
          </div>
          {result && (
            <button
              onClick={onClose}
              aria-label="Close event"
              className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-[#d6cbb9] leading-relaxed">{event.description}</p>

        {!result ? (
          <div className="space-y-2.5 pt-1">
            {event.choices.map((c) => (
              <button
                key={c.id}
                onClick={() => setResult(onChoose(c.id))}
                className="w-full text-left rounded-xl border border-white/12 bg-[#171f33] px-4 py-3 text-sm text-[#f3ead8] hover:border-amber-300/55 hover:bg-[#1e2840] transition cursor-pointer"
              >
                {c.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-300/25 bg-[#161e30] p-4 text-sm text-amber-100 leading-relaxed">
              {result.outcome}
              {result.clueTitle && (
                <p className="mt-2 text-xs text-indigo-300">
                  Journal Clue Unlocked: {result.clueTitle}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
              >
                Continue Night
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface Room13ModalProps {
  unlocked: boolean;
  reputation: number;
  cluesCount: number;
  onOpenShop: () => void;
  onClose: () => void;
}

export const Room13Modal: React.FC<Room13ModalProps> = ({
  unlocked,
  reputation,
  cluesCount,
  onOpenShop,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-indigo-300/30 bg-[#101524] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            {unlocked ? (
              <DoorOpen className="h-5 w-5 text-indigo-300" />
            ) : (
              <Lock className="h-5 w-5 text-amber-400" />
            )}
            <h2 className="font-display text-xl font-semibold text-[#f6eedb]">
              Room 13 · {unlocked ? 'The Nexus Between Hours' : 'The Brass Padlock'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Room 13 view"
            className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {unlocked ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-400/25 bg-gradient-to-b from-[#161c36] to-[#0f1324] p-5 space-y-3">
              <p className="text-sm text-[#e7decb] leading-relaxed">
                As the tarnished brass key turns, Room 13 opens not onto a bedroom—but onto a quiet, star-drenched terrace overlooking rain-washed rooftops from a dozen different centuries at once.
              </p>
              <p className="text-sm text-indigo-200 leading-relaxed">
                On a velvet writing table sits Madame Nocturne’s silver pocket watch, stopped at 3:13, beside a note addressed to you:
              </p>
              <p className="text-xs italic text-amber-200 border-t border-white/10 pt-3">
                “Keep the hearth lit between midnight and dawn. As long as travelers from yesterday and tomorrow have a warm bed here, the threshold stays balanced. — Aunt Nocturne”
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
              >
                Keep the Threshold Open
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#cfc5b4] leading-relaxed">
              The oak door feels unusually cool to the touch. Through the keyhole, you glimpse faint blue starlight—even though the attic roof sits directly overhead.
            </p>
            <div className="rounded-xl border border-white/10 bg-[#151c2e] p-4 text-xs text-[#b5aa97] space-y-1.5 font-mono-tabular">
              <p>Current Reputation: {reputation} / 15 required</p>
              <p>Story Clues Found: {cluesCount}</p>
              <p className="font-sans text-amber-200/90 pt-1">
                Reach Reputation 15 and purchase the Room 13 Observation Key in the Shop (200 Mooncoins · 5 Stardust) to unseal this room.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-[#cfc5b4] hover:bg-white/5 cursor-pointer"
              >
                Step Back
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
              >
                View in Shop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LibraryModalProps {
  unlockedClues: string[];
  onUnlockClue: (clueId: string) => void;
  onClose: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  unlockedClues,
  onUnlockClue,
  onClose,
}) => {
  const archiveUnlocked = unlockedClues.includes('clue-time-bridge');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-amber-200/20 bg-[#111725] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <BookMarked className="h-5 w-5 text-amber-300" />
            <h2 className="font-display text-xl font-semibold text-[#f6eedb]">
              The Midnight Library
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close library"
            className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-[#cfc5b4] leading-relaxed">
          Floor-to-ceiling mahogany shelves hold brass astrolabes, dried lavender, and leather-bound city maps from eras that haven’t happened yet.
        </p>

        {!archiveUnlocked ? (
          <div className="rounded-xl border border-amber-300/25 bg-[#161e30] p-4 space-y-3">
            <p className="text-xs text-[#e7decb]">
              A velvet-bound almanac on the reading table is bookmarked at “Architectural Thresholds Between Centuries.”
            </p>
            <button
              onClick={() => onUnlockClue('clue-time-bridge')}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Study the Almanac (+Clue)
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-4 text-xs text-emerald-200">
            You’ve already cataloged the architectural almanac into your Story Journal. Check back as new guests share memories.
          </div>
        )}
      </div>
    </div>
  );
};
