import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  KeyRound,
  MessageCircle,
  Sparkles,
  BookMarked,
  Flower2,
  Bell,
  FileText,
  DoorOpen,
  Flame,
  Clock,
} from 'lucide-react';
import { ASSETS, GUESTS } from '../data/hotelData';
import { ActiveNightGuest, GameState, RoomData } from '../types/game';
import { soundFX } from '../utils/sound';

interface HotelMapProps {
  gameState: GameState;
  onClickRoom: (room: RoomData) => void;
  onClickReception: () => void;
  onClickWaitingGuest: (guestId: string) => void;
  onClickActiveGuestAction: (guest: ActiveNightGuest, action: 'request' | 'dialogue') => void;
  onClickOffice: () => void;
  onClickRoom13: () => void;
  onClickLibrary: () => void;
  onClickConservatory: () => void;
  onOpenShop: () => void;
  onHarvestConservatory?: () => void;
  onStokeHearth?: () => void;
  conservatoryHarvestedThisNight: boolean;
}

export const HotelMap: React.FC<HotelMapProps> = ({
  gameState,
  onClickRoom,
  onClickReception,
  onClickWaitingGuest,
  onClickActiveGuestAction,
  onClickOffice,
  onClickRoom13,
  onClickLibrary,
  onClickConservatory,
  onOpenShop,
  onHarvestConservatory,
  onStokeHearth,
  conservatoryHarvestedThisNight,
}) => {
  const isAfterSunrise = gameState.screen === 'AFTER_SUNRISE';
  const waitingGuests = gameState.activeGuests.filter((g) => !g.checkedIn);
  const checkedInGuests = gameState.activeGuests.filter((g) => g.checkedIn);

  return (
    <div className="relative rounded-2xl border border-amber-200/20 bg-[#0b101b] overflow-hidden shadow-2xl">
      {/* Starry Sky, Crescent Moon, Rain & Victorian Slate Roof */}
      <div
        className={`relative border-b border-amber-300/20 px-5 pt-6 pb-4 overflow-hidden transition-colors duration-700 ${
          isAfterSunrise
            ? 'bg-gradient-to-b from-[#1e2640] via-[#2b2a42] to-[#1a1f32]'
            : 'bg-gradient-to-b from-[#050811] via-[#0a1223] to-[#11192d]'
        }`}
      >
        {/* Crescent Moon & Stars */}
        {!isAfterSunrise && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute right-10 top-4 h-10 w-10 rounded-full bg-amber-100/90 shadow-[0_0_28px_rgba(253,230,138,0.45)]">
              <div className="absolute -right-1.5 -top-1 h-9 w-9 rounded-full bg-[#070d1b]" />
            </div>
            {[
              { l: '8%', t: '18%' },
              { l: '24%', t: '12%' },
              { l: '44%', t: '24%' },
              { l: '63%', t: '14%' },
              { l: '78%', t: '26%' },
            ].map((s, i) => (
              <div
                key={i}
                className="animate-mote absolute h-1 w-1 rounded-full bg-amber-100/70"
                style={{ left: s.l, top: s.t, animationDelay: `${i * 0.9}s` }}
              />
            ))}
            {[12, 26, 41, 56, 71, 86].map((left, idx) => (
              <div
                key={left}
                className="animate-rain absolute top-0 h-12 w-[1px] bg-gradient-to-b from-transparent via-sky-200/40 to-transparent"
                style={{ left: `${left}%`, animationDelay: `${idx * 0.31}s` }}
              />
            ))}
          </div>
        )}

        {/* Victorian Pitched Gables Silhouette */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-r from-[#241c1d] via-[#362728] to-[#241c1d] border-t border-amber-400/30"
          aria-hidden="true"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-4 pb-1">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-amber-300/80">
              {isAfterSunrise ? 'Daylight Sanctuary' : 'Open Midnight to Dawn'}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#f6eedb]">
              The Midnight Hotel · Cross-Section
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#d6cbb9]">
            <span>{checkedInGuests.length} Checked In</span>
            <span aria-hidden="true">·</span>
            <span>{waitingGuests.length} Waiting in Lobby</span>
          </div>
        </div>
      </div>

      {/* Building Cross-Section Interior */}
      <div className="p-4 sm:p-5 space-y-5 bg-gradient-to-b from-[#131826] via-[#101522] to-[#0d111b]">
        {/* FLOOR 3: ATTIC & MYSTERY */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium tracking-wider uppercase text-[#a99e8b]">
              Third Floor · Attic & Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Manager's Office */}
            <button
              onClick={onClickOffice}
              className="group relative text-left rounded-xl border border-amber-200/18 bg-gradient-to-br from-[#1f191b] via-[#171c2c] to-[#121725] p-4 transition hover:border-amber-400/50 cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-200 font-display text-base font-semibold">
                    <FileText className="h-4 w-4 text-amber-400" />
                    Manager’s Office
                  </div>
                  <p className="text-xs text-[#bfb5a2] leading-relaxed">
                    Madame Nocturne’s oak writing desk, historic leather guest register, and wax-sealed letters.
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-300/90 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                  Inspect →
                </span>
              </div>
            </button>

            {/* Locked Room 13 */}
            <button
              onClick={onClickRoom13}
              className={`group relative text-left rounded-xl border p-4 transition cursor-pointer overflow-hidden ${
                gameState.facilities.room13Investigated
                  ? 'border-indigo-400/45 bg-gradient-to-br from-[#191f3b] to-[#111529] hover:border-indigo-300/70'
                  : 'border-amber-200/15 bg-gradient-to-br from-[#141726] to-[#0f121e] hover:border-amber-300/45'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-display text-base font-semibold text-[#f3ead8]">
                    {gameState.facilities.room13Investigated ? (
                      <DoorOpen className="h-4 w-4 text-indigo-300" />
                    ) : (
                      <Lock className="h-4 w-4 text-amber-400/85" />
                    )}
                    Room 13 · {gameState.facilities.room13Investigated ? 'The Threshold' : 'Sealed Oak Door'}
                  </div>
                  <p className="text-xs text-[#b5aa97] leading-relaxed">
                    {gameState.facilities.room13Investigated
                      ? 'The brass padlock hangs open onto an impossible starlit terrace.'
                      : 'Tarnished brass numbers gleam softly. Faint chimes drift behind the keyhole.'}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-300/90 whitespace-nowrap">
                  {gameState.facilities.room13Investigated ? 'Enter →' : 'Examine'}
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* FLOOR 2: ILLUSTRATED MINIATURE GUEST SUITES */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium tracking-wider uppercase text-[#a99e8b]">
              Second Floor · Guest Suites
            </span>
            <span className="text-xs text-[#8f8575]">Click any room to enter & customize</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {gameState.rooms.map((room) => {
              const occupantState = gameState.activeGuests.find(
                (g) => g.checkedIn && g.roomId === room.id
              );
              const occupant = occupantState ? GUESTS[occupantState.guestId] : null;
              const needsAction =
                occupantState &&
                (!occupantState.requestCompleted || !occupantState.dialogueCompleted);

              const wallTone = {
                damask: 'from-[#281d26] to-[#18131d]',
                midnight: 'from-[#131d36] to-[#0d1426]',
                botanical: 'from-[#132920] to-[#0d1c17]',
                crimson: 'from-[#30141c] to-[#1a0d12]',
              }[room.fixtures.wallpaper];

              return (
                <motion.div
                  key={room.id}
                  layout
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => (room.unlocked ? onClickRoom(room) : onOpenShop())}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (room.unlocked) onClickRoom(room);
                      else onOpenShop();
                    }
                  }}
                  className={`group relative rounded-xl border overflow-hidden cursor-pointer flex flex-col justify-between transition ${
                    room.unlocked
                      ? occupant
                        ? 'border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                        : 'border-white/15 hover:border-amber-300/45'
                      : 'border-white/8 opacity-80 hover:border-amber-200/30'
                  }`}
                >
                  {/* Miniature Visual Room Preview Scene */}
                  <div className={`relative h-28 w-full bg-gradient-to-b ${wallTone} p-3 overflow-hidden`}>
                    {/* Wooden floor trim */}
                    <div className="absolute bottom-0 inset-x-0 h-5 bg-[#1b120e] border-t border-amber-900/50" />

                    {/* Mini Window */}
                    <div className="absolute left-3 top-3 h-14 w-10 rounded-t-full border border-amber-200/25 bg-[#081021] overflow-hidden">
                      {room.fixtures.curtains === 'blackout' ? (
                        <div className="h-full w-full bg-[#44101d]" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-b from-[#0e1f40] to-[#1b325c] relative">
                          <div className="absolute right-1.5 top-2 h-2.5 w-2.5 rounded-full bg-amber-100/80" />
                        </div>
                      )}
                    </div>

                    {/* Mini Floating Candles */}
                    {room.fixtures.floatingCandles && (
                      <div className="absolute top-2 left-16 right-4 flex justify-around">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="animate-candle h-2 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24]" />
                        ))}
                      </div>
                    )}

                    {/* Mini Mirror */}
                    {room.fixtures.mirror && (
                      <div className="absolute right-4 top-4 h-12 w-7 rounded-t-full border-2 border-amber-400/70 bg-sky-200/20" />
                    )}

                    {/* Mini Clock */}
                    {room.fixtures.clock && (
                      <div className="absolute right-14 top-5 h-12 w-5 rounded-t border border-amber-500/70 bg-[#2a1c14] flex justify-center pt-1">
                        <div className="h-3 w-3 rounded-full bg-[#f5ecd9]" />
                      </div>
                    )}

                    {/* Mini Bed */}
                    <div className="absolute bottom-3 left-16 w-20 h-6 rounded-t border border-amber-200/20 bg-[#dcd0be] overflow-hidden">
                      <div
                        className={`absolute inset-y-0 right-0 w-12 ${
                          room.fixtures.bed === 'velvet' ? 'bg-[#6e192b]' : 'bg-[#2a3b4e]'
                        }`}
                      />
                    </div>

                    {/* Mini Plant */}
                    {room.fixtures.plants && (
                      <div className="absolute bottom-4 left-12 h-5 w-3 rounded-t-full bg-emerald-400/80" />
                    )}

                    {/* Live Guest Sprite inside the room */}
                    {occupant && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
                        transition={{ y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
                        className="absolute bottom-2 right-3"
                      >
                        <img
                          src={occupant.portraitUrl}
                          alt={occupant.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-full object-cover border-2 border-amber-300/70 shadow-lg"
                        />
                      </motion.div>
                    )}

                    {/* Room number overlay tag */}
                    <span className="absolute top-2 right-2.5 font-mono-tabular text-[11px] font-semibold text-amber-200/90 bg-[#090d16]/75 px-1.5 py-0.5 rounded">
                      Rm {room.number}
                    </span>
                  </div>

                  {/* Room Metadata & Quick Action Footer */}
                  <div className="bg-[#141a29] p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-sm font-semibold text-[#f6eedb] truncate">
                          {room.name}
                        </h3>
                        {!room.unlocked ? (
                          <Lock className="h-3.5 w-3.5 text-[#8f8575] shrink-0" />
                        ) : occupant ? (
                          <span className="text-[11px] font-medium text-emerald-300 shrink-0">
                            {occupant.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9c9281] shrink-0">Vacant</span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#9c9281] mt-1 truncate">
                        {!room.unlocked
                          ? `Unlock in Shop (${room.unlockCost} Mooncoins)`
                          : [
                              room.fixtures.mirror ? 'Mirror' : null,
                              room.fixtures.curtains === 'blackout' ? 'Blackout' : null,
                              room.fixtures.clock ? 'Clock' : null,
                              room.fixtures.plants ? 'Plants' : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Standard Victorian'}
                      </p>
                    </div>

                    {room.unlocked && occupant && occupantState ? (
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/10">
                        <span className="text-[11px] text-amber-200/85 truncate">
                          {needsAction ? 'Needs attention' : 'Settled'}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {!occupantState.requestCompleted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClickActiveGuestAction(occupantState, 'request');
                              }}
                              title="Fulfill Guest Request"
                              className="rounded-md bg-amber-500/20 border border-amber-400/45 px-2 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/35 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" /> Request
                            </button>
                          )}
                          {!occupantState.dialogueCompleted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClickActiveGuestAction(occupantState, 'dialogue');
                              }}
                              title="Talk to Guest"
                              className="rounded-md bg-sky-500/20 border border-sky-400/45 px-2 py-1 text-[11px] font-medium text-sky-200 hover:bg-sky-500/35 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="h-3 w-3" /> Talk
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300/85">
                        <span>{room.unlocked ? 'Open room interior' : 'Unlock in Shop'}</span>
                        <span>→</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FLOOR 1: ILLUSTRATED GRAND LOBBY, RECEPTION, HEARTH & WINGS */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium tracking-wider uppercase text-[#a99e8b]">
              Ground Floor · Grand Lobby & Reception
            </span>
          </div>

          <div className="rounded-xl border border-amber-200/20 bg-gradient-to-b from-[#1a1623] via-[#17131d] to-[#120e15] p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Reception Desk with Mr. Whiskers & Clickable Bell */}
              <div className="lg:col-span-4 rounded-xl border border-amber-400/25 bg-gradient-to-br from-[#261a18] to-[#161219] p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <motion.img
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    src={ASSETS.mrWhiskers}
                    alt="Mr. Whiskers, Night Manager"
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-xl object-cover border border-amber-300/45 shrink-0 shadow-lg"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-[#f6eedb]">
                      Reception Desk
                    </p>
                    <p className="text-xs text-[#cfc5b4] mt-0.5">
                      Mr. Whiskers minds the brass key rack and ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/10">
                  <button
                    onClick={() => {
                      soundFX.playBell();
                      onClickReception();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 transition cursor-pointer whitespace-nowrap"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {waitingGuests.length > 0
                      ? `Check In (${waitingGuests.length})`
                      : 'Ring Desk Bell'}
                  </button>
                </div>
              </div>

              {/* Center Grand Lobby Hearth, Clock & Waiting Guests */}
              <div className="lg:col-span-5 rounded-xl border border-amber-200/15 bg-gradient-to-b from-[#1e1722] to-[#151118] p-4 flex flex-col justify-between relative overflow-hidden">
                {/* Burgundy Lobby Runner Accent */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFX.playChime();
                        onStokeHearth?.();
                      }}
                      title="Warm the lobby hearth"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200 hover:bg-amber-500/20 cursor-pointer"
                    >
                      <Flame className="h-3.5 w-3.5 text-amber-400 animate-candle" />
                      Hearth
                    </button>
                    <span className="font-display text-sm font-semibold text-[#f6eedb]">
                      Grand Lobby
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-mono-tabular text-amber-200/90">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isAfterSunrise ? 'Sunrise' : gameState.hour}</span>
                  </div>
                </div>

                {/* Animated Waiting Guests in Lobby */}
                <AnimatePresence mode="popLayout">
                  {waitingGuests.length > 0 ? (
                    <div className="space-y-2">
                      {waitingGuests.map((wg) => {
                        const guest = GUESTS[wg.guestId];
                        return (
                          <motion.button
                            key={wg.guestId}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => onClickWaitingGuest(wg.guestId)}
                            className="w-full flex items-center justify-between gap-3 rounded-xl border border-amber-300/35 bg-[#241c28]/90 px-3 py-2.5 text-left hover:border-amber-300/75 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <motion.img
                                animate={{ y: guest.species === 'Ghost' ? [0, -3, 0] : [0, -1.5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                src={guest.portraitUrl}
                                alt={guest.name}
                                referrerPolicy="no-referrer"
                                className="h-10 w-10 rounded-full object-cover border border-amber-300/45 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#f6eedb] truncate">
                                  {guest.name} · {guest.species}
                                </p>
                                <p className="text-[11px] text-amber-200/90 truncate">
                                  “{guest.specialRequestText}”
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 whitespace-nowrap shrink-0">
                              <KeyRound className="h-3.5 w-3.5" /> Assign
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[#a99e8b] leading-relaxed py-3"
                    >
                      {isAfterSunrise
                        ? 'Golden dawn filters gently across the velvet armchairs. Ready your suites for midnight.'
                        : 'Rain taps softly against the leaded lobby glass while amber candlelight dances over the burgundy rug.'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Library & Conservatory Side Wings */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <button
                  onClick={gameState.facilities.libraryUnlocked ? onClickLibrary : onOpenShop}
                  className={`text-left rounded-xl border p-3.5 transition cursor-pointer flex items-center justify-between gap-3 flex-1 ${
                    gameState.facilities.libraryUnlocked
                      ? 'border-amber-200/25 bg-[#192030] hover:border-amber-300/55'
                      : 'border-white/10 bg-[#131722] opacity-85 hover:border-amber-200/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookMarked className="h-5 w-5 text-amber-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#f3ead8]">
                        Midnight Library
                      </p>
                      <p className="text-[11px] text-[#a59a87] truncate">
                        {gameState.facilities.libraryUnlocked
                          ? 'Search archives for clues'
                          : 'Locked · 95 Mooncoins'}
                      </p>
                    </div>
                  </div>
                  {!gameState.facilities.libraryUnlocked && (
                    <Lock className="h-4 w-4 text-[#8c8270] shrink-0" />
                  )}
                </button>

                <div
                  className={`rounded-xl border p-3.5 flex items-center justify-between gap-2.5 flex-1 ${
                    gameState.facilities.conservatoryUnlocked
                      ? 'border-emerald-400/30 bg-[#122021]'
                      : 'border-white/10 bg-[#131722] opacity-85'
                  }`}
                >
                  <button
                    onClick={
                      gameState.facilities.conservatoryUnlocked ? onClickConservatory : onOpenShop
                    }
                    className="flex items-center gap-3 min-w-0 text-left flex-1 cursor-pointer"
                  >
                    <Flower2 className="h-5 w-5 text-emerald-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#f3ead8]">
                        Conservatory
                      </p>
                      <p className="text-[11px] text-[#a59a87] truncate">
                        {gameState.facilities.conservatoryUnlocked
                          ? conservatoryHarvestedThisNight
                            ? 'Ferns watered tonight'
                            : 'Gather Stardust Dew (+1)'
                          : 'Locked · 130 Mooncoins'}
                      </p>
                    </div>
                  </button>

                  {gameState.facilities.conservatoryUnlocked &&
                  !conservatoryHarvestedThisNight &&
                  onHarvestConservatory ? (
                    <button
                      onClick={onHarvestConservatory}
                      className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-500/35 cursor-pointer whitespace-nowrap"
                    >
                      Gather
                    </button>
                  ) : !gameState.facilities.conservatoryUnlocked ? (
                    <Lock className="h-4 w-4 text-[#8c8270] shrink-0" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
