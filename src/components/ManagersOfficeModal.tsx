import React from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { MYSTERY_CLUES } from '../data/hotelData';
import { GameState } from '../types/game';

interface ManagersOfficeModalProps {
  gameState: GameState;
  onUnlockFutureRegisterClue: () => void;
  onClose: () => void;
}

export const ManagersOfficeModal: React.FC<ManagersOfficeModalProps> = ({
  gameState,
  onUnlockFutureRegisterClue,
  onClose,
}) => {
  const hasRegisterClue = gameState.unlockedClues.includes('clue-future-register');
  const nocturneClues = Object.values(MYSTERY_CLUES).filter((c) =>
    gameState.unlockedClues.includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-amber-200/20 bg-[#111725] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-xl font-semibold text-[#f6eedb]">
              Manager’s Office · Madame Nocturne’s Desk
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close office"
            className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Hotel Statistics */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-[#161e2f] p-4 text-center font-mono-tabular">
            <div>
              <p className="text-xs text-[#9c9281] font-sans">Nights Hosted</p>
              <p className="text-lg font-semibold text-[#f6eedb] mt-0.5">
                {gameState.totalNightsCompleted}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#9c9281] font-sans">Reputation</p>
              <p className="text-lg font-semibold text-emerald-300 mt-0.5">
                {gameState.reputation}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#9c9281] font-sans">Clues Discovered</p>
              <p className="text-lg font-semibold text-indigo-300 mt-0.5">
                {gameState.unlockedClues.length} / {Object.keys(MYSTERY_CLUES).length}
              </p>
            </div>
          </div>

          {/* Open Leather Guest Register */}
          <div className="rounded-xl border border-amber-200/20 bg-[#1a1614] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-amber-200">
                The Leather Guest Register · Page 12
              </h3>
              <span className="text-xs font-mono-tabular text-[#a99e8b]">Est. 1888</span>
            </div>

            <div className="space-y-2 text-xs font-mono-tabular text-[#d9ceb9] border-t border-amber-200/10 pt-3">
              <p>1914 · Lucien V. — Room 04 — Checked out before dawn</p>
              <p className="line-through opacity-60">1923 · Eleanor N. — Room 02 — Indefinite Stay</p>
              <p className="text-indigo-200">
                2096 · [Signature Smudged in Silver Ink] — Room 13 — Reservation Pending
              </p>
            </div>

            {!hasRegisterClue && (
              <button
                onClick={onUnlockFutureRegisterClue}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-400/40 px-3.5 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/30 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Record Future-Dated Entry in Journal
              </button>
            )}
          </div>

          {/* Recovered Letters & Clues */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#f3ead8]">
              Letters & Collected Records
            </h3>
            {nocturneClues.length === 0 ? (
              <p className="text-xs text-[#9c9281]">
                Madame Nocturne’s letters will appear here as you complete nights and converse with guests.
              </p>
            ) : (
              nocturneClues.map((clue) => (
                <div
                  key={clue.id}
                  className="rounded-xl border border-white/10 bg-[#161e2f] p-4"
                >
                  <p className="text-xs text-amber-300">{clue.title} · {clue.source}</p>
                  <p className="text-xs text-[#cfc5b4] mt-1 leading-relaxed">{clue.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
