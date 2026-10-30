/**
 * The venue checklist questions (v4), shared by the phone checklist (/venue-checklist/tour).
 * The printable PDF is built from docs/venue-checklist/v4/index.html; tests/venue-checklist.test.cjs
 * fails if the two drift apart, so change a question in both places.
 *
 * Question ids are saved with each couple's answers: never reuse or renumber one.
 * Add new questions with new ids instead (gaps, like hours-1..5 then alcohol-1, alcohol-4,
 * are questions retired in earlier versions).
 */

// why: the one-line reason under a starred dealbreaker. tip: a short "listen for" note on a question whose answer is easy to misread.
export type ChecklistQuestion = { id: string; text: string; star?: true; why?: string; tip?: string };
export type ChecklistSection = {
  id: string; num: string; title: string; why?: string; planner?: string;
  multicultural?: true; questions: ChecklistQuestion[];
};

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "hours", num: "01", title: "Date, Hours & Curfew",
    why: "Setup, the celebration, and cleanup all come out of the same rental hours.",
    questions: [
      { id: "hours-1", text: "What time can our vendors start setting up, and when does setup have to be finished?" },
      { id: "hours-2", text: "What time does everything have to end: music, the bar, guests, and vendors packing up?", star: true, why: "An early end time changes the whole shape of the day." },
      { id: "hours-3", text: "What does it cost if we run over time, and is that charged by the half hour or the hour?", tip: "Listen for: whether staff and security are charged on top of the room." },
      { id: "hours-4", text: "Is there a local noise rule that ends outdoor music earlier than the venue’s own curfew?" },
      { id: "hours-5", text: "Is any other event happening at the venue on the same day?" },
    ],
  },
  {
    id: "capacity", num: "02", title: "Real Capacity & Layout",
    why: "The capacity on the brochure is usually for an empty room. Your dance floor, stage, bars, and décor all take seats away.",
    questions: [
      { id: "capacity-1", text: "How many guests can the room really seat once the dance floor, stage, bars, and lounge areas are in?", star: true, why: "A room listed for 200 may seat far fewer with your layout." },
      { id: "capacity-2", text: "Can we see the rain-backup space, and does it fit all our guests?", star: true, why: "A rain plan only helps if you would be happy celebrating in it." },
      { id: "capacity-3", text: "If the weather turns, by what time do we have to decide, and are tents, heaters, or flooring allowed?" },
      { id: "capacity-4", text: "If the ceremony and reception are in the same room, where do guests wait during the changeover, and does it fit everyone?", tip: "Listen for: how long the changeover takes. A cocktail space that’s too small is a common surprise." },
      { id: "capacity-5", text: "How many restrooms are there, and are they enough for our guest count?", tip: "Listen for: a number, not “plenty.”" },
      { id: "capacity-6", text: "Is there a getting-ready space for both sides, and can hair and makeup work on site?" },
    ],
  },
  {
    id: "alcohol", num: "03", title: "Alcohol & Bar",
    why: "Whoever holds the license decides who pours and when the bar closes.",
    planner: "who arranges the permit, bartenders, security, and liquor insurance, and whether the venue must be named on the policy.",
    questions: [
      { id: "alcohol-1", text: "Does the venue have its own liquor license, or do we need a permit?" },
      { id: "alcohol-4", text: "What time does the bar have to close, and what bar fees are there?" },
    ],
  },
  {
    id: "catering", num: "04", title: "Catering & Kitchen",
    why: "If your caterer cannot cook the way your menu needs, the meal you are picturing may not be possible here.",
    questions: [
      { id: "catering-1", text: "Do we have to use the venue’s caterer, pick from their list, or can we bring our own?", star: true, why: "If you must use theirs, the menu and the price are largely decided for you." },
      { id: "catering-2", text: "Can our caterer cook on site?" },
      { id: "catering-3", text: "Can dietary and allergy needs be met?" },
      { id: "catering-4", text: "Is there a food and drink minimum, and is it lower on off-peak days or seasons?", tip: "A minimum isn’t a quote: tax and service charges often come on top." },
    ],
  },
  {
    id: "rentals", num: "05", title: "What’s Included",
    why: "“Included” can mean anything. The chairs may be included; the chairs you want may not be.",
    questions: [
      { id: "rentals-1", text: "Which tables, chairs, linens, place settings, bars, and dance floor are included?" },
      { id: "rentals-2", text: "Can we see the included pieces, and what costs extra to deliver, set up, or clean?", tip: "“Included” chairs can turn out to be the wrong color, or the glassware plastic. Seeing them is the only way to know." },
      { id: "rentals-4", text: "Can the dance floor be wrapped or covered?" },
    ],
  },
  {
    id: "decor", num: "06", title: "Décor Setup & Load-In",
    why: "Your design is only as good as the hours and the access you get to install it.",
    planner: "whether the room is on the loading level, the dock or service entrance, and measuring the path from the truck to the room.",
    questions: [
      { id: "decor-1", text: "Exactly how many hours do we get to set up décor before guests arrive?", star: true, why: "If the answer is two, the design you are picturing may not fit." },
      { id: "decor-2", text: "How many hours do we get afterwards to take everything down?" },
      { id: "decor-3", text: "Can setup start the day before, and can décor stay overnight?" },
      { id: "decor-6", text: "Can large installations get into the room without stairs or tight turns?", star: true, why: "If the big pieces cannot get in, the design changes, however beautiful the room." },
      { id: "decor-8", text: "What time does the room have to be guest-ready?" },
      { id: "decor-9", text: "Are real candles allowed, and are there rules on the holders (floating only, enclosed)?", tip: "Some venues allow only floating candles, which can change a whole design." },
      { id: "decor-10", text: "What can be attached to the walls, ceiling, or floor, and are tape, confetti, loose petals, or sparklers allowed?" },
    ],
  },
  {
    id: "power", num: "07", title: "Lighting, Effects & Power",
    why: "Lighting, music, hanging florals, and first-dance effects all need permission, and power.",
    planner: "how much power the room has for lighting, music, and catering, the ceiling rigging points, and approvals for effects.",
    questions: [
      { id: "power-2", text: "Can florals, chandeliers, or draping hang from the ceiling?", star: true, why: "Hanging installations are often the first thing a venue says no to." },
      { id: "power-3", text: "Are special effects allowed, like cold sparks, a low cloud for the first dance, or haze?" },
      { id: "power-6", text: "Is there backup power if the electricity goes out?" },
    ],
  },
  {
    id: "parking", num: "08", title: "Parking & Arrival",
    why: "Arrival is your guests’ first impression. A long walk in the rain is hard to undo.",
    questions: [
      { id: "parking-1", text: "How many guest parking spaces are there?" },
      { id: "parking-2", text: "Is parking free, validated, or paid by guests?" },
      { id: "parking-3", text: "Is valet required or optional, and what does it cost?" },
      { id: "parking-4", text: "Where do guests get dropped off, including shuttles, rideshare, and accessible drop-off?" },
      { id: "parking-5", text: "Is there overflow parking, and would we need a shuttle?" },
      { id: "parking-6", text: "Is the walk from parking safe, accessible, and well lit in bad weather?" },
      { id: "parking-7", text: "How far is it from the hotels your guests will use, and from the nearest airport?" },
    ],
  },
  {
    id: "cost", num: "09", title: "Cost, Contract & Your Contact",
    why: "The quote is rarely the total, and the contract is the only promise that counts.",
    questions: [
      { id: "cost-1", text: "Does the quote include everything: venue fee, service charge, tax, staffing, security, cleaning, rentals, parking, valet, power, and overtime?", star: true, why: "Service charges, tax, and overtime are rarely in the first number." },
      { id: "cost-5", text: "Are there admin or credit card fees on top of the service charge?" },
      { id: "cost-6", text: "Can our guest count go down after we sign, or only up?", star: true, why: "Sign for 200, have 150 come, and you may still pay for 200." },
      { id: "cost-2", text: "Will everything we’ve agreed go in the contract?", tip: "If it was only said on the tour, it isn’t promised." },
      { id: "cost-4", text: "What deposit and payment schedule do you require, and what happens if we cancel or postpone?", star: true, why: "Know what you would lose before you pay, not after." },
      { id: "cost-7", text: "Will the person planning with us be the one there on the day?", tip: "Some couples plan with one person and meet a stranger on the day." },
    ],
  },
  {
    id: "mc-ceremonies", num: "i", title: "Ceremonies & Spaces", multicultural: true,
    questions: [
      { id: "mc-ceremonies-1", text: "Can the venue host two or more ceremonies, room changes, rehearsals, and cultural or religious leaders?", star: true, why: "Welcoming multicultural weddings is not the same as fitting the traditions in yours." },
      { id: "mc-ceremonies-2", text: "If the room changes between ceremonies, how long does that take, and where do guests wait?" },
      { id: "mc-ceremonies-3", text: "Does the seating still work once your cultural structures, like a mandap, chuppah, or stage, are in the room?" },
      { id: "mc-ceremonies-4", text: "Is there a room for prayer, preparation, or gathering before the ceremony?" },
    ],
  },
  {
    id: "mc-fire", num: "ii", title: "Sacred Fire & Ritual Materials", multicultural: true,
    planner: "fire-marshal approval, ventilation, protective materials, and insurance for any open flame.",
    questions: [
      { id: "mc-fire-1", text: "Are sacred fire, incense, oil lamps, candles, rice, petals, powders, and ceremonial foods allowed?", star: true, why: "Name the exact ritual: “sacred fire, indoors, for forty minutes” gets a real answer." },
      { id: "mc-fire-2", text: "What approvals does each of these need, and who arranges them?" },
    ],
  },
  {
    id: "mc-cuisine", num: "iii", title: "Cultural Cuisine", multicultural: true,
    questions: [
      { id: "mc-cuisine-1", text: "Can your caterer cook on site with what the menu needs, like tandoors, grills, woks, propane, or extra refrigeration?" },
      { id: "mc-cuisine-2", text: "Can halal, kosher, Jain, vegetarian, fasting, and allergy needs be met without cross-contact?" },
    ],
  },
  {
    id: "mc-procession", num: "iv", title: "Processions, Attire & Language", multicultural: true,
    questions: [
      { id: "mc-procession-1", text: "Is there room for a baraat or other procession, with musicians, dancers, or a horse or car, without blocking parking or traffic?" },
      { id: "mc-procession-2", text: "Are there enough private rooms for outfit changes, stylists, family, elders, performers, prayer, and nursing?" },
      { id: "mc-procession-3", text: "Can signs, programs, screens, and announcements be in more than one language?" },
    ],
  },
  {
    id: "mc-timeline", num: "v", title: "Extended Timeline & Guest Experience", multicultural: true,
    questions: [
      { id: "mc-timeline-1", text: "Is the rental window long enough for every ceremony, outfit change, meal, performance, and photo?" },
      { id: "mc-timeline-2", text: "Where do guests wait between parts of the day, and can drinks and snacks be served there?" },
      { id: "mc-timeline-3", text: "Can décor and ceremonial structures stay overnight, safely stored?" },
    ],
  },
];

export function sectionsFor(edition: "standard" | "multicultural") {
  return CHECKLIST_SECTIONS.filter((section) => edition === "multicultural" || !section.multicultural);
}
