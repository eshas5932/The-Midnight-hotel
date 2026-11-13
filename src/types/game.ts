export type ScreenMode = 'TITLE_MENU' | 'PLAYING' | 'SUNRISE_SUMMARY' | 'AFTER_SUNRISE';

export type NightHour =
  | '12:00 AM'
  | '12:15 AM'
  | '1:00 AM'
  | '2:00 AM'
  | '3:00 AM'
  | '5:00 AM';

export type GuestSpecies = 'Ghost' | 'Vampire' | 'Time Traveller' | 'Forest Creature' | 'Spirit' | 'Astral Guest';

export type MiniGameType = 'POTION' | 'CLOCK' | 'MEMORY' | 'ROOM_PREP';

export type RoomTag =
  | 'quiet'
  | 'mirror'
  | 'no-mirror'
  | 'blackout'
  | 'moonlight'
  | 'clock'
  | 'plants'
  | 'cozy';

export type WallpaperStyle = 'damask' | 'midnight' | 'botanical' | 'crimson';
export type CurtainStyle = 'sheer' | 'blackout' | 'emerald';
export type BedStyle = 'simple' | 'canopy' | 'velvet';

export interface RoomFixtures {
  wallpaper: WallpaperStyle;
  curtains: CurtainStyle;
  bed: BedStyle;
  mirror: boolean;
  clock: boolean;
  plants: boolean;
  floatingCandles: boolean;
  persianRug: boolean;
}

export interface RoomData {
  id: string;
  number: string;
  name: string;
  floor: number;
  unlocked: boolean;
  unlockCost: number;
  description: string;
  baseTags: RoomTag[];
  fixtures: RoomFixtures;
  cleanliness: number; // 0 to 100
  assignedGuestId: string | null;
}

export interface DialogueChoice {
  id: string;
  label: string;
  trustDelta: number;
  response: string;
  clueUnlockedId?: string;
  stardustReward?: number;
  mooncoinReward?: number;
  moodNote: string;
}

export interface DialogueStage {
  stage: number;
  timePrompt: string;
  openingLine: string;
  choices: DialogueChoice[];
}

export interface GuestRequest {
  id: string;
  title: string;
  description: string;
  miniGame: MiniGameType;
  requiredItemId?: string; // optional item from inventory or shop
  rewardMooncoins: number;
  rewardStardust: number;
  completionNote: string;
}

export interface GuestProfile {
  id: string;
  name: string;
  title: string;
  species: GuestSpecies;
  isStoryGuest: boolean;
  portraitUrl?: string;
  accentColor: string;
  personality: string;
  backstory: string;
  secret: string;
  preferredTags: RoomTag[];
  dislikedTags: RoomTag[];
  specialRequestText: string;
  baseRate: number;
  dialogueStages: DialogueStage[];
  requests: GuestRequest[];
}

export interface ActiveNightGuest {
  guestId: string;
  roomId: string | null;
  checkedIn: boolean;
  requestCompleted: boolean;
  requestId: string;
  dialogueCompleted: boolean;
  satisfactionBonus: number;
  selectedChoiceLabel?: string;
}

export interface GuestNightProgress {
  trust: number; // 0 to 5
  visits: number;
  lastChoiceSummary?: string;
  storyCompleted: boolean;
}

export type ShopCategory = 'fixture' | 'decor' | 'supply' | 'wing';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  costMooncoins: number;
  costStardust?: number;
  description: string;
  effectLabel: string;
  applyFixture?: Partial<RoomFixtures>;
  grantsSupplyId?: string;
  unlocksWingId?: 'room-03' | 'room-04' | 'library' | 'conservatory' | 'room-13-seal';
  requiresReputation?: number;
}

export interface MysteryClue {
  id: string;
  title: string;
  source: string;
  content: string;
  category: 'nocturne' | 'room13' | 'guest';
}

export interface NightEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    id: string;
    label: string;
    outcome: string;
    mooncoinDelta?: number;
    stardustDelta?: number;
    reputationDelta?: number;
    clueId?: string;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardMooncoins: number;
  rewardStardust: number;
}

export interface CheckoutReview {
  guestId: string;
  guestName: string;
  species: GuestSpecies;
  portraitUrl?: string;
  roomName: string;
  stars: number;
  quote: string;
  mooncoinsEarned: number;
  stardustEarned: number;
  reputationEarned: number;
}

export interface HotelFacilities {
  libraryUnlocked: boolean;
  conservatoryUnlocked: boolean;
  room13Investigated: boolean;
  mrWhiskersNoteRead: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  textSpeed: 'normal' | 'instant';
}

export interface GameState {
  screen: ScreenMode;
  night: number;
  hour: NightHour;
  mooncoins: number;
  stardust: number;
  reputation: number;
  rooms: RoomData[];
  facilities: HotelFacilities;
  activeGuests: ActiveNightGuest[];
  guestProgress: Record<string, GuestNightProgress>;
  inventory: Record<string, number>; // supply item id -> count
  ownedDecorUpgrades: string[]; // shop item ids bought for rooms
  unlockedClues: string[];
  unlockedAchievements: string[];
  currentEvent: NightEvent | null;
  eventResolved: boolean;
  lastCheckoutReviews: CheckoutReview[];
  tutorialStep: number; // 0 = talk to Mr. Whiskers, 1 = check in Eleanor, 2 = fulfill mirror request, 3 = talk to Eleanor, 4 = done
  settings: GameSettings;
  totalNightsCompleted: number;
}
