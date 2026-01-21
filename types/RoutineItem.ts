export enum RoutineItem {
  PUSHUPS = '20 Pushups',
  COFFEE_BREAKFAST = 'Coffee + Breakfast',
  WATER = 'Full Glass of Water',
  CALENDAR_EMAILS = 'Calendar and Emails',
  MUSIC = 'Good Music Playing',
}

export interface RoutineItemInfo {
  item: RoutineItem;
  description: string;
  requiresVerification: boolean;
}

export const ROUTINE_ITEM_INFO: Record<RoutineItem, Omit<RoutineItemInfo, 'item'>> = {
  [RoutineItem.PUSHUPS]: {
    description: 'Complete 20 pushups with motion tracking',
    requiresVerification: true,
  },
  [RoutineItem.COFFEE_BREAKFAST]: {
    description: 'Take a photo of your coffee and breakfast',
    requiresVerification: true,
  },
  [RoutineItem.WATER]: {
    description: 'Take a photo of your full glass of water',
    requiresVerification: true,
  },
  [RoutineItem.CALENDAR_EMAILS]: {
    description: 'Review your calendar and check emails',
    requiresVerification: false,
  },
  [RoutineItem.MUSIC]: {
    description: 'Play some good music',
    requiresVerification: false,
  },
};
