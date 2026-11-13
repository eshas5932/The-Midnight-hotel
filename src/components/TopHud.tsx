import React from 'react';
import { BookOpen, ShoppingBag, Settings, Moon, Sun, Sparkles, Coins, Award, Music } from 'lucide-react';
import { NightHour, ScreenMode } from '../types/game';

interface TopHudProps {
  screen: ScreenMode;
  night: number;
  hour: NightHour;
  mooncoins: number;
  stardust: number;
  reputation: number;
  activeTab: 'hotel' | 'journal' | 'shop' | 'office';
  onSelectTab: (tab: 'hotel' | 'journal' | 'shop' | 'office') => void;
  onOpenSettings: () => void;
  onReturnTitle: () => void;
  unreadCluesCount: number;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  screen,
  night,
  hour,
  mooncoins,
  stardust,
  reputation,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onReturnTitle,
  unreadCluesCount,
  musicEnabled,
  onToggleMusic,
}) => {
  const isAfterSunrise = screen === 'AFTER_SUNRISE';

  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/12 bg-[#0b101b]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Brand & Night Time */}
        <div className="flex items-center gap-5">
          <button
            onClick={onReturnTitle}
            className="font-display text-lg font-semibold tracking-wide text-[#f6eedb] hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            The Midnight Hotel
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#c7bca8] font-mono-tabular">
            {isAfterSunrise ? (
              <Sun className="h-3.5 w-3.5 text-amber-300" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-amber-300" />
            )}
            <span>Night {night}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-200 font-medium">
              {isAfterSunrise ? 'After Sunrise' : hour}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('hotel')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'hotel'
                ? 'bg-amber-500/15 text-amber-200 border border-amber-400/30'
                : 'text-[#c2b7a3] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Hotel View
          </button>

          <button
            onClick={() => onSelectTab('shop')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-500/15 text-amber-200 border border-amber-400/30'
                : 'text-[#c2b7a3] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Shop
          </button>

          <button
            onClick={() => onSelectTab('journal')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-amber-500/15 text-amber-200 border border-amber-400/30'
                : 'text-[#c2b7a3] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Journal{unreadCluesCount > 0 ? ` (${unreadCluesCount})` : ''}
          </button>

          <button
            onClick={() => onSelectTab('office')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'office'
                ? 'bg-amber-500/15 text-amber-200 border border-amber-400/30'
                : 'text-[#c2b7a3] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Records
          </button>
        </nav>

        {/* Resources Bar + Settings */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs sm:text-sm font-mono-tabular">
            <span className="inline-flex items-center gap-1.5 text-amber-200" title="Mooncoins">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>{mooncoins}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-indigo-200" title="Stardust">
              <Sparkles className="h-4 w-4 text-indigo-300" />
              <span>{stardust}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-200" title="Reputation">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Rep {reputation}</span>
            </span>
          </div>

          <button
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Mute eerie music' : 'Play eerie music'}
            title={musicEnabled ? 'Eerie Music: On' : 'Eerie Music: Muted'}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              musicEnabled
                ? 'border-amber-400/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                : 'border-white/10 bg-white/5 text-[#9c9281] hover:border-white/25 hover:text-white'
            }`}
          >
            <Music className="h-4 w-4" />
            <span className="hidden lg:inline">{musicEnabled ? 'Music On' : 'Muted'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#c7bca8] hover:border-white/25 hover:text-white transition cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
