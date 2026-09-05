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
  inclusionSections?: Array<{
    title: string;
    items: string[];
  }>;
  note?: string;
}

// Starting prices are placeholders until Irene confirms real numbers.
export const PLANNING_PACKAGES: PlanningPackage[] = [
  {
    id: "venue-finder",
    number: "01",
    name: "Venue Discovery & Budget Blueprint",
    tagline: "Your most balanced, luxury-accessible option.",
    description:
      "Designed for newly engaged couples who feel overwhelmed by the first—and most expensive—decision of wedding planning: choosing the right venue and understanding what their budget can truly support. This service gives couples clarity, confidence, and a strategic foundation before they commit to anything.",
    price: "$750",
    idealFor: "Couples who want a complete strategic foundation before committing to any major wedding decisions.",
    includes: [
      "A curated shortlist of 3–5 venues selected around your aesthetic, guest count, and preferred location",
      "A realistic budget blueprint covering venue rental ranges, catering estimates, décor and floral feasibility, hidden fees, cost traps, and recommended adjustments",
      "Honest décor feasibility notes for each venue, including ceiling height, rigging points, ballroom limitations, outdoor considerations, and transformation potential",
      "Investment strategy recommendations showing where to allocate, where to save, and how to maximize your budget without compromising your aesthetic",
      "A clear next-steps roadmap for moving forward with confidence",
    ],
  },
  {
    id: "coordinating",
    number: "02",
    name: "Wedding Management & Coordination",
    tagline: "You planned it. We'll carry it.",
    description:
      "Designed for couples who have independently planned their wedding and secured their primary vendors but need professional support bringing every detail together. We organize the existing plans, manage vendor communication and outstanding logistics, build the wedding-day timeline, and oversee the celebration from setup through breakdown.",
    price: "$3,500",
    idealFor: "Couples who have completed most of their planning and secured their primary vendor team.",
    includes: [
      "A comprehensive review and organization of existing plans, booked vendors, contracts, contacts, payment deadlines, milestones, and outstanding decisions",
      "Ongoing check-ins and vendor communication to keep final logistics, arrival schedules, setup, service, and breakdown on track",
      "Coordination of ceremony, cocktail hour, reception, floor-plan, guest-flow, final guest-count, and seating details with the venue and vendor team",
      "A final venue walkthrough, master wedding-day timeline, vendor confirmations, and distribution of finalized logistical details",
      "Rehearsal coordination and on-site wedding-day management, including formalities, transitions, troubleshooting, and breakdown oversight",
    ],
    inclusionSections: [
      {
        title: "Plan Review & Organization",
        items: [
          "Initial coordination consultation and comprehensive review of all existing wedding plans",
          "Review and organization of booked vendors, contracts, contact information, and outstanding requirements",
          "Creation of a master vendor contact list",
          "Review of upcoming vendor payment deadlines and planning milestones",
          "Identification of outstanding logistical details, missing information, or decisions requiring attention",
          "Ongoing check-ins during the coordination period to keep final preparations on track",
        ],
      },
      {
        title: "Vendor, Venue & Guest Logistics",
        items: [
          "Communication with contracted vendors regarding wedding-day logistics and requirements",
          "Coordination of vendor arrival, setup, service, and breakdown schedules",
          "Review and coordination of ceremony, cocktail hour, and reception logistics",
          "Assistance finalizing the wedding-day floor plan and guest flow with the venue and applicable vendors",
          "Coordination of final guest count and seating-related details as applicable",
          "Final venue walkthrough, when applicable",
        ],
      },
      {
        title: "Timeline & Final Preparations",
        items: [
          "Creation of a comprehensive wedding-day master timeline",
          "Distribution of the finalized timeline and logistical information to the vendor team",
          "Final vendor confirmations prior to the wedding",
          "Rehearsal coordination, when applicable",
        ],
      },
      {
        title: "Wedding-Day Management",
        items: [
          "On-site wedding-day coordination during the contracted service period",
          "Oversight of vendor arrivals and setup",
          "Management of the ceremony processional and recessional",
          "Cueing of the wedding party, entertainment, speeches, special dances, cake cutting, and other scheduled formalities",
          "Management of the wedding-day timeline and transitions between ceremony, cocktail hour, and reception",
          "Primary point of contact for the venue and vendors throughout the wedding day",
          "Troubleshooting and management of reasonable wedding-day issues and schedule adjustments",
          "Oversight of breakdown responsibilities and collection of designated personal items at the conclusion of the event",
        ],
      },
    ],
    note: "Full vendor sourcing, extensive design development, budget creation and management, and comprehensive planning from the beginning of the engagement are not included. These services may require an upgrade to Full Wedding Planning or a separate quote.",
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
      "Everything in Wedding Management & Coordination",
      "Vendor sourcing and contract negotiation from your current point forward",
      "Design direction and cohesive styling across the celebration",
      "Budget tracking and payment schedule management",
      "Monthly planning sessions until the final month",
    ],
  },
  {
    id: "full-planning",
    number: "04",
    name: "Full Wedding Planning",
    tagline: "Your planning partner from the first decision to the final send-off.",
    description:
      "Comprehensive planning for couples who want professional guidance and hands-on support throughout the entire process. From establishing the budget and securing the venue to managing vendors, refining the design, and executing the wedding day, Lady Victoria Designs serves as your planning partner and central point of contact.",
    price: "$6,500",
    idealFor: "Couples who want one experienced team to organize the full planning process while they remain involved in the decisions that make the wedding personal.",
    includes: [
      "A customized planning roadmap, ongoing planning meetings, and organization of contracts, vendor details, payments, deadlines, and outstanding decisions",
      "Budget creation, recommended allocations, ongoing tracking, payment reminders, and vendor proposal review",
      "Venue research, availability and pricing outreach, comparisons, tour coordination, and logistical review",
      "Vendor sourcing, proposal collection, consultation coordination, and ongoing communication across the full vendor team",
      "Creative direction and coordination for the wedding aesthetic, florals, rentals, stationery, lighting, décor, guest experience, catering, bar, and reception flow",
      "Floor-plan and rental logistics, a comprehensive master timeline, contingency planning, rehearsal coordination, and on-site wedding-day management",
    ],
    inclusionSections: [
      {
        title: "Planning & Organization",
        items: [
          "Initial planning consultation to review your vision, priorities, guest count, budget, and planning needs",
          "Customized planning roadmap with key milestones, deadlines, and next steps",
          "Ongoing planning meetings and communication throughout the planning process",
          "Organization and tracking of contracts, vendor details, payments, deadlines, and outstanding decisions",
        ],
      },
      {
        title: "Budget Development & Management",
        items: [
          "Creation of a working wedding budget based on priorities, guest count, and overall vision",
          "Recommended budget allocations across major wedding categories",
          "Ongoing budget tracking as vendors are selected and plans evolve",
          "Payment schedule tracking and reminders for upcoming vendor balances",
          "Review of vendor proposals and pricing to help maintain alignment with the overall budget",
        ],
      },
      {
        title: "Venue Sourcing & Selection",
        items: [
          "Research of venues based on location, guest count, aesthetic, budget, availability, and logistical requirements",
          "Venue outreach for availability, pricing, packages, policies, and inclusions",
          "Venue comparison and recommendation support",
          "Coordination of venue tours and walkthroughs",
          "Review of ceremony, cocktail hour, reception, access, setup, breakdown, and event-ending requirements",
        ],
      },
      {
        title: "Vendor Sourcing & Management",
        items: [
          "Curated vendor recommendations based on style, needs, and budget",
          "Assistance sourcing photography, videography, catering, entertainment, florals, rentals, cake, beauty, transportation, stationery, and specialty vendors as needed",
          "Vendor availability inquiries, proposal collection, and comparison assistance",
          "Coordination of consultations and meetings with prospective vendors",
          "Ongoing communication and logistics coordination with the selected vendor team",
        ],
      },
      {
        title: "Wedding Design & Creative Direction",
        items: [
          "Refinement of the overall wedding aesthetic, color palette, and design direction",
          "Guidance for ceremony, cocktail hour, and reception design",
          "Coordination of florals, rentals, linens, tabletop selections, signage, stationery, lighting, and décor elements",
          "Review of design proposals and assistance with final selections",
          "Development of a cohesive guest experience that reflects the couple’s vision",
        ],
      },
      {
        title: "Guest Experience & Wedding Details",
        items: [
          "Guidance on invitation and RSVP timelines",
          "Assistance with seating and guest-flow planning",
          "Coordination of hotel blocks and transportation logistics when applicable",
          "Planning support for welcome signage, favors, guest books, specialty displays, and personal details",
          "Coordination of wedding-party and family logistics that affect the event",
        ],
      },
      {
        title: "Catering, Bar & Reception Planning",
        items: [
          "Coordination of menu planning, tastings, and catering deadlines",
          "Guidance on bar selections and beverage service",
          "Planning of reception flow, meal service, entertainment, speeches, special dances, cake cutting, and other formalities",
          "Coordination of cake, dessert, and specialty food or beverage moments",
        ],
      },
      {
        title: "Floor Plans, Rentals & Logistics",
        items: [
          "Development and review of event floor-plan needs with the venue and appropriate vendors",
          "Planning for guest seating, dance floor, entertainment, bars, lounges, staging, and specialty installations",
          "Rental quantity and delivery or pickup coordination",
          "Review of venue access, load-in and load-out, parking, power, production, and setup requirements",
        ],
      },
      {
        title: "Wedding Timeline & Final Preparations",
        items: [
          "Creation of a comprehensive wedding-day master timeline",
          "Coordination of vendor arrival, setup, photography, ceremony, cocktail hour, reception, and breakdown timing",
          "Final confirmation of vendor contacts, responsibilities, and logistics",
          "Final venue walkthrough when applicable",
          "Distribution of the finalized timeline and key details to the vendor team",
          "Contingency planning for weather, delays, and foreseeable logistical concerns",
        ],
      },
      {
        title: "Rehearsal Coordination",
        items: [
          "Coordination of the wedding rehearsal, subject to venue access and scheduling",
          "Organization of the ceremony processional and recessional",
          "Review of timing, positioning, cues, and responsibilities with the wedding party and key participants",
        ],
      },
      {
        title: "Wedding-Day Coordination & Execution",
        items: [
          "On-site management of the wedding day within the contracted service hours",
          "Primary point of contact for the venue and vendor team",
          "Oversight of vendor arrivals, setup, and placement according to the approved plan",
          "Management of the master timeline and ceremony or reception transitions",
          "Cueing of the wedding party, entertainment, speeches, special dances, cake cutting, and planned formalities",
          "Monitoring of décor and room setup for consistency with the approved design plan",
          "Troubleshooting and management of reasonable day-of changes or issues",
          "Coordination of breakdown responsibilities and collection of designated personal items at the conclusion of the event",
        ],
      },
    ],
    note: "Floral design, décor production, rentals, installations, and other third-party products or services are quoted separately based on the final wedding design and scope.",
  },
];
