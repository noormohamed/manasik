/**
 * Hotel Policies Type Definitions
 * Defines standard and custom policies for hotels
 */

export type PolicyType = 'standard' | 'custom';

export interface StandardPolicy {
  id: string;
  name: string;
  icon: string; // Remixicon class name
  description: string;
  enabled: boolean;
  value?: string; // For policies with specific values (e.g., age restriction: "18")
}

export interface CustomPolicy {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface HotelPolicies {
  standardPolicies: StandardPolicy[];
  customPolicies: CustomPolicy[];
}

// Standard policy definitions
export const STANDARD_POLICIES: Record<string, Omit<StandardPolicy, 'enabled'>> = {
  ageRestriction: {
    id: 'ageRestriction',
    name: 'Age Restriction',
    icon: 'ri-user-forbid-line',
    description: 'Minimum age requirement for check-in',
    value: '18',
  },
  pets: {
    id: 'pets',
    name: 'Pets',
    icon: 'ri-bear-smile-line',
    description: 'Pet policy and any applicable charges',
  },
  groups: {
    id: 'groups',
    name: 'Groups',
    icon: 'ri-group-line',
    description: 'Policy for group bookings',
  },
  smoking: {
    id: 'smoking',
    name: 'Smoking',
    icon: 'ri-forbid-2-line',
    description: 'Smoking policy in rooms and common areas',
  },
  quietHours: {
    id: 'quietHours',
    name: 'Quiet Hours',
    icon: 'ri-volume-mute-line',
    description: 'Quiet hours policy for guests',
  },
  partiesEvents: {
    id: 'partiesEvents',
    name: 'Parties & Events',
    icon: 'ri-emotion-happy-line',
    description: 'Policy on parties and events in rooms',
  },
};

export const STANDARD_POLICY_IDS = Object.keys(STANDARD_POLICIES) as Array<keyof typeof STANDARD_POLICIES>;
