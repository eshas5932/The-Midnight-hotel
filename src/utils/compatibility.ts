import { GuestProfile, RoomData, RoomTag } from '../types/game';

export function getEffectiveRoomTags(room: RoomData): RoomTag[] {
  const tags = new Set<RoomTag>(room.baseTags);
  if (room.fixtures.mirror) {
    tags.add('mirror');
    tags.delete('no-mirror');
  } else {
    tags.add('no-mirror');
    tags.delete('mirror');
  }
  if (room.fixtures.curtains === 'blackout') {
    tags.add('blackout');
    tags.delete('moonlight');
  }
  if (room.fixtures.clock) {
    tags.add('clock');
  }
  if (room.fixtures.plants) {
    tags.add('plants');
  }
  return Array.from(tags);
}

export interface CompatibilityResult {
  score: number; // -2 to +3
  label: 'Ideal Match' | 'Good Fit' | 'Neutral' | 'Poor Fit';
  notes: string[];
}

export function evaluateRoomCompatibility(guest: GuestProfile, room: RoomData): CompatibilityResult {
  const roomTags = getEffectiveRoomTags(room);
  let score = 0;
  const notes: string[] = [];

  for (const pref of guest.preferredTags) {
    if (roomTags.includes(pref)) {
      score += 1;
      notes.push(`Matches preference: ${formatTag(pref)}`);
    } else {
      notes.push(`Missing preferred: ${formatTag(pref)}`);
    }
  }

  for (const dislike of guest.dislikedTags) {
    if (roomTags.includes(dislike)) {
      score -= 2;
      notes.push(`Dislikes: ${formatTag(dislike)}`);
    }
  }

  if (room.fixtures.floatingCandles) {
    score += 1;
    notes.push('Warm floating candlelight');
  }

  let label: CompatibilityResult['label'] = 'Neutral';
  if (score >= 2) label = 'Ideal Match';
  else if (score === 1) label = 'Good Fit';
  else if (score < 0) label = 'Poor Fit';

  return { score, label, notes };
}

export function formatTag(tag: RoomTag): string {
  switch (tag) {
    case 'quiet':
      return 'Quiet';
    case 'mirror':
      return 'Mirror';
    case 'no-mirror':
      return 'No Mirror';
    case 'blackout':
      return 'Blackout Curtains';
    case 'moonlight':
      return 'Moonlight Windows';
    case 'clock':
      return 'Working Clock';
    case 'plants':
      return 'Plants';
    case 'cozy':
      return 'Cozy Parlor';
  }
}
