export type PackageId = "venue-finder" | "coordinating" | "partial-planning" | "full-planning";

export interface PlanningPackage {
  id: PackageId;
  number: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  idealFor: string;
  includes: string[];
}

// Starting prices are placeholders until Irene confirms real numbers.
export const PLANNING_PACKAGES: PlanningPackage[] = [
  {
    id: "venue-finder",
    number: "01",
    name: "Venue Finder",
    tagline: "Find the room before you plan the rest.",
    description:
      "The venue sets your date, your guest count, and the budget everything else lives inside. We help you find the right one first, so every decision after it is made on solid ground.",
    price: "Custom quote",
    idealFor: "Couples who are newly engaged and want the venue settled before anything else begins.",
    includes: [
      "A shortlist of venues matched to your guest count, season, and budget",
      "Site tours arranged and attended with you",
      "Side-by-side comparison of pricing, inclusions, and restrictions",
      "Contract review before you sign",
      "Introductions to preferred vendors at your chosen venue",
    ],
  },
  {
    id: "coordinating",
    number: "02",
    name: "Coordinating",
    tagline: "You planned it. We'll carry it.",
    description:
      "You have made the decisions and booked the vendors. In the final weeks we take the whole plan off your hands, confirm every detail, and run the day itself so you are a guest at your own celebration.",
    price: "Custom quote",
    idealFor: "Couples who have planned their own celebration and want it executed flawlessly.",
    includes: [
      "Vendor confirmations and final payments schedule",
      "A minute-by-minute timeline built and shared with every vendor",
      "Final venue walkthrough",
      "Rehearsal direction",
      "Full day-of management from setup through strike",
    ],
  },
  {
    id: "partial-planning",
    number: "03",
    name: "Partial Planning",
    tagline: "Join partway. Finish together.",
    description:
      "For celebrations already underway that need a steadier hand the rest of the way. We pick up from wherever you are, take over what is unfinished, and see it through to the last dance.",
    price: "Custom quote",
    idealFor: "Couples who started strong and want a professional to carry the remaining decisions.",
    includes: [
      "Everything in Coordinating",
      "Vendor sourcing and contract negotiation from your current point forward",
      "Design direction and cohesive styling across the celebration",
      "Budget tracking and payment schedule management",
      "Monthly planning sessions until the final month",
    ],
  },
  {
    id: "full-planning",
    number: "04",
    name: "Full Planning",
    tagline: "From engagement to send-off.",
    description:
      "The complete experience. We are with you from the first conversation through the final send-off, managing design, vendors, budget, logistics, and every decision in between.",
    price: "Custom quote",
    idealFor: "Couples who want one accountable team from the very beginning.",
    includes: [
      "Everything in Partial Planning",
      "Venue search and selection",
      "Full creative direction and design development",
      "Complete vendor curation, booking, and management",
      "Guest experience, travel, and accommodation coordination",
      "Unlimited planning sessions throughout",
    ],
  },
];
