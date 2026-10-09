import type { Household } from "./domain/types";

/**
 * V1.0 plan entitlements (PRD §6.10 / §19 recommended defaults). Paid prices are an open
 * product decision and show as "Price TBC" until finalised. Kept as
 * configuration so limits can change without touching business logic.
 */
export type PlanConfig = {
  id: Household["plan"];
  name: string;
  priceLabel: string;
  adultLimit: number;
  activeTaskLimit: number | null;
  upcomingEventLimit: number | null;
  aiRequestsPerMonth: number;
  tomorrowReady: "Basic" | "Full" | "AI-enhanced";
  features: string[];
};

export const PLANS: Record<Household["plan"], PlanConfig> = {
  free: {
    id: "free",
    name: "Alivora Free",
    priceLabel: "£0",
    adultLimit: 2,
    activeTaskLimit: 30,
    upcomingEventLimit: 30,
    aiRequestsPerMonth: 0,
    tomorrowReady: "Basic",
    features: ["2 adults", "Shared calendar", "30 active tasks", "Basic Tomorrow Ready"],
  },
  plus: {
    id: "plus",
    name: "Family Plus",
    priceLabel: "Price TBC",
    adultLimit: 6,
    activeTaskLimit: null,
    upcomingEventLimit: null,
    aiRequestsPerMonth: 10,
    tomorrowReady: "Full",
    features: ["Up to 6 adults", "Unlimited tasks & events", "Email reminders", "10 AI requests a month"],
  },
  ai: {
    id: "ai",
    name: "Family AI",
    priceLabel: "Price TBC",
    adultLimit: 6,
    activeTaskLimit: null,
    upcomingEventLimit: null,
    aiRequestsPerMonth: 100,
    tomorrowReady: "AI-enhanced",
    features: ["Everything in Plus", "AI-enhanced Tomorrow Ready", "100 AI requests a month"],
  },
};
