import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, MessageCircle, Brush, Check } from 'lucide-react';
import { GUESTS, SHOP_ITEMS } from '../data/hotelData';
import { ActiveNightGuest, RoomData, ShopItem } from '../types/game';
import { evaluateRoomCompatibility, formatTag, getEffectiveRoomTags } from '../utils/compatibility';

interface RoomInteriorViewProps {
  room: RoomData;
  occupantState?: ActiveNightGuest;
  ownedUpgrades: string[];
  onClose: () => void;
  onCleanRoom: (roomId: string) => void;
  onEquipUpgrade: (roomId: string, item: ShopItem) => void;
  onLaunchRequest: (guest: ActiveNightGuest) => void;
  onLaunchDialogue: (guest: ActiveNightGuest) => void;
}

export const RoomInteriorView: React.FC<RoomInteriorViewProps> = ({
  room,
  occupantState,
  ownedUpgrades,
  onClose,
  onCleanRoom,
  onEquipUpgrade,
  onLaunchRequest,
  onLaunchDialogue,
}) => {
  const guest = occupantState ? GUESTS[occupantState.guestId] : null;
  const tags = getEffectiveRoomTags(room);
  const compatibility = guest ? evaluateRoomCompatibility(guest, room) : null;

  const wallpaperBg = {
    damask: 'from-[#231a24] via-[#1c1621] to-[#14111b]',
    midnight: 'from-[#10182b] via-[#131e36] to-[#0c1322]',
    botanical: 'from-[#10241d] via-[#142a22] to-[#0c1a16]',
    crimson: 'from-[#2a1219] via-[#221017] to-[#150b10]',
  }[room.fixtures.wallpaper];

  const equippableItems = SHOP_ITEMS.filter(
    (item) => ownedUpgrades.includes(item.id) && item.applyFixture
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-amber-200/20 bg-[#111725] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-mono-tabular text-amber-300">Room {room.number}</p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#f6eedb]">
              {room.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close room view"
            className="rounded-lg p-2 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {/* Illustrated Interactive Room Canvas */}
          <div
            className={`relative h-64 sm:h-72 w-full rounded-xl border border-amber-200/15 bg-gradient-to-b ${wallpaperBg} overflow-hidden`}
          >
            {/* Wallpaper Subtle Damask/Pattern Lines */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,220,160,0.25) 0px, rgba(255,220,160,0.25) 1px, transparent 1px, transparent 36px)',
              }}
            />

            {/* Wooden Wainscoting & Floor */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-[#1c1310] border-t border-amber-900/60" />
            <div className="absolute bottom-20 inset-x-0 h-10 bg-[#251a15]/70 border-t border-amber-200/10" />

            {/* Floating Candles */}
            {room.fixtures.floatingCandles && (
              <div className="absolute top-5 inset-x-12 flex justify-around pointer-events-none">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="animate-candle flex flex-col items-center" style={{ animationDelay: `${idx * 0.4}s` }}>
                    <div className="h-3 w-2 rounded-full bg-amber-300 blur-[1px] shadow-[0_0_14px_#fbbf24]" />
                    <div className="h-5 w-1.5 rounded-sm bg-[#f5ead6]" />
                  </div>
                ))}
              </div>
            )}

            {/* Window & Curtains */}
            <div className="absolute left-8 top-8 h-36 w-28 rounded-t-full border-2 border-amber-200/25 bg-[#091224] overflow-hidden shadow-inner">
              {/* Moonlight or Blackout */}
              {room.fixtures.curtains === 'blackout' ? (
                <div className="h-full w-full bg-[#380d17]" />
              ) : (
                <div className="relative h-full w-full bg-gradient-to-b from-[#0e1e3d] to-[#1a2f52]">
                  <div className="absolute right-4 top-4 h-7 w-7 rounded-full bg-amber-100/80 shadow-[0_0_20px_rgba(254,243,199,0.5)]" />
                  <div className="absolute inset-0 border-r border-b border-amber-200/20 w-1/2 h-full" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-amber-200/20" />
                </div>
              )}

              {/* Side Curtains */}
              <div
                className={`absolute inset-y-0 left-0 w-6 ${
                  room.fixtures.curtains === 'blackout'
                    ? 'bg-[#4c101e]'
                    : room.fixtures.curtains === 'emerald'
                    ? 'bg-[#123d2d]'
                    : 'bg-[#d8d0c5]/25'
                }`}
              />
              <div
                className={`absolute inset-y-0 right-0 w-6 ${
                  room.fixtures.curtains === 'blackout'
                    ? 'bg-[#4c101e]'
                    : room.fixtures.curtains === 'emerald'
                    ? 'bg-[#123d2d]'
                    : 'bg-[#d8d0c5]/25'
                }`}
              />
            </div>

            {/* Antique Mirror (if equipped) */}
            {room.fixtures.mirror && (
              <div className="absolute right-12 top-10 h-32 w-20 rounded-t-full border-4 border-amber-400/70 bg-gradient-to-br from-slate-200/35 via-sky-200/15 to-slate-800/60 shadow-[0_0_20px_rgba(147,197,253,0.2)] flex items-center justify-center">
                <div className="h-24 w-12 rounded-t-full border border-white/20 bg-gradient-to-tr from-transparent via-white/15 to-transparent" />
              </div>
            )}

            {/* Brass Pendulum Clock (if equipped) */}
            {room.fixtures.clock && (
              <div className="absolute right-40 top-12 h-32 w-14 rounded-t-lg border-2 border-amber-600/70 bg-[#2a1c14] flex flex-col items-center pt-2 shadow-lg">
                <div className="h-9 w-9 rounded-full border border-amber-300/70 bg-[#f6eedb] flex items-center justify-center text-[9px] font-bold text-[#2a1c14]">
                  XII
                </div>
                <div className="mt-2 h-14 w-8 bg-[#160f0b] border border-amber-700/40 flex justify-center pt-1 overflow-hidden">
                  <motion.div
                    animate={{ rotate: [-14, 14, -14] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-9 w-0.5 bg-amber-400 origin-top flex flex-col items-center justify-end"
                  >
                    <div className="h-2 w-2 rounded-full bg-amber-300 -mb-1" />
                  </motion.div>
                </div>
              </div>
            )}

            {/* Persian Rug */}
            {room.fixtures.persianRug && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-8 w-80 rounded-sm border-2 border-amber-400/40 bg-gradient-to-r from-[#5a1a24] via-[#7c2432] to-[#5a1a24] opacity-90" />
            )}

            {/* Victorian Bed */}
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-56 h-24">
              {/* Headboard */}
              <div
                className={`mx-auto w-48 h-16 rounded-t-xl border-2 ${
                  room.fixtures.bed === 'velvet'
                    ? 'border-amber-400/60 bg-[#3a1220]'
                    : room.fixtures.bed === 'canopy'
                    ? 'border-amber-500/60 bg-[#2b1a14]'
                    : 'border-amber-700/60 bg-[#2d211b]'
                }`}
              />
              {/* Mattress & Blanket */}
              <div className="w-56 h-11 -mt-3 rounded-lg border border-amber-200/20 bg-[#e6dccb] relative overflow-hidden shadow-xl">
                <div
                  className={`absolute inset-y-0 right-0 w-36 ${
                    room.fixtures.bed === 'velvet'
                      ? 'bg-[#6d192b]'
                      : room.fixtures.bed === 'canopy'
                      ? 'bg-[#1c354b]'
                      : 'bg-[#46362c]'
                  }`}
                />
                <div className="absolute left-3 top-2 h-5 w-11 rounded bg-white/85" />
              </div>
            </div>

            {/* Potted Moonferns */}
            {room.fixtures.plants && (
              <div className="absolute bottom-10 left-40 flex items-end gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex gap-0.5 -mb-1">
                    <div className="h-7 w-2.5 rounded-full bg-emerald-400/80 -rotate-12 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                    <div className="h-9 w-2.5 rounded-full bg-emerald-300/90" />
                    <div className="h-7 w-2.5 rounded-full bg-emerald-400/80 rotate-12" />
                  </div>
                  <div className="h-5 w-6 rounded-b-md bg-amber-700 border border-amber-500/50" />
                </div>
              </div>
            )}

            {/* Guest Inside Room */}
            {guest && (
              <div className="absolute bottom-4 right-5 flex items-center gap-3 rounded-xl border border-amber-200/25 bg-[#0e1422]/90 px-3.5 py-2 backdrop-blur-sm">
                <img
                  src={guest.portraitUrl}
                  alt={guest.name}
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-full object-cover border border-amber-300/45"
                />
                <div>
                  <p className="text-xs font-semibold text-[#f6eedb]">{guest.name}</p>
                  <p className="text-[11px] text-amber-200/85">
                    {compatibility?.label} · {guest.species}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Room Details & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[#f3ead8] mb-2">Room Traits & Condition</h3>
              <p className="text-xs text-[#b5aa97] leading-relaxed mb-3">{room.description}</p>
              <div className="text-xs text-[#cfc5b4] space-y-1.5">
                <p>
                  <span className="text-[#9c9281]">Features:</span>{' '}
                  {tags.map(formatTag).join(' · ')}
                </p>
                <p className="font-mono-tabular">
                  <span className="text-[#9c9281] font-sans">Tidiness:</span> {room.cleanliness}%
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {room.cleanliness < 100 && (
                  <button
                    onClick={() => onCleanRoom(room.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Brush className="h-3.5 w-3.5" />
                    Tidy Room (+Tidiness)
                  </button>
                )}

                {occupantState && !occupantState.requestCompleted && (
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchRequest(occupantState);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Fulfill Guest Request
                  </button>
                )}

                {occupantState && !occupantState.dialogueCompleted && (
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchDialogue(occupantState);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/35 bg-sky-500/15 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/25 cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Talk to {guest?.name}
                  </button>
                )}
              </div>
            </div>

            {/* Apply Purchased Furnishings */}
            <div>
              <h3 className="text-sm font-semibold text-[#f3ead8] mb-2">
                Customize With Purchased Furnishings
              </h3>
              {equippableItems.length === 0 ? (
                <p className="text-xs text-[#9c9281] leading-relaxed">
                  Visit the Shop to purchase gilded mirrors, blackout velvet drapes, brass pendulum clocks, or glowing moonferns to transform this suite visually.
                </p>
              ) : (
                <div className="space-y-2">
                  {equippableItems.map((item) => {
                    const alreadyApplied =
                      (item.applyFixture?.mirror && room.fixtures.mirror) ||
                      (item.applyFixture?.clock && room.fixtures.clock) ||
                      (item.applyFixture?.plants && room.fixtures.plants) ||
                      (item.applyFixture?.floatingCandles && room.fixtures.floatingCandles) ||
                      (item.applyFixture?.persianRug && room.fixtures.persianRug) ||
                      (item.applyFixture?.wallpaper === 'midnight' &&
                        !item.applyFixture?.plants &&
                        !item.applyFixture?.curtains &&
                        room.fixtures.wallpaper === 'midnight') ||
                      (item.applyFixture?.curtains === 'blackout' &&
                        room.fixtures.curtains === 'blackout');

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#171f31] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#f3ead8] truncate">{item.name}</p>
                          <p className="text-[11px] text-[#9c9281] truncate">{item.effectLabel}</p>
                        </div>
                        <button
                          disabled={Boolean(alreadyApplied)}
                          onClick={() => onEquipUpgrade(room.id, item)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                            alreadyApplied
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 cursor-default'
                              : 'bg-amber-500 text-[#120d06] hover:bg-amber-400'
                          }`}
                        >
                          {alreadyApplied ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> Installed
                            </span>
                          ) : (
                            'Install'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
