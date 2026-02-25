export type StorySlide = {
  id: string;
  headline: string;
  shortText: string;
  imageUrl: string;
  imagePosition?: string;
  background?: string;
  theme?: "light" | "dark";
};

export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date
  startTime: string; // "17:00"
  endTime?: string;
  venueName: string;
  address?: string;
  mapLink?: string;
  dressCode?: string;
  notes?: string;
};

export type AttireSection = {
  id: string;
  title: string;
  description: string;
  images: string[];
  doList: string[];
  avoidList: string[];
};

export type FAQItem = {
  id: string;
  q: string;
  a: string;
};

export type GuestPlan = {
  id: string;
  name: string;
  email: string;
  partySize?: number;
  attendingStatus: "yes" | "no" | "maybe";
  arrivalDateTime?: string; // ISO datetime
  arrivalAirport?: string;
  arrivalFlight?: string;
  departureDateTime?: string;
  departureAirport?: string;
  departureFlight?: string;
  lodgingName?: string;
  lodgingArea?: string;
  transportNeeds: string[]; // e.g. ["shuttle", "rental_car"]
  dietaryNotes?: string;
  notes?: string;
  updatedAt: string; // ISO datetime
};

export type UpdateItem = {
  id: string;
  title: string;
  body: string;
  category: "itinerary" | "travel" | "lodging" | "general";
  publishedAt: string; // ISO datetime
};

export type TravelSection = {
  airports: { name: string; code: string; driveTime: string; recommended: boolean }[];
  arrivalWindow: { ideal: string; latest: string };
  departureWindow: { earliest: string; ideal: string };
  lodgingAreas: { name: string; description: string; priceRange: string }[];
  hotelBlock: { name: string; bookBy: string; code: string };
  transport: { type: string; description: string; recommended: boolean }[];
  tips: string[];
};
