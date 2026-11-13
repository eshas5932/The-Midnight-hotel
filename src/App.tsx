import { useEffect, useState } from 'react';
import {
  Clock,
  ArrowRight,
  Moon,
  Sparkles,
  MessageCircle,
  KeyRound,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  ASSETS,
  createInitialGameState,
  GUESTS,
  MYSTERY_CLUES,
  NIGHT_EVENTS,
  NIGHT_HOURS,
} from './data/hotelData';
import {
  ActiveNightGuest,
  CheckoutReview,
  DialogueChoice,
  GameSettings,
  GameState,
  RoomData,
  ShopItem,
} from './types/game';
import { evaluateRoomCompatibility } from './utils/compatibility';
import { soundFX } from './utils/sound';
import { TitleScreen } from './components/TitleScreen';
import { TopHud } from './components/TopHud';
import { HotelMap } from './components/HotelMap';
import { RoomInteriorView } from './components/RoomInteriorView';
import { CheckInModal } from './components/CheckInModal';
import { DialogueModal } from './components/DialogueModal';
import { MiniGameModal } from './components/MiniGames';
import { ShopView } from './components/ShopView';
import { JournalView } from './components/JournalView';
import { ManagersOfficeModal } from './components/ManagersOfficeModal';
import { SunriseSummaryModal } from './components/SunriseSummaryModal';
import { LibraryModal, NightEventModal, Room13Modal } from './components/NightEventModal';

const SAVE_KEY = 'midnight_hotel_save_v1';

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed.night !== 'number' || !Array.isArray(parsed.rooms)) {
      return null;
    }
    return {
      ...parsed,
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        musicEnabled: parsed.settings?.musicEnabled ?? true,
        textSpeed: parsed.settings?.textSpeed ?? 'normal',
      },
    };
  } catch {
    return null;
  }
}

function getScheduledNightRoster(night: number, unlockedRoomCount: number): { guestId: string; requestId: string }[] {
  if (night === 1) {
    return [
      { guestId: 'eleanor', requestId: 'eleanor-mirror' },
      { guestId: 'lucien', requestId: 'lucien-potion' },
      { guestId: 'milo', requestId: 'milo-clock' },
    ];
  }

  const pool: { guestId: string; requestId: string }[] = [
    { guestId: 'lucien', requestId: 'lucien-potion' },
    { guestId: 'milo', requestId: 'milo-clock' },
    { guestId: 'eleanor', requestId: night >= 2 ? 'eleanor-memory' : 'eleanor-mirror' },
    { guestId: 'mallow', requestId: 'mallow-prep' },
  ];

  const count = Math.min(unlockedRoomCount, 3);
  const offset = (night - 2) % pool.length;
  const chosen: { guestId: string; requestId: string }[] = [];

  for (let i = 0; i < count; i++) {
    chosen.push(pool[(offset + i) % pool.length]);
  }
  return chosen;
}

function generateGuestsForNight(night: number, unlockedRoomCount: number): ActiveNightGuest[] {
  const roster = getScheduledNightRoster(night, unlockedRoomCount);
  const first = roster[0];
  if (!first) return [];
  return [
    {
      guestId: first.guestId,
      roomId: null,
      checkedIn: false,
      requestCompleted: false,
      requestId: first.requestId,
      dialogueCompleted: false,
      satisfactionBonus: 0,
    },
  ];
}

function getNextDynamicGuest(state: GameState, targetHour: GameState['hour']): ActiveNightGuest | null {
  const unlockedCount = state.rooms.filter((r) => r.unlocked).length;
  const roster = getScheduledNightRoster(state.night, unlockedCount);
  const slotIndex = targetHour === '12:15 AM' ? 1 : targetHour === '1:00 AM' ? 2 : -1;
  if (slotIndex < 0 || slotIndex >= roster.length) return null;

  const candidate = roster[slotIndex];
  if (state.activeGuests.some((g) => g.guestId === candidate.guestId)) return null;

  return {
    guestId: candidate.guestId,
    roomId: null,
    checkedIn: false,
    requestCompleted: false,
    requestId: candidate.requestId,
    dialogueCompleted: false,
    satisfactionBonus: 0,
  };
}

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState<GameState | null>(() => loadSavedState());
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());

  // UI Sub-views & Modals
  const [activeTab, setActiveTab] = useState<'hotel' | 'journal' | 'shop' | 'office'>('hotel');
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedWaitingGuestId, setSelectedWaitingGuestId] = useState<string | null>(null);
  const [activeDialogueGuestId, setActiveDialogueGuestId] = useState<string | null>(null);
  const [activeRequestGuest, setActiveRequestGuest] = useState<ActiveNightGuest | null>(null);
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showRoom13Modal, setShowRoom13Modal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMrWhiskersIntro, setShowMrWhiskersIntro] = useState(false);
  const [conservatoryHarvested, setConservatoryHarvested] = useState(false);
  const [newlyUnlockedClueTitle, setNewlyUnlockedClueTitle] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync audio & eerie music settings
  useEffect(() => {
    soundFX.setEnabled(gameState.settings.soundEnabled);
  }, [gameState.settings.soundEnabled]);

  useEffect(() => {
    if (gameState.screen === 'TITLE_MENU') {
      soundFX.stopMusic();
      return;
    }
    soundFX.setMusicEnabled(gameState.settings.musicEnabled ?? true);
  }, [gameState.screen, gameState.settings.musicEnabled]);

  // Dynamic soundtrack mood shifts based on hour and mystery state
  useEffect(() => {
    if (gameState.screen === 'AFTER_SUNRISE' || gameState.screen === 'SUNRISE_SUMMARY') {
      soundFX.setMusicMood('sunrise');
    } else if (gameState.hour === '3:00 AM' || showRoom13Modal || showOfficeModal) {
      soundFX.setMusicMood('mystery');
    } else {
      soundFX.setMusicMood('midnight');
    }
  }, [gameState.screen, gameState.hour, showRoom13Modal, showOfficeModal]);

  // Persist to LocalStorage whenever active game changes
  useEffect(() => {
    if (gameState.screen !== 'TITLE_MENU') {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
        setSavedSnapshot(gameState);
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [gameState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4200);
  };

  // Achievement checker helper
  const evaluateAchievements = (state: GameState): GameState => {
    const newUnlocks: string[] = [];
    let bonusCoins = 0;
    let bonusStardust = 0;

    const grant = (id: string) => {
      if (!state.unlockedAchievements.includes(id) && !newUnlocks.includes(id)) {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) {
          newUnlocks.push(id);
          bonusCoins += ach.rewardMooncoins;
          bonusStardust += ach.rewardStardust;
          showToast(`Achievement Unlocked: ${ach.title} (+${ach.rewardMooncoins} Mooncoins)`);
        }
      }
    };

    if (state.activeGuests.some((g) => g.checkedIn)) grant('ach-first-guest');
    if (state.lastCheckoutReviews.some((r) => r.stars === 5)) grant('ach-five-star');
    if ((state.guestProgress.eleanor?.trust ?? 0) >= 4) grant('ach-ghost-whisperer');
    if (state.activeGuests.some((g) => g.guestId === 'milo' && g.requestCompleted))
      grant('ach-timekeeper');
    if (state.facilities.conservatoryUnlocked) grant('ach-plant-parent');
    if (state.facilities.room13Investigated) grant('ach-room-13');

    if (newUnlocks.length === 0) return state;

    return {
      ...state,
      mooncoins: state.mooncoins + bonusCoins,
      stardust: state.stardust + bonusStardust,
      unlockedAchievements: [...state.unlockedAchievements, ...newUnlocks],
    };
  };

  const handleStartNewGame = () => {
    const fresh = createInitialGameState();
    fresh.screen = 'PLAYING';
    fresh.settings = { ...gameState.settings };
    setGameState(fresh);
    setActiveTab('hotel');
    setConservatoryHarvested(false);
    setShowMrWhiskersIntro(true);
    soundFX.playBell();
    if (fresh.settings.musicEnabled) {
      soundFX.setMusicEnabled(true);
      soundFX.startMusic();
    }
  };

  const handleContinueGame = () => {
    if (!savedSnapshot) return;
    const restored = {
      ...savedSnapshot,
      screen: savedSnapshot.screen === 'TITLE_MENU' ? ('PLAYING' as const) : savedSnapshot.screen,
    };
    setGameState(restored);
    setActiveTab('hotel');
    soundFX.playChime();
    if (restored.settings.musicEnabled) {
      soundFX.setMusicEnabled(true);
      soundFX.startMusic();
    }
  };

  const handleUpdateSettings = (settings: GameSettings) => {
    setGameState((prev) => ({ ...prev, settings }));
  };

  const handleResetSave = () => {
    localStorage.removeItem(SAVE_KEY);
    setSavedSnapshot(null);
  };

  const handleAssignRoom = (guestId: string, roomId: string) => {
    soundFX.playBell();
    let arrivedName: string | null = null;
    setGameState((prev) => {
      const updatedRooms = prev.rooms.map((r) =>
        r.id === roomId ? { ...r, assignedGuestId: guestId } : r
      );
      let updatedGuests = prev.activeGuests.map((ag) =>
        ag.guestId === guestId ? { ...ag, roomId, checkedIn: true } : ag
      );
      const nextHour = prev.hour === '12:00 AM' ? '12:15 AM' : prev.hour;
      if (nextHour === '12:15 AM' && prev.hour === '12:00 AM') {
        const dynamicGuest = getNextDynamicGuest(prev, '12:15 AM');
        if (dynamicGuest) {
          updatedGuests = [...updatedGuests, dynamicGuest];
          arrivedName = GUESTS[dynamicGuest.guestId].name;
        }
      }
      const nextState = evaluateAchievements({
        ...prev,
        rooms: updatedRooms,
        activeGuests: updatedGuests,
        hour: nextHour,
        tutorialStep: prev.night === 1 && prev.tutorialStep < 2 ? 2 : prev.tutorialStep,
      });
      return nextState;
    });
    setShowCheckIn(false);
    const room = gameState.rooms.find((r) => r.id === roomId);
    if (arrivedName) {
      showToast(
        `${GUESTS[guestId].name} checked into Room ${room?.number}. ${arrivedName} just arrived in the lobby!`
      );
    } else {
      showToast(`${GUESTS[guestId].name} checked into Room ${room?.number}.`);
    }
  };

  const handleCleanRoom = (roomId: string) => {
    soundFX.playChime();
    setGameState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, cleanliness: 100 } : r)),
    }));
    showToast('Room tidied to spotless condition.');
  };

  const handleCompleteRequest = () => {
    if (!activeRequestGuest) return;
    const guest = GUESTS[activeRequestGuest.guestId];
    const req =
      guest.requests.find((r) => r.id === activeRequestGuest.requestId) ??
      guest.requests[0];

    soundFX.playCoin();
    setGameState((prev) => {
      const consumeMirror =
        req.requiredItemId === 'antique-mirror' && (prev.inventory['antique-mirror'] ?? 0) > 0;
      const nextInventory = { ...prev.inventory };
      if (consumeMirror) {
        nextInventory['antique-mirror'] = Math.max(0, nextInventory['antique-mirror'] - 1);
      }

      const nextState = evaluateAchievements({
        ...prev,
        mooncoins: prev.mooncoins + req.rewardMooncoins,
        stardust: prev.stardust + req.rewardStardust,
        inventory: nextInventory,
        activeGuests: prev.activeGuests.map((ag) =>
          ag.guestId === activeRequestGuest.guestId
            ? { ...ag, requestCompleted: true, satisfactionBonus: ag.satisfactionBonus + 1 }
            : ag
        ),
        tutorialStep: prev.night === 1 && prev.tutorialStep < 3 ? 3 : prev.tutorialStep,
      });
      return nextState;
    });

    showToast(`${req.completionNote} (+${req.rewardMooncoins} Mooncoins)`);
    setActiveRequestGuest(null);
  };

  const handleQuickBuyMirror = (): boolean => {
    if (gameState.mooncoins < 30) {
      showToast('Need 30 Mooncoins to buy the Silver Hand Mirror.');
      return false;
    }
    setGameState((prev) => ({
      ...prev,
      mooncoins: prev.mooncoins - 30,
      inventory: {
        ...prev.inventory,
        'antique-mirror': (prev.inventory['antique-mirror'] ?? 0) + 1,
      },
    }));
    return true;
  };

  const handleDialogueChoice = (guestId: string, choice: DialogueChoice) => {
    soundFX.playMystery();
    setGameState((prev) => {
      const prevProg = prev.guestProgress[guestId] ?? {
        trust: 0,
        visits: 0,
        storyCompleted: false,
      };
      const nextTrust = Math.min(5, prevProg.trust + choice.trustDelta);
      const nextClues =
        choice.clueUnlockedId && !prev.unlockedClues.includes(choice.clueUnlockedId)
          ? [...prev.unlockedClues, choice.clueUnlockedId]
          : prev.unlockedClues;

      return evaluateAchievements({
        ...prev,
        mooncoins: prev.mooncoins + (choice.mooncoinReward ?? 0),
        stardust: prev.stardust + (choice.stardustReward ?? 0),
        unlockedClues: nextClues,
        guestProgress: {
          ...prev.guestProgress,
          [guestId]: {
            ...prevProg,
            trust: nextTrust,
            lastChoiceSummary: choice.moodNote,
            storyCompleted: nextTrust >= 5,
          },
        },
        activeGuests: prev.activeGuests.map((ag) =>
          ag.guestId === guestId
            ? { ...ag, dialogueCompleted: true, selectedChoiceLabel: choice.label }
            : ag
        ),
        tutorialStep: prev.night === 1 ? 4 : prev.tutorialStep,
      });
    });
  };

  const handlePurchaseShopItem = (item: ShopItem, targetRoomId?: string) => {
    const alreadyOwnedFixture =
      item.applyFixture && gameState.ownedDecorUpgrades.includes(item.id);

    if (!alreadyOwnedFixture) {
      if (
        gameState.mooncoins < item.costMooncoins ||
        gameState.stardust < (item.costStardust ?? 0)
      ) {
        soundFX.playError();
        showToast('Not enough Mooncoins or Stardust.');
        return;
      }
    }

    soundFX.playCoin();

    setGameState((prev) => {
      let rooms = prev.rooms;
      let facilities = { ...prev.facilities };
      const inventory = { ...prev.inventory };
      const owned = [...prev.ownedDecorUpgrades];
      const clues = [...prev.unlockedClues];

      if (!alreadyOwnedFixture && !owned.includes(item.id) && item.applyFixture) {
        owned.push(item.id);
      }

      if (item.applyFixture && targetRoomId) {
        rooms = rooms.map((r) =>
          r.id === targetRoomId
            ? { ...r, fixtures: { ...r.fixtures, ...item.applyFixture } }
            : r
        );
      }

      if (item.grantsSupplyId) {
        inventory[item.grantsSupplyId] = (inventory[item.grantsSupplyId] ?? 0) + 1;
      }

      if (item.unlocksWingId === 'room-03') {
        rooms = rooms.map((r) => (r.id === 'room-03' ? { ...r, unlocked: true } : r));
      } else if (item.unlocksWingId === 'room-04') {
        rooms = rooms.map((r) => (r.id === 'room-04' ? { ...r, unlocked: true } : r));
      } else if (item.unlocksWingId === 'library') {
        facilities.libraryUnlocked = true;
      } else if (item.unlocksWingId === 'conservatory') {
        facilities.conservatoryUnlocked = true;
      } else if (item.unlocksWingId === 'room-13-seal') {
        facilities.room13Investigated = true;
        if (!clues.includes('clue-room13-finale')) {
          clues.push('clue-room13-finale');
        }
      }

      return evaluateAchievements({
        ...prev,
        mooncoins: alreadyOwnedFixture ? prev.mooncoins : prev.mooncoins - item.costMooncoins,
        stardust: alreadyOwnedFixture
          ? prev.stardust
          : prev.stardust - (item.costStardust ?? 0),
        rooms,
        facilities,
        inventory,
        ownedDecorUpgrades: owned,
        unlockedClues: clues,
      });
    });

    showToast(
      alreadyOwnedFixture
        ? `Installed ${item.name} inside the room.`
        : `Purchased ${item.name}!`
    );
  };

  const handleEquipInsideRoom = (roomId: string, item: ShopItem) => {
    if (!item.applyFixture) return;
    soundFX.playChime();
    setGameState((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.id === roomId ? { ...r, fixtures: { ...r.fixtures, ...item.applyFixture } } : r
      ),
    }));
    showToast(`Equipped ${item.name}.`);
  };

  const handleAdvanceHour = () => {
    const waitingCount = gameState.activeGuests.filter((g) => !g.checkedIn).length;
    if (waitingCount > 0 && gameState.hour !== '12:00 AM') {
      soundFX.playError();
      showToast('Check in all waiting guests at Reception before advancing!');
      setShowCheckIn(true);
      return;
    }

    const idx = NIGHT_HOURS.indexOf(gameState.hour);
    if (idx < NIGHT_HOURS.length - 1) {
      const nextHour = NIGHT_HOURS[idx + 1];
      soundFX.playClockTick();

      if (nextHour === '3:00 AM') {
        const pickedEvent =
          NIGHT_EVENTS[(gameState.night - 1) % NIGHT_EVENTS.length];
        setGameState((prev) => ({
          ...prev,
          hour: nextHour,
          currentEvent: pickedEvent,
          eventResolved: false,
        }));
        setShowEventModal(true);
      } else if (nextHour === '5:00 AM') {
        triggerCheckout();
      } else {
        let arrivedName: string | null = null;
        setGameState((prev) => {
          const dynamicGuest = getNextDynamicGuest(prev, nextHour);
          if (dynamicGuest) {
            arrivedName = GUESTS[dynamicGuest.guestId].name;
          }
          return {
            ...prev,
            hour: nextHour,
            activeGuests: dynamicGuest
              ? [...prev.activeGuests, dynamicGuest]
              : prev.activeGuests,
          };
        });
        if (arrivedName) {
          soundFX.playBell();
          showToast(`New Arrival: ${arrivedName} stepped into the Grand Lobby!`);
        }
      }
    }
  };

  const triggerCheckout = () => {
    soundFX.playBell();
    setGameState((prev) => {
      const reviews: CheckoutReview[] = [];
      let totalCoins = 0;
      let totalStardust = prev.facilities.conservatoryUnlocked ? 1 : 0;
      let totalRep = 0;
      const updatedProgress = { ...prev.guestProgress };

      for (const ag of prev.activeGuests) {
        if (!ag.checkedIn || !ag.roomId) continue;
        const guest = GUESTS[ag.guestId];
        const room = prev.rooms.find((r) => r.id === ag.roomId);
        if (!guest || !room) continue;

        const compat = evaluateRoomCompatibility(guest, room);
        let stars = 3;
        if (compat.score >= 2) stars += 1;
        else if (compat.score < 0) stars -= 1;
        if (ag.requestCompleted) stars += 1;
        if (ag.dialogueCompleted) stars += 1;
        if (room.cleanliness < 60) stars -= 1;
        stars = Math.max(1, Math.min(5, stars));

        const candleBonus = room.fixtures.floatingCandles ? 1.1 : 1;
        const earnedCoins = Math.round(
          (guest.baseRate + stars * 10) * candleBonus
        );
        const earnedStardust = stars >= 5 ? 1 : 0;
        const earnedRep = stars >= 4 ? 3 : stars === 3 ? 2 : 1;

        totalCoins += earnedCoins;
        totalStardust += earnedStardust;
        totalRep += earnedRep;

        const prevG = updatedProgress[ag.guestId] ?? {
          trust: 0,
          visits: 0,
          storyCompleted: false,
        };
        updatedProgress[ag.guestId] = {
          ...prevG,
          visits: prevG.visits + 1,
        };

        const quote =
          stars === 5
            ? '“Every candle, hush, and memory here feels timeless. I shall return.”'
            : stars >= 4
            ? '“A remarkably thoughtful stay. My requests were handled with grace.”'
            : '“Comfortable enough until dawn, though the room lacked a few personal touches.”';

        reviews.push({
          guestId: guest.id,
          guestName: guest.name,
          species: guest.species,
          portraitUrl: guest.portraitUrl,
          roomName: `Room ${room.number} · ${room.name}`,
          stars,
          quote,
          mooncoinsEarned: earnedCoins,
          stardustEarned: earnedStardust,
          reputationEarned: earnedRep,
        });
      }

      // Unlock Night 1 Madame Nocturne Letter clue automatically at sunrise
      const nextClues = [...prev.unlockedClues];
      let unlockedTitle: string | null = null;
      if (prev.night === 1 && !nextClues.includes('clue-nocturne-letter-1')) {
        nextClues.push('clue-nocturne-letter-1');
        unlockedTitle = MYSTERY_CLUES['clue-nocturne-letter-1'].title;
      }
      setNewlyUnlockedClueTitle(unlockedTitle);

      // Slightly reduce tidiness of used rooms for next night
      const clearedRooms = prev.rooms.map((r) => ({
        ...r,
        cleanliness: r.assignedGuestId ? Math.max(55, r.cleanliness - 20) : r.cleanliness,
        assignedGuestId: null,
      }));

      return evaluateAchievements({
        ...prev,
        screen: 'SUNRISE_SUMMARY',
        hour: '5:00 AM',
        mooncoins: prev.mooncoins + totalCoins,
        stardust: prev.stardust + totalStardust,
        reputation: prev.reputation + totalRep,
        rooms: clearedRooms,
        guestProgress: updatedProgress,
        lastCheckoutReviews: reviews,
        unlockedClues: nextClues,
        totalNightsCompleted: prev.totalNightsCompleted + 1,
      });
    });
  };

  const handleEnterSunrisePrep = () => {
    setGameState((prev) => ({ ...prev, screen: 'AFTER_SUNRISE' }));
    setActiveTab('hotel');
  };

  const handleOpenNextNight = () => {
    soundFX.playBell();
    setConservatoryHarvested(false);
    setGameState((prev) => {
      const nextNight = prev.night + 1;
      const unlockedCount = prev.rooms.filter((r) => r.unlocked).length;
      return {
        ...prev,
        screen: 'PLAYING',
        night: nextNight,
        hour: '12:00 AM',
        activeGuests: generateGuestsForNight(nextNight, unlockedCount),
        currentEvent: null,
        eventResolved: false,
      };
    });
    setActiveTab('hotel');
  };

  const handleResolveEventChoice = (choiceId: string) => {
    const ev = gameState.currentEvent;
    if (!ev) return { outcome: '' };
    const choice = ev.choices.find((c) => c.id === choiceId);
    if (!choice) return { outcome: '' };

    soundFX.playMystery();
    let clueTitle: string | undefined;

    setGameState((prev) => {
      const nextClues = [...prev.unlockedClues];
      if (choice.clueId && !nextClues.includes(choice.clueId)) {
        nextClues.push(choice.clueId);
        clueTitle = MYSTERY_CLUES[choice.clueId]?.title;
      }
      return {
        ...prev,
        mooncoins: prev.mooncoins + (choice.mooncoinDelta ?? 0),
        stardust: prev.stardust + (choice.stardustDelta ?? 0),
        reputation: prev.reputation + (choice.reputationDelta ?? 0),
        unlockedClues: nextClues,
        eventResolved: true,
      };
    });

    return { outcome: choice.outcome, clueTitle };
  };

  const handleUnlockClue = (clueId: string) => {
    if (gameState.unlockedClues.includes(clueId)) return;
    soundFX.playMystery();
    setGameState((prev) => ({
      ...prev,
      unlockedClues: [...prev.unlockedClues, clueId],
    }));
    const title = MYSTERY_CLUES[clueId]?.title ?? 'Mystery Clue';
    showToast(`Clue Recorded: ${title}`);
  };

  const handleHarvestConservatory = () => {
    if (conservatoryHarvested) return;
    soundFX.playChime();
    setConservatoryHarvested(true);
    setGameState((prev) => ({ ...prev, stardust: prev.stardust + 1 }));
    showToast('Gathered +1 Stardust Dew from the Moonferns.');
  };

  if (gameState.screen === 'TITLE_MENU') {
    return (
      <TitleScreen
        hasSavedGame={Boolean(savedSnapshot)}
        savedNight={savedSnapshot?.night ?? 1}
        savedMooncoins={savedSnapshot?.mooncoins ?? 0}
        settings={gameState.settings}
        onStartNew={handleStartNewGame}
        onContinue={handleContinueGame}
        onUpdateSettings={handleUpdateSettings}
        onResetSave={handleResetSave}
      />
    );
  }

  const waitingGuests = gameState.activeGuests.filter((g) => !g.checkedIn);
  const checkedInGuests = gameState.activeGuests.filter((g) => g.checkedIn);
  const openRoom = openRoomId ? gameState.rooms.find((r) => r.id === openRoomId) ?? null : null;
  const openRoomOccupant = openRoom
    ? gameState.activeGuests.find((g) => g.checkedIn && g.roomId === openRoom.id)
    : undefined;

  const isAfterSunrise = gameState.screen === 'AFTER_SUNRISE';

  // Contextual Guidance Message from Mr. Whiskers
  const mrWhiskersHint = (() => {
    if (isAfterSunrise) {
      return 'Dawn protects the hotel. Visit the Shop to furnish rooms or restore new wings, then open the next night whenever ready.';
    }
    if (waitingGuests.length > 0) {
      return `${GUESTS[waitingGuests[0].guestId].name} is waiting in the Grand Lobby. Click Reception or the guest to assign them a suitable room.`;
    }
    const pendingReq = checkedInGuests.find((g) => !g.requestCompleted);
    if (pendingReq && (gameState.hour === '12:15 AM' || gameState.hour === '1:00 AM')) {
      return `${GUESTS[pendingReq.guestId].name} has a special request upstairs. Click the sparkle button on their room card or advance to 2:00 AM.`;
    }
    const pendingChat = checkedInGuests.find((g) => !g.dialogueCompleted);
    if (pendingChat && (gameState.hour === '2:00 AM' || gameState.hour === '3:00 AM')) {
      return `It is ${gameState.hour}—an ideal hour to converse with ${GUESTS[pendingChat.guestId].name} and learn what brought them here.`;
    }
    if (gameState.hour === '3:00 AM') {
      return 'All hotel tasks are settled for tonight. Advance to 5:00 AM for dawn checkout and guest reviews.';
    }
    return 'Advance the night clock whenever you are ready to proceed to the next hour.';
  })();

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f3ead8] flex flex-col">
      <TopHud
        screen={gameState.screen}
        night={gameState.night}
        hour={gameState.hour}
        mooncoins={gameState.mooncoins}
        stardust={gameState.stardust}
        reputation={gameState.reputation}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'office') {
            setShowOfficeModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onReturnTitle={() => setGameState((prev) => ({ ...prev, screen: 'TITLE_MENU' }))}
        unreadCluesCount={gameState.unlockedClues.length}
        musicEnabled={gameState.settings.musicEnabled ?? true}
        onToggleMusic={() => {
          const next = !(gameState.settings.musicEnabled ?? true);
          handleUpdateSettings({ ...gameState.settings, musicEnabled: next });
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-amber-300/40 bg-[#151d30] px-4 py-3 text-xs font-medium text-amber-100 shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 space-y-6">
        {/* Night Control & Mr. Whiskers Guidance Strip */}
        <section className="rounded-2xl border border-amber-200/15 bg-[#111725] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={ASSETS.mrWhiskers}
              alt="Mr. Whiskers"
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-xl object-cover border border-amber-300/35 shrink-0"
            />
            <div>
              <p className="text-xs font-medium text-amber-300">
                Mr. Whiskers · Night Manager
              </p>
              <p className="text-sm text-[#e7decb] leading-relaxed mt-0.5">
                “{mrWhiskersHint}”
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isAfterSunrise && waitingGuests.length > 0 && (
              <button
                onClick={() => {
                  setSelectedWaitingGuestId(waitingGuests[0].guestId);
                  setShowCheckIn(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-500/15 px-4 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap"
              >
                <KeyRound className="h-4 w-4" />
                Check In Guest
              </button>
            )}

            {isAfterSunrise ? (
              <button
                onClick={handleOpenNextNight}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 transition cursor-pointer whitespace-nowrap"
              >
                <Moon className="h-4 w-4" />
                Open Night {gameState.night + 1} (12:00 AM)
              </button>
            ) : (
              <button
                onClick={handleAdvanceHour}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 transition cursor-pointer whitespace-nowrap"
              >
                <Clock className="h-4 w-4" />
                {gameState.hour === '3:00 AM'
                  ? 'Proceed to 5:00 AM Checkout'
                  : `Advance to ${
                      NIGHT_HOURS[NIGHT_HOURS.indexOf(gameState.hour) + 1] ?? '5:00 AM'
                    }`}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Active View Switch */}
        {activeTab === 'hotel' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-9">
              <HotelMap
                gameState={gameState}
                onClickRoom={(room: RoomData) => setOpenRoomId(room.id)}
                onClickReception={() => setShowCheckIn(true)}
                onClickWaitingGuest={(guestId) => {
                  setSelectedWaitingGuestId(guestId);
                  setShowCheckIn(true);
                }}
                onClickActiveGuestAction={(ag, action) => {
                  if (action === 'request') setActiveRequestGuest(ag);
                  else setActiveDialogueGuestId(ag.guestId);
                }}
                onClickOffice={() => setShowOfficeModal(true)}
                onClickRoom13={() => setShowRoom13Modal(true)}
                onClickLibrary={() => setShowLibraryModal(true)}
                onClickConservatory={handleHarvestConservatory}
                onHarvestConservatory={handleHarvestConservatory}
                onStokeHearth={() => showToast('Golden embers crackle warmly across the Grand Lobby.')}
                conservatoryHarvestedThisNight={conservatoryHarvested}
                onOpenShop={() => setActiveTab('shop')}
              />
            </div>

            {/* Side Guest Ledger Panel */}
            <aside className="xl:col-span-3 rounded-2xl border border-amber-200/15 bg-[#0e1422] p-5 space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#f6eedb]">
                  Tonight’s Guests
                </h3>
                <p className="text-xs text-[#9c9281] mt-0.5">
                  Click any guest action directly from the ledger.
                </p>
              </div>

              {gameState.activeGuests.length === 0 || isAfterSunrise ? (
                <p className="text-xs text-[#9c9281] leading-relaxed">
                  {isAfterSunrise
                    ? 'Guests have departed for the day. Review the Shop or Journal before opening the doors tonight.'
                    : 'No guests in the ledger yet.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {gameState.activeGuests.map((ag) => {
                    const guest = GUESTS[ag.guestId];
                    const room = ag.roomId
                      ? gameState.rooms.find((r) => r.id === ag.roomId)
                      : null;

                    return (
                      <div
                        key={ag.guestId}
                        className="rounded-xl border border-white/10 bg-[#151c2e] p-3.5 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={guest.portraitUrl}
                            alt={guest.name}
                            referrerPolicy="no-referrer"
                            className="h-11 w-11 rounded-full object-cover border border-amber-300/35 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#f6eedb] truncate">
                              {guest.name}
                            </p>
                            <p className="text-xs text-[#a59a87] truncate">
                              {room ? `Room ${room.number} · ${room.name}` : 'Waiting in Lobby'}
                            </p>
                          </div>
                        </div>

                        {!ag.checkedIn ? (
                          <button
                            onClick={() => {
                              setSelectedWaitingGuestId(ag.guestId);
                              setShowCheckIn(true);
                            }}
                            className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
                          >
                            Assign Room
                          </button>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={ag.requestCompleted}
                              onClick={() => setActiveRequestGuest(ag)}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer ${
                                ag.requestCompleted
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 cursor-default'
                                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/35 hover:bg-amber-500/30'
                              }`}
                            >
                              {ag.requestCompleted ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Request Done
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" /> Request
                                </>
                              )}
                            </button>

                            <button
                              disabled={ag.dialogueCompleted}
                              onClick={() => setActiveDialogueGuestId(ag.guestId)}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer ${
                                ag.dialogueCompleted
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 cursor-default'
                                  : 'bg-sky-500/20 text-sky-200 border border-sky-400/35 hover:bg-sky-500/30'
                              }`}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              {ag.dialogueCompleted ? 'Spoken' : 'Talk'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inventory Quick Look */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-[#cfc5b4] mb-2">
                  Reception Inventory
                </p>
                <p className="text-xs text-[#9c9281] font-mono-tabular">
                  Silver Hand Mirrors: {gameState.inventory['antique-mirror'] ?? 0}
                </p>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'shop' && (
          <ShopView gameState={gameState} onPurchase={handlePurchaseShopItem} />
        )}

        {activeTab === 'journal' && <JournalView gameState={gameState} />}
      </main>

      {/* Night 1 Mr. Whiskers Welcome Intro Modal */}
      {showMrWhiskersIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-amber-300/30 bg-[#111725] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-4">
              <img
                src={ASSETS.mrWhiskers}
                alt="Mr. Whiskers"
                referrerPolicy="no-referrer"
                className="h-20 w-20 rounded-xl object-cover border border-amber-300/40 shrink-0"
              />
              <div>
                <p className="text-xs text-amber-300">12:00 AM · Welcome to Your Inheritance</p>
                <h2 className="font-display text-2xl font-semibold text-[#f6eedb]">
                  Mr. Whiskers
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#d6cbb9] leading-relaxed">
              <p>
                “Ah, the new proprietor has arrived right as the midnight chimes begin. I am Mr. Whiskers, Night Manager of The Midnight Hotel.”
              </p>
              <p>
                “Your relative Madame Nocturne vanished years ago, leaving only this brass ledger and a very particular clientele. Guests arrive between midnight and 5:00 AM—ghosts, vampires, travelers lost in time.”
              </p>
              <p className="text-amber-200">
                “Listen—our front door just unlatched. Eleanor is waiting in the lobby. Step up to the Reception Desk and find her a quiet room!”
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowMrWhiskersIntro(false);
                  setShowCheckIn(true);
                }}
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#120d06] hover:bg-amber-400 cursor-pointer"
              >
                Open Reception Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Room Interior Modal */}
      {openRoom && (
        <RoomInteriorView
          room={openRoom}
          occupantState={openRoomOccupant}
          ownedUpgrades={gameState.ownedDecorUpgrades}
          onClose={() => setOpenRoomId(null)}
          onCleanRoom={handleCleanRoom}
          onEquipUpgrade={handleEquipInsideRoom}
          onLaunchRequest={(ag) => setActiveRequestGuest(ag)}
          onLaunchDialogue={(ag) => setActiveDialogueGuestId(ag.guestId)}
        />
      )}

      {/* Check-In Modal */}
      {showCheckIn && (
        <CheckInModal
          waitingGuests={waitingGuests}
          rooms={gameState.rooms}
          guestProgress={gameState.guestProgress}
          selectedGuestId={selectedWaitingGuestId}
          onSelectGuest={setSelectedWaitingGuestId}
          onAssignRoom={handleAssignRoom}
          onClose={() => setShowCheckIn(false)}
          night={gameState.night}
        />
      )}

      {/* Branching Dialogue Modal */}
      {activeDialogueGuestId && (
        <DialogueModal
          guestId={activeDialogueGuestId}
          progress={
            gameState.guestProgress[activeDialogueGuestId] ?? {
              trust: 0,
              visits: 0,
              storyCompleted: false,
            }
          }
          onSelectChoice={handleDialogueChoice}
          onClose={() => setActiveDialogueGuestId(null)}
        />
      )}

      {/* Interactive Mini-Game Request Modal */}
      {activeRequestGuest && (
        <MiniGameModal
          guestId={activeRequestGuest.guestId}
          request={
            GUESTS[activeRequestGuest.guestId].requests.find(
              (r) => r.id === activeRequestGuest.requestId
            ) ?? GUESTS[activeRequestGuest.guestId].requests[0]
          }
          hasHandMirror={(gameState.inventory['antique-mirror'] ?? 0) > 0}
          roomHasMirror={
            Boolean(
              gameState.rooms.find((r) => r.id === activeRequestGuest.roomId)?.fixtures.mirror
            )
          }
          onBuyMirrorQuick={handleQuickBuyMirror}
          onComplete={handleCompleteRequest}
          onClose={() => setActiveRequestGuest(null)}
        />
      )}

      {/* Manager's Office Modal */}
      {showOfficeModal && (
        <ManagersOfficeModal
          gameState={gameState}
          onUnlockFutureRegisterClue={() => handleUnlockClue('clue-future-register')}
          onClose={() => setShowOfficeModal(false)}
        />
      )}

      {/* Room 13 Modal */}
      {showRoom13Modal && (
        <Room13Modal
          unlocked={gameState.facilities.room13Investigated}
          reputation={gameState.reputation}
          cluesCount={gameState.unlockedClues.length}
          onOpenShop={() => setActiveTab('shop')}
          onClose={() => setShowRoom13Modal(false)}
        />
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <LibraryModal
          unlockedClues={gameState.unlockedClues}
          onUnlockClue={handleUnlockClue}
          onClose={() => setShowLibraryModal(false)}
        />
      )}

      {/* 3:00 AM Random Event Modal */}
      {showEventModal && gameState.currentEvent && (
        <NightEventModal
          event={gameState.currentEvent}
          onChoose={handleResolveEventChoice}
          onClose={() => setShowEventModal(false)}
        />
      )}

      {/* 5:00 AM Dawn Checkout Summary */}
      {gameState.screen === 'SUNRISE_SUMMARY' && (
        <SunriseSummaryModal
          night={gameState.night}
          reviews={gameState.lastCheckoutReviews}
          newlyUnlockedClueTitle={newlyUnlockedClueTitle}
          onContinueToSunrisePrep={handleEnterSunrisePrep}
        />
      )}

      {/* In-Game Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-amber-200/20 bg-[#131926] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
              <h2 className="font-display text-xl font-semibold text-[#f6eedb]">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
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
                    handleUpdateSettings({
                      ...gameState.settings,
                      musicEnabled: !(gameState.settings.musicEnabled ?? true),
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap ${
                    gameState.settings.musicEnabled ?? true
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-[#9c9281]'
                  }`}
                >
                  <Music className="h-4 w-4" />
                  {gameState.settings.musicEnabled ?? true ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#f3ead8]">Chime & Sound Effects</p>
                  <p className="text-xs text-[#9c9281]">Bellhop chimes and clock ticks</p>
                </div>
                <button
                  onClick={() =>
                    handleUpdateSettings({
                      ...gameState.settings,
                      soundEnabled: !gameState.settings.soundEnabled,
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium cursor-pointer whitespace-nowrap ${
                    gameState.settings.soundEnabled
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                      : 'border-white/15 bg-white/5 text-[#9c9281]'
                  }`}
                >
                  {gameState.settings.soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                  {gameState.settings.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-xs text-[#9c9281]">Progress saves automatically</span>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setGameState((prev) => ({ ...prev, screen: 'TITLE_MENU' }));
                  }}
                  className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-[#f3ead8] hover:bg-white/5 cursor-pointer"
                >
                  Return to Title Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
