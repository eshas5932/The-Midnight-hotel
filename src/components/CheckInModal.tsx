import React from 'react';
import { X, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ASSETS, GUESTS } from '../data/hotelData';
import { ActiveNightGuest, GuestNightProgress, RoomData } from '../types/game';
import { evaluateRoomCompatibility, formatTag, getEffectiveRoomTags } from '../utils/compatibility';

interface CheckInModalProps {
  waitingGuests: ActiveNightGuest[];
  rooms: RoomData[];
  guestProgress: Record<string, GuestNightProgress>;
  selectedGuestId: string | null;
  onSelectGuest: (guestId: string) => void;
  onAssignRoom: (guestId: string, roomId: string) => void;
  onClose: () => void;
  night: number;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  waitingGuests,
  rooms,
  guestProgress,
  selectedGuestId,
  onSelectGuest,
  onAssignRoom,
  onClose,
  night,
}) => {
  const activeSelectionId =
    selectedGuestId && waitingGuests.some((g) => g.guestId === selectedGuestId)
      ? selectedGuestId
      : waitingGuests[0]?.guestId ?? null;

  const currentGuest = activeSelectionId ? GUESTS[activeSelectionId] : null;
  const availableRooms = rooms.filter((r) => r.unlocked && !r.assignedGuestId);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-amber-200/20 bg-[#111725] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.mrWhiskers}
              alt="Mr. Whiskers"
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-lg object-cover border border-amber-300/35"
            />
            <div>
              <h2 className="font-display text-xl font-semibold text-[#f6eedb]">
                Reception Desk · Guest Check-In
              </h2>
              <p className="text-xs text-[#b5aa97]">
                {waitingGuests.length > 0
                  ? 'Match each traveler to a room that suits their nature.'
                  : 'All arriving guests for tonight have received their keys.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reception desk"
            className="rounded-lg p-2 text-[#b8ae9c] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {waitingGuests.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#161e2f] p-6 flex flex-col sm:flex-row items-center gap-5">
              <img
                src={ASSETS.mrWhiskers}
                alt="Mr. Whiskers"
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-xl object-cover border border-amber-300/35 shrink-0"
              />
              <div>
                <p className="font-display text-lg font-semibold text-[#f6eedb] mb-1">
                  Mr. Whiskers, Night Manager
                </p>
                <p className="text-sm text-[#cfc5b4] leading-relaxed">
                  {night === 1
                    ? '“Splendid work checking Eleanor in! Visit her room or check the Shop if she needs a mirror, then advance the night clock when you are ready.”'
                    : '“The brass bell sits silent for now. Tend to your guests upstairs, listen to their stories at 2:00 AM, and watch the lobby clock around 3:13.”'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Waiting Queue & Selected Guest Bio */}
              <div className="lg:col-span-5 space-y-4">
                {waitingGuests.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {waitingGuests.map((wg) => {
                      const g = GUESTS[wg.guestId];
                      const active = wg.guestId === activeSelectionId;
                      return (
                        <button
                          key={wg.guestId}
                          onClick={() => onSelectGuest(wg.guestId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                            active
                              ? 'bg-amber-500 text-[#120d06]'
                              : 'bg-[#192133] text-[#cfc5b4] hover:text-white border border-white/10'
                          }`}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentGuest && (
                  <div className="rounded-xl border border-amber-200/15 bg-[#161e2f] p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={currentGuest.portraitUrl}
                        alt={currentGuest.name}
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-xl object-cover border border-amber-300/35 shrink-0"
                      />
                      <div>
                        <p className="text-xs font-medium text-amber-300">
                          {currentGuest.species} · Trust {guestProgress[currentGuest.id]?.trust ?? 0}/5
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[#f6eedb]">
                          {currentGuest.name}
                        </h3>
                        <p className="text-xs text-[#a99e8b]">{currentGuest.title}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#cfc5b4] leading-relaxed mb-4">
                      {currentGuest.backstory}
                    </p>

                    <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                      <p className="text-[#f3ead8]">
                        <span className="text-[#9c9281]">Special Request:</span>{' '}
                        {currentGuest.specialRequestText}
                      </p>
                      <p className="text-emerald-300/90">
                        <span className="text-[#9c9281]">Prefers:</span>{' '}
                        {currentGuest.preferredTags.map(formatTag).join(' · ')}
                      </p>
                      {currentGuest.dislikedTags.length > 0 && (
                        <p className="text-rose-300/90">
                          <span className="text-[#9c9281]">Dislikes:</span>{' '}
                          {currentGuest.dislikedTags.map(formatTag).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Selection List */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-sm font-semibold text-[#f3ead8]">
                  Available Guest Rooms ({availableRooms.length})
                </h3>

                {availableRooms.length === 0 ? (
                  <div className="rounded-xl border border-rose-400/25 bg-rose-950/20 p-5 text-sm text-rose-200">
                    All unlocked rooms are currently occupied. Unlock additional suites in the Shop after sunrise.
                  </div>
                ) : (
                  availableRooms.map((room) => {
                    const compat = currentGuest
                      ? evaluateRoomCompatibility(currentGuest, room)
                      : null;
                    const tags = getEffectiveRoomTags(room);

                    return (
                      <div
                        key={room.id}
                        className="rounded-xl border border-white/12 bg-[#161e2f] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-300/40 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-tabular text-xs font-semibold text-amber-300">
                              Room {room.number}
                            </span>
                            <span className="font-display text-base font-semibold text-[#f6eedb]">
                              {room.name}
                            </span>
                          </div>

                          <p className="text-xs text-[#a59a87]">
                            {tags.map(formatTag).join(' · ')}
                          </p>

                          {compat && (
                            <div className="flex items-center gap-1.5 text-xs pt-1">
                              {compat.score >= 1 ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : compat.score < 0 ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                              ) : null}
                              <span
                                className={
                                  compat.score >= 2
                                    ? 'text-emerald-300 font-medium'
                                    : compat.score === 1
                                    ? 'text-amber-200 font-medium'
                                    : compat.score < 0
                                    ? 'text-rose-300 font-medium'
                                    : 'text-[#bfb5a2]'
                                }
                              >
                                {compat.label}
                              </span>
                              {compat.notes[0] && (
                                <span className="text-[#8f8575]">· {compat.notes[0]}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {currentGuest && (
                          <button
                            onClick={() => onAssignRoom(currentGuest.id, room.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-[#120d06] hover:bg-amber-400 transition whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Assign Room {room.number}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
