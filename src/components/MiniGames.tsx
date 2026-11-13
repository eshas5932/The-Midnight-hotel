import React, { useState } from 'react';
import { X, Sparkles, RotateCw, CheckCircle2, Search, Brush, Flame, Droplets } from 'lucide-react';
import { GUESTS } from '../data/hotelData';
import { GuestRequest } from '../types/game';
import { soundFX } from '../utils/sound';

interface MiniGameModalProps {
  guestId: string;
  request: GuestRequest;
  hasHandMirror: boolean;
  roomHasMirror: boolean;
  onComplete: () => void;
  onClose: () => void;
  onBuyMirrorQuick?: () => boolean;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  guestId,
  request,
  hasHandMirror,
  roomHasMirror,
  onComplete,
  onClose,
  onBuyMirrorQuick,
}) => {
  const guest = GUESTS[guestId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-200/20 bg-[#111725] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={guest.portraitUrl}
              alt={guest.name}
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover border border-amber-300/35"
            />
            <div>
              <p className="text-xs text-amber-300">{guest.name}’s Request</p>
              <h2 className="font-display text-lg font-semibold text-[#f6eedb]">
                {request.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close request"
            className="rounded-lg p-1.5 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[#cfc5b4] leading-relaxed mb-6">
            {request.description}
          </p>

          {request.miniGame === 'POTION' && (
            <PotionMixerGame onSuccess={onComplete} />
          )}

          {request.miniGame === 'CLOCK' && (
            <ClockRepairGame onSuccess={onComplete} />
          )}

          {request.miniGame === 'MEMORY' && (
            <MemorySearchGame onSuccess={onComplete} />
          )}

          {request.miniGame === 'ROOM_PREP' && (
            <RoomPrepGame
              guestId={guestId}
              needsMirror={request.requiredItemId === 'antique-mirror'}
              mirrorReady={hasHandMirror || roomHasMirror}
              onBuyMirrorQuick={onBuyMirrorQuick}
              onSuccess={onComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* 1. THE POTION REQUEST (Ordered Mixing Mini-Game) */
const POTION_RECIPE = ['rosehip', 'blackberry', 'dew'];
const INGREDIENTS = [
  { id: 'rosehip', name: 'Crimson Rosehip', note: 'First: warm ruby base', color: 'bg-rose-700 border-rose-400/50' },
  { id: 'dew', name: 'Midnight Dew', note: 'Third: chill shimmer finish', color: 'bg-indigo-800 border-indigo-400/50' },
  { id: 'ash', name: 'Silver Wormwood', note: 'Avoid: too bitter for Lucien', color: 'bg-slate-700 border-slate-400/40' },
  { id: 'blackberry', name: 'Pressed Blackberry', note: 'Second: velvet body', color: 'bg-purple-800 border-purple-400/50' },
];

const PotionMixerGame: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [added, setAdded] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleAdd = (id: string) => {
    if (done) return;
    const nextIdx = added.length;
    if (POTION_RECIPE[nextIdx] === id) {
      soundFX.playChime();
      const next = [...added, id];
      setAdded(next);
      setErrorMsg(null);
      if (next.length === POTION_RECIPE.length) {
        setDone(true);
      }
    } else {
      soundFX.playError();
      setAdded([]);
      setErrorMsg('The mixture fizzles gray! Pour again in exact order: Rosehip → Blackberry → Midnight Dew.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-[#161e2f] p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-amber-300">Crystal Goblet Progress</p>
          <p className="text-sm text-[#f3ead8] mt-1 font-mono-tabular">
            {added.length} / 3 layers poured
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className={`h-8 w-8 rounded-full border ${
                added[slot]
                  ? 'bg-gradient-to-br from-rose-500 to-purple-800 border-amber-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'bg-[#0b101b] border-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-xs text-rose-300">{errorMsg}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INGREDIENTS.map((ing) => (
          <button
            key={ing.id}
            disabled={done || added.includes(ing.id)}
            onClick={() => handleAdd(ing.id)}
            className={`rounded-xl border p-3.5 text-left transition cursor-pointer disabled:opacity-50 ${ing.color} hover:brightness-110`}
          >
            <p className="text-sm font-semibold text-white">{ing.name}</p>
            <p className="text-xs text-white/75 mt-0.5">{ing.note}</p>
          </button>
        ))}
      </div>

      {done && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/35 bg-emerald-950/30 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> Crimson Nightcap perfected!
          </span>
          <button
            onClick={onSuccess}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
          >
            Serve Lucien
          </button>
        </div>
      )}
    </div>
  );
};

/* 2. THE BROKEN CLOCK (Gear Calibration Puzzle) */
const ROMAN = ['XII', 'III', 'VI', 'IX'];

const ClockRepairGame: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  // Indices into ROMAN (0 = XII). Goal: [0, 0, 0]
  const [dials, setDials] = useState<[number, number, number]>([1, 2, 3]);
  const isSolved = dials[0] === 0 && dials[1] === 0 && dials[2] === 0;

  const rotateDial = (idx: 0 | 1 | 2) => {
    if (isSolved) return;
    soundFX.playClockTick();
    setDials((prev) => {
      const next: [number, number, number] = [...prev] as [number, number, number];
      next[idx] = (next[idx] + 1) % 4;
      // Gear coupling: rotating center also nudges right dial
      if (idx === 1) {
        next[2] = (next[2] + 1) % 4;
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-[#a99e8b]">
        Click each brass dial to turn it clockwise by 3 hours until all three point to <strong className="text-amber-300">XII</strong>. Note: the Center Gear also nudges the Right Gear!
      </p>

      <div className="grid grid-cols-3 gap-4">
        {(['Left Gear', 'Center Gear', 'Right Gear'] as const).map((label, idx) => {
          const val = dials[idx];
          const aligned = val === 0;
          return (
            <button
              key={label}
              onClick={() => rotateDial(idx as 0 | 1 | 2)}
              className={`rounded-xl border p-4 flex flex-col items-center gap-3 transition cursor-pointer ${
                aligned
                  ? 'border-emerald-400/50 bg-emerald-950/25'
                  : 'border-amber-300/25 bg-[#161e2f] hover:border-amber-300/60'
              }`}
            >
              <span className="text-xs text-[#cfc5b4]">{label}</span>
              <div className="relative h-20 w-20 rounded-full border-2 border-amber-400/60 bg-[#0c111d] flex items-center justify-center shadow-inner">
                <span className="font-display text-lg font-bold text-amber-200">
                  {ROMAN[val]}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                <RotateCw className="h-3 w-3" /> Turn
              </span>
            </button>
          );
        })}
      </div>

      {isSolved && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-400/35 bg-emerald-950/30 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> All chronometer rings locked to XII!
          </span>
          <button
            onClick={onSuccess}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
          >
            Calibrate for Milo
          </button>
        </div>
      )}
    </div>
  );
};

/* 3. FIND THE MISSING MEMORY (Curiosity Shelf Search) */
const SHELF_SPOTS = [
  { id: 'tea', label: 'Porcelain Tea Tin', found: false, hint: 'Only dried jasmine leaves and an 1899 receipt.' },
  { id: 'hatbox', label: 'Velvet Hatbox', found: false, hint: 'Contains mothballs and an empty brass thimble.' },
  { id: 'folio', label: 'Leather Ledger Folio', found: true, hint: 'Inside the back pocket rests a faded velvet ribbon monogrammed "E.N."!' },
  { id: 'compass', label: 'Cracked Pocket Compass', found: false, hint: 'The needle spins endlessly toward Room 13.' },
];

const MemorySearchGame: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [checked, setChecked] = useState<string[]>([]);
  const [lastHint, setLastHint] = useState<string>('Inspect the parlor shelves to locate Eleanor’s missing keepsake.');
  const foundIt = checked.includes('folio');

  const inspectSpot = (spot: (typeof SHELF_SPOTS)[number]) => {
    if (!checked.includes(spot.id)) {
      setChecked((prev) => [...prev, spot.id]);
    }
    setLastHint(spot.hint);
    if (spot.found) soundFX.playMystery();
    else soundFX.playClockTick();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#161e2f] p-4 text-sm text-[#e7decb]">
        {lastHint}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SHELF_SPOTS.map((spot) => {
          const isChecked = checked.includes(spot.id);
          return (
            <button
              key={spot.id}
              onClick={() => inspectSpot(spot)}
              className={`rounded-xl border p-3.5 text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                isChecked && spot.found
                  ? 'border-emerald-400/55 bg-emerald-950/30'
                  : isChecked
                  ? 'border-white/10 bg-[#121826] opacity-70'
                  : 'border-amber-200/20 bg-[#172033] hover:border-amber-300/55'
              }`}
            >
              <span className="text-sm font-medium text-[#f3ead8]">{spot.label}</span>
              <Search className="h-4 w-4 text-amber-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {foundIt && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onSuccess}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Deliver Keepsake to Eleanor
          </button>
        </div>
      )}
    </div>
  );
};

/* 4. ROOM PREPARATION MINI-GAME (Mirror Delivery / Moss Nest Prep) */
const RoomPrepGame: React.FC<{
  guestId: string;
  needsMirror: boolean;
  mirrorReady: boolean;
  onBuyMirrorQuick?: () => boolean;
  onSuccess: () => void;
}> = ({ guestId, needsMirror, mirrorReady, onBuyMirrorQuick, onSuccess }) => {
  const [steps, setSteps] = useState({ dusted: false, lit: false, placed: false });
  const allDone = steps.dusted && steps.lit && steps.placed;

  const toggleStep = (key: keyof typeof steps) => {
    if (key === 'placed' && needsMirror && !mirrorReady) {
      soundFX.playError();
      return;
    }
    soundFX.playChime();
    setSteps((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="space-y-4">
      {needsMirror && !mirrorReady && (
        <div className="rounded-xl border border-amber-400/35 bg-amber-950/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-amber-100 leading-relaxed">
            You don’t have a mirror in this room or reception inventory yet. Purchase the Silver Hand Mirror (30 Mooncoins) to fulfill Eleanor’s request.
          </p>
          {onBuyMirrorQuick && (
            <button
              onClick={() => {
                if (onBuyMirrorQuick()) {
                  soundFX.playCoin();
                }
              }}
              className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buy Hand Mirror (30)
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => toggleStep('dusted')}
          className={`rounded-xl border p-4 text-left space-y-2 transition cursor-pointer ${
            steps.dusted
              ? 'border-emerald-400/50 bg-emerald-950/25'
              : 'border-white/15 bg-[#161e2f] hover:border-amber-300/50'
          }`}
        >
          <Brush className="h-5 w-5 text-amber-300" />
          <p className="text-sm font-medium text-[#f3ead8]">
            {guestId === 'mallow' ? 'Mist the Ferns' : 'Sweep Cobwebs'}
          </p>
          <p className="text-xs text-[#9c9281]">{steps.dusted ? 'Complete' : 'Click to tidy'}</p>
        </button>

        <button
          onClick={() => toggleStep('lit')}
          className={`rounded-xl border p-4 text-left space-y-2 transition cursor-pointer ${
            steps.lit
              ? 'border-emerald-400/50 bg-emerald-950/25'
              : 'border-white/15 bg-[#161e2f] hover:border-amber-300/50'
          }`}
        >
          <Flame className="h-5 w-5 text-amber-400" />
          <p className="text-sm font-medium text-[#f3ead8]">Light Bedside Lamp</p>
          <p className="text-xs text-[#9c9281]">{steps.lit ? 'Lit warmly' : 'Click to light'}</p>
        </button>

        <button
          onClick={() => toggleStep('placed')}
          className={`rounded-xl border p-4 text-left space-y-2 transition cursor-pointer ${
            steps.placed
              ? 'border-emerald-400/50 bg-emerald-950/25'
              : needsMirror && !mirrorReady
              ? 'border-white/10 bg-[#121723] opacity-60'
              : 'border-white/15 bg-[#161e2f] hover:border-amber-300/50'
          }`}
        >
          <Droplets className="h-5 w-5 text-sky-300" />
          <p className="text-sm font-medium text-[#f3ead8]">
            {needsMirror ? 'Place Silver Mirror' : 'Fluff Moss Cushion'}
          </p>
          <p className="text-xs text-[#9c9281]">
            {steps.placed
              ? 'Placed carefully'
              : needsMirror && !mirrorReady
              ? 'Needs mirror first'
              : 'Click to place'}
          </p>
        </button>
      </div>

      {allDone && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onSuccess}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Room Request
          </button>
        </div>
      )}
    </div>
  );
};
