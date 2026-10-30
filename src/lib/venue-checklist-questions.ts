/**
 * The venue checklist questions, shared by the phone checklist (/venue-checklist/tour).
 * The printable PDF is built from docs/venue-checklist/v3/index.html; tests/venue-checklist.test.cjs
 * fails if the two drift apart, so change a question in both places.
 *
 * Question ids are saved with each couple's answers: never reuse or renumber one.
 * Add new questions with new ids instead.
 */

export type ChecklistQuestion = { id: string; text: string; star?: true };
export type ChecklistSection = { id: string; num: string; title: string; why?: string; multicultural?: true; questions: ChecklistQuestion[] };

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "hours", num: "01", title: "Date, Hours & Curfew",
    why: "Setup, the celebration, and cleanup all come out of the same rental hours.",
    questions: [
      { id: "hours-1", text: "What time may vendors begin load-in, and when must setup be complete?" },
      { id: "hours-2", text: "What time must music, alcohol service, guest activity, and vendor load-out end?", star: true },
      { id: "hours-3", text: "What overtime fees apply to event time, staff, security, cleanup, or late strike?" },
      { id: "hours-4", text: "Is there a local noise ordinance that ends outdoor music earlier than the venue curfew?" },
    ],
  },
  {
    id: "capacity", num: "02", title: "Real Capacity & Layout",
    why: "The capacity on the brochure is usually for an empty room. Your dance floor, stage, bars, and décor all take seats away.",
    questions: [
      { id: "capacity-1", text: "What is the realistic seated capacity with tables, stage, dance floor, bars, food stations, and lounge furniture?", star: true },
      { id: "capacity-2", text: "Can the full guest count fit in the weather-backup space?", star: true },
      { id: "capacity-3", text: "If weather forces a change, by what time must the call be made, and are tents, sidewalls, heaters, or ground flooring permitted?" },
      { id: "capacity-4", text: "Does capacity change for room flips?" },
    ],
  },
  {
    id: "alcohol", num: "03", title: "Alcohol, Bar & Certificates",
    why: "Whoever holds the license decides who pours, who is insured, and when the bar closes.",
    questions: [
      { id: "alcohol-1", text: "Does the venue hold the required liquor license, or is a temporary permit needed?" },
      { id: "alcohol-2", text: "Who obtains the permit, licensed bartenders, security, liquor-liability coverage, and certificate of insurance?" },
      { id: "alcohol-3", text: "Must the venue be named as an additional insured?" },
      { id: "alcohol-4", text: "What time must alcohol service end, and what bar fees apply?" },
    ],
  },
  {
    id: "catering", num: "04", title: "Catering & Kitchen Rules",
    why: "If your caterer cannot cook the way your menu needs, the meal you are picturing may not be possible here.",
    questions: [
      { id: "catering-1", text: "Is catering exclusive, preferred-list only, or open to outside caterers?", star: true },
      { id: "catering-2", text: "May caterers cook on-site?" },
      { id: "catering-3", text: "Can dietary and allergy needs be supported?" },
    ],
  },
  {
    id: "rentals", num: "05", title: "In-House Rentals",
    why: "“Included” can mean anything. Ask exactly what, how many, and in what condition.",
    questions: [
      { id: "rentals-1", text: "Which tables, chairs, linens, tabletop items, bars, staging, dance floors, lounge pieces, and cocktail tables are included?" },
      { id: "rentals-2", text: "What quantities, sizes, colors, and conditions are guaranteed?" },
      { id: "rentals-3", text: "Are delivery, setup, breakdown, cleaning, reset, and damage fees included?" },
      { id: "rentals-4", text: "May the dance floor be wrapped or covered?" },
    ],
  },
  {
    id: "decor", num: "06", title: "Décor Setup & Load-In",
    why: "Your design is only as good as the hours and the access you get to install it.",
    questions: [
      { id: "decor-1", text: "Exactly how many hours are allowed for décor setup before guest arrival?", star: true },
      { id: "decor-2", text: "Exactly how many hours are allowed for décor breakdown and load-out?" },
      { id: "decor-3", text: "Can installation begin the day before, and may décor remain overnight?" },
      { id: "decor-4", text: "Is the space on the same level as the loading entrance?" },
      { id: "decor-5", text: "Is there a loading dock, same-level entry, ramp, or service entrance for large pieces?" },
      { id: "decor-6", text: "Can large installations get into the room?", star: true },
      { id: "decor-7", text: "Is load-in easy for large pieces, or are there stairs and tight turns?" },
      { id: "decor-8", text: "What time must the room be guest-ready?" },
      { id: "decor-9", text: "Are real-flame candles allowed, and what enclosure rule applies?" },
      { id: "decor-10", text: "What may be attached to walls, ceilings, and floors, and are tape, pins, hooks, confetti, loose petals, or sparklers restricted?" },
    ],
  },
  {
    id: "power", num: "07", title: "Power, Rigging & Effects",
    why: "Lighting, music, chandeliers, and first-dance effects all need power and permission.",
    questions: [
      { id: "power-1", text: "How much electrical power is available for lighting, entertainment, catering, and production?" },
      { id: "power-2", text: "May chandeliers, florals, draping, or installations be hung from the ceiling?", star: true },
      { id: "power-3", text: "Are cold-spark machines permitted?" },
      { id: "power-4", text: "Is a low-lying cloud effect permitted for the first dance?" },
      { id: "power-5", text: "Is atmospheric haze permitted for lighting and photography effects?" },
      { id: "power-6", text: "Is there backup power?" },
    ],
  },
  {
    id: "parking", num: "08", title: "Guest Parking, Valet & Arrival",
    why: "Arrival is your guests’ first impression. A long walk in the rain is hard to undo.",
    questions: [
      { id: "parking-1", text: "How many guest parking spaces are available?" },
      { id: "parking-2", text: "Is parking complimentary, validated, or paid by guests?" },
      { id: "parking-3", text: "Is valet required or optional, and what is the fee?" },
      { id: "parking-4", text: "Where are the guest drop-off, accessible drop-off, shuttle, bus, limousine, and rideshare areas?" },
      { id: "parking-5", text: "Is overflow parking available, and is a shuttle required?" },
      { id: "parking-6", text: "Is the path from parking safe, accessible, and well lit in bad weather?" },
    ],
  },
  {
    id: "cost", num: "09", title: "Total Cost & Contract",
    why: "The quote is rarely the total. Every fee you do not ask about shows up later.",
    questions: [
      { id: "cost-1", text: "Does the quote include the venue fee, service charges, taxes, staffing, security, cleaning, rentals, parking, valet, power, overtime, and damage deposits?", star: true },
      { id: "cost-2", text: "Does the contract list setup and breakdown hours, loading access, parking, curfew, catering, alcohol, weather, and overtime terms?" },
      { id: "cost-3", text: "Will every important approval be placed in writing?" },
      { id: "cost-4", text: "What deposit and payment schedule does the venue require, and what are the cancellation and postponement terms?", star: true },
    ],
  },
  {
    id: "mc-ceremonies", num: "i", title: "Ceremonies & Spaces",
    multicultural: true,
    questions: [
      { id: "mc-ceremonies-1", text: "Can the venue host two or more ceremonies, room transformations, rehearsals, and cultural leaders?", star: true },
      { id: "mc-ceremonies-2", text: "Does capacity change for multiple ceremonies or room flips, and how much time is needed between them?" },
      { id: "mc-ceremonies-3", text: "Does the realistic seated capacity still hold with your cultural structures in the room?" },
      { id: "mc-ceremonies-4", text: "Is a prayer, preparation, or ceremonial holding room available?" },
    ],
  },
  {
    id: "mc-fire", num: "ii", title: "Sacred Fire & Ritual Materials",
    multicultural: true,
    questions: [
      { id: "mc-fire-1", text: "Are sacred fire, incense, oil lamps, candles, smoke, rice, petals, powders, water, oils, and ceremonial foods permitted?", star: true },
      { id: "mc-fire-2", text: "What fire-marshal approval, permits, ventilation, protective materials, insurance, cleanup, or staffing are required?" },
    ],
  },
  {
    id: "mc-cuisine", num: "iii", title: "Cultural Cuisine",
    multicultural: true,
    questions: [
      { id: "mc-cuisine-1", text: "May caterers cook on-site, and are tandoors, grills, fryers, woks, propane, refrigeration, water, ice, and waste disposal permitted?" },
      { id: "mc-cuisine-2", text: "Can halal, kosher, Jain, vegetarian, vegan, allergy, fasting, and cross-contact requirements be supported?" },
    ],
  },
  {
    id: "mc-procession", num: "iv", title: "Processions, Attire & Language",
    multicultural: true,
    questions: [
      { id: "mc-procession-1", text: "Can the property support a baraat or other cultural procession, musicians, dancers, animals, or specialty transportation, without blocking valet, parking, traffic, or emergency access?" },
      { id: "mc-procession-2", text: "Are there enough private rooms for attire changes, stylists, family, elders, performers, prayer, nursing, and quiet breaks?" },
      { id: "mc-procession-3", text: "Can programs, signs, screens, ceremonies, interpreters, and announcements use multiple languages?" },
    ],
  },
  {
    id: "mc-timeline", num: "v", title: "Extended Timeline & Guest Experience",
    multicultural: true,
    questions: [
      { id: "mc-timeline-1", text: "Is the rental window long enough for every ceremony, attire change, meal, performance, photo period, room flip, and rest break?" },
      { id: "mc-timeline-2", text: "Where will guests wait during transitions, and can refreshments be served?" },
      { id: "mc-timeline-3", text: "Can décor and ceremonial structures remain overnight with secure storage?" },
    ],
  },
];

export function sectionsFor(edition: "standard" | "multicultural") {
  return CHECKLIST_SECTIONS.filter((section) => edition === "multicultural" || !section.multicultural);
}
