import React, { useState } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Settings, X, Music } from 'lucide-react';
import { ASSETS } from '../data/hotelData';
import { GameSettings } from '../types/game';

interface TitleScreenProps {
  hasSavedGame: boolean;
  savedNight: number;
  savedMooncoins: number;
  settings: GameSettings;
  onStartNew: () => void;
  onContinue: () => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetSave: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  savedNight,
  savedMooncoins,
  settings,
  onStartNew,
  onContinue,
  onUpdateSettings,
  onResetSave,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#090d16] flex items-center">
      {/* Illustrated Hotel Exterior Backdrop */}
      <div className="absolute inset-0">
        <img
          src={ASSETS.hotelExterior}
          alt="The Midnight Hotel exterior under crescent moonlight"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/80 to-[#090d16]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-[#090d16]/50" />
      </div>

      {/* Subtle Floating Candle Dust Motes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-mote absolute left-[18%] top-[28%] h-1.5 w-1.5 rounded-full bg-amber-300/60" />
        <div className="animate-mote absolute left-[42%] top-[64%] h-1 w-1 rounded-full bg-amber-200/50" style={{ animationDelay: '1.8s' }} />
        <div className="animate-mote absolute left-[74%] top-[36%] h-1.5 w-1.5 rounded-full bg-amber-300/40" style={{ animationDelay: '3.1s' }} />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 md:px-12">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-300/85 mb-4">
            Open Midnight to Sunrise · Est. 1888
          </p>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#f6eedb] leading-[1.08] mb-5"
            style={{ textWrap: 'balance' }}
          >
            The Midnight Hotel
          </h1>

          <p className="text-base sm:text-lg text-[#cfc5b4] leading-relaxed mb-9 max-w-lg">
            Every guest has a story. Every room has a secret. Step behind the mahogany reception desk, welcome travelers from across worlds and centuries, and uncover what Madame Nocturne left behind.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {hasSavedGame ? (
              <>
                <button
                  onClick={onContinue}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-amber-500 px-6 py-3.5 text-sm font-semibold text-[#120d06] shadow-lg shadow-amber-950/40 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Continue Night {savedNight}
                </button>
                <button
                  onClick={() => setConfirmNew(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-200/20 bg-[#121826]/85 px-5 py-3.5 text-sm font-medium text-[#f3ead8] transition hover:border-amber-300/45 hover:bg-[#192235] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Start New Game
                </button>
              </>
            ) : (
              <button
                onClick={onStartNew}
                className="inline-flex items-center gap-2.5 rounded-lg bg-amber-500 px-7 py-3.5 text-sm font-semibold text-[#120d06] shadow-lg shadow-amber-950/40 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Game
              </button>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#111726]/75 px-4 py-3.5 text-sm font-medium text-[#d6cbb9] transition hover:border-white/30 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {hasSavedGame && (
            <p className="mt-5 text-xs text-[#a99e8b] font-mono-tabular">
              Saved progress · Night {savedNight} · {savedMooncoins} Mooncoins
            </p>
          )}
        </div>
      </main>

      {/* Confirm Overwrite Modal */}
      {confirmNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-amber-200/20 bg-[#131926] p-6 shadow-2xl">
            <h2 className="font-display text-xl font-semibold text-[#f6eedb] mb-2">
              Begin a Fresh Register?
            </h2>
            <p className="text-sm text-[#bfb5a2] leading-relaxed mb-6">
              Starting a new game will replace your current Night {savedNight} save file. Your previous hotel upgrades and clues will be cleared.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmNew(false)}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-[#d6cbb9] hover:bg-white/5 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmNew(false);
                  onStartNew();
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer whitespace-nowrap"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-amber-200/20 bg-[#131926] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
              <h2 className="font-display text-xl font-semibold text-[#f6eedb]">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="rounded-lg p-1.5 text-[#a99e8b] hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#f3ead8]">Eerie Soundtrack</p>
                  <p className="text-xs text-[#9c9281]">Haunted celesta & midnight rain ambiance</p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      musicEnabled: !(settings.musicEnabled ?? true),
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap ${
                    settings.musicEnabled ?? true
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-[#9c9281]'
                  }`}
                >
                  <Music className="h-4 w-4" />
                  {settings.musicEnabled ?? true ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#f3ead8]">Chime & Sound Effects</p>
                  <p className="text-xs text-[#9c9281]">Soft bellhop chimes and clock ticks</p>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap ${
                    settings.soundEnabled
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-[#9c9281]'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {settings.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#f3ead8]">Dialogue Pacing</p>
                  <p className="text-xs text-[#9c9281]">Control how quickly conversations appear</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-[#0c111b] p-1 border border-white/10">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, textSpeed: 'normal' })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
                      settings.textSpeed === 'normal'
                        ? 'bg-amber-500 text-[#120d06]'
                        : 'text-[#9c9281] hover:text-white'
                    }`}
                  >
                    Story
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, textSpeed: 'instant' })}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap ${
                      settings.textSpeed === 'instant'
                        ? 'bg-amber-500 text-[#120d06]'
                        : 'text-[#9c9281] hover:text-white'
                    }`}
                  >
                    Instant
                  </button>
                </div>
              </div>

              {hasSavedGame && (
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#9c9281]">Clear saved hotel progress</span>
                  <button
                    onClick={() => {
                      onResetSave();
                      setShowSettings(false);
                    }}
                    className="rounded-lg border border-red-400/30 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/50 cursor-pointer whitespace-nowrap"
                  >
                    Delete Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
