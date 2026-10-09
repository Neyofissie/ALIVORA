/**
 * Cuisine traditions (PRD §6.8). These are food traditions, never a
 * classification of people — nothing is inferred from them.
 */
export const CUISINES: Array<{ id: string; name: string }> = [
  "Nigerian", "Ghanaian", "Zimbabwean", "South African", "Ethiopian", "Kenyan",
  "Scottish", "English", "Welsh", "Irish",
  "Indian", "Pakistani", "Chinese", "Japanese", "Korean", "Thai", "Vietnamese",
  "Italian", "French", "Spanish", "Greek", "Caribbean", "Middle Eastern", "Other",
].map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name }));

export const TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Kolkata",
  "America/New_York",
];
