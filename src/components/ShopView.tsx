import React, { useState } from 'react';
import { Coins, Sparkles, Check, Lock } from 'lucide-react';
import { SHOP_ITEMS } from '../data/hotelData';
import { GameState, ShopCategory, ShopItem } from '../types/game';

interface ShopViewProps {
  gameState: GameState;
  onPurchase: (item: ShopItem, targetRoomId?: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ gameState, onPurchase }) => {
  const [filter, setFilter] = useState<'all' | ShopCategory>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    gameState.rooms.find((r) => r.unlocked)?.id ?? 'room-01'
  );

  const unlockedRooms = gameState.rooms.filter((r) => r.unlocked);
  const filteredItems = SHOP_ITEMS.filter((item) =>
    filter === 'all' ? true : item.category === filter
  );

  const isWingAlreadyUnlocked = (item: ShopItem): boolean => {
    if (!item.unlocksWingId) return false;
    if (item.unlocksWingId === 'room-03') return gameState.rooms.find((r) => r.id === 'room-03')?.unlocked ?? false;
    if (item.unlocksWingId === 'room-04') return gameState.rooms.find((r) => r.id === 'room-04')?.unlocked ?? false;
    if (item.unlocksWingId === 'library') return gameState.facilities.libraryUnlocked;
    if (item.unlocksWingId === 'conservatory') return gameState.facilities.conservatoryUnlocked;
    if (item.unlocksWingId === 'room-13-seal') return gameState.facilities.room13Investigated;
    return false;
  };

  return (
    <div className="rounded-2xl border border-amber-200/15 bg-[#0e1422] p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#f6eedb]">
            Nocturne Curiosities & Hotel Catalog
          </h2>
          <p className="text-sm text-[#a99e8b] mt-1">
            Purchase supernatural furnishings, supplies, and wing restorations. Room upgrades appear inside the room immediately.
          </p>
        </div>

        {/* Target Room Selector for Fixtures/Decor */}
        <div className="flex items-center gap-2.5 shrink-0">
          <label htmlFor="room-target" className="text-xs text-[#b5aa97] whitespace-nowrap">
            Install upgrades in:
          </label>
          <select
            id="room-target"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="rounded-lg border border-amber-200/20 bg-[#161e2f] px-3 py-2 text-xs font-medium text-[#f3ead8] focus:outline-none focus:border-amber-400"
          >
            {unlockedRooms.map((r) => (
              <option key={r.id} value={r.id}>
                Room {r.number} · {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: 'all', label: 'All Catalog' },
            { id: 'fixture', label: 'Room Fixtures' },
            { id: 'decor', label: 'Supernatural Decor' },
            { id: 'supply', label: 'Supplies' },
            { id: 'wing', label: 'Hotel Expansions' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              filter === tab.id
                ? 'bg-amber-500 text-[#120d06]'
                : 'bg-[#161e2f] text-[#cfc5b4] hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const wingDone = isWingAlreadyUnlocked(item);
          const alreadyOwnedUpgrade =
            item.applyFixture && gameState.ownedDecorUpgrades.includes(item.id);
          const repLocked =
            item.requiresReputation !== undefined &&
            gameState.reputation < item.requiresReputation;
          const canAfford =
            gameState.mooncoins >= item.costMooncoins &&
            gameState.stardust >= (item.costStardust ?? 0);

          const targetRoom = unlockedRooms.find((r) => r.id === selectedRoomId);
          const installedInSelected =
            targetRoom &&
            ((item.applyFixture?.mirror && targetRoom.fixtures.mirror) ||
              (item.applyFixture?.clock && targetRoom.fixtures.clock) ||
              (item.applyFixture?.plants && targetRoom.fixtures.plants) ||
              (item.applyFixture?.floatingCandles && targetRoom.fixtures.floatingCandles) ||
              (item.applyFixture?.persianRug && targetRoom.fixtures.persianRug) ||
              (item.applyFixture?.wallpaper === 'midnight' &&
                !item.applyFixture?.plants &&
                !item.applyFixture?.curtains &&
                targetRoom.fixtures.wallpaper === 'midnight') ||
              (item.applyFixture?.curtains === 'blackout' &&
                targetRoom.fixtures.curtains === 'blackout'));

          return (
            <div
              key={item.id}
              className="rounded-xl border border-white/12 bg-[#141b2b] p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-[#9c9281] mb-1.5">
                  <span className="capitalize">{item.category}</span>
                  {item.grantsSupplyId && (
                    <span className="font-mono-tabular text-amber-200">
                      In stock: {gameState.inventory[item.grantsSupplyId] ?? 0}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-lg font-semibold text-[#f6eedb]">
                  {item.name}
                </h3>
                <p className="text-xs text-[#bfb5a2] leading-relaxed mt-1.5">
                  {item.description}
                </p>
                <p className="text-xs text-amber-200/85 mt-3">{item.effectLabel}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs font-mono-tabular">
                  <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                    <Coins className="h-3.5 w-3.5" />
                    {item.costMooncoins}
                  </span>
                  {item.costStardust && (
                    <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
                      <Sparkles className="h-3.5 w-3.5" />
                      {item.costStardust}
                    </span>
                  )}
                </div>

                {wingDone ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                    <Check className="h-4 w-4" /> Unlocked
                  </span>
                ) : repLocked ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[#9c9281]">
                    <Lock className="h-3.5 w-3.5" /> Needs Rep {item.requiresReputation}
                  </span>
                ) : alreadyOwnedUpgrade && installedInSelected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                    <Check className="h-4 w-4" /> Installed in Rm {targetRoom?.number}
                  </span>
                ) : alreadyOwnedUpgrade ? (
                  <button
                    onClick={() => onPurchase(item, selectedRoomId)}
                    className="rounded-lg border border-amber-300/40 bg-amber-500/15 px-3.5 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap"
                  >
                    Install Free in Rm {targetRoom?.number}
                  </button>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => onPurchase(item, selectedRoomId)}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 text-[#120d06] hover:bg-amber-400'
                        : 'bg-white/5 text-[#7f7667] border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    Purchase
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
