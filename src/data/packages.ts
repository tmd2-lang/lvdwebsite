export type PackageId = "venue-finder" | "coordinating" | "partial-planning" | "full-planning";

export interface PlanningPackage {
  id: PackageId;
  number: string;
  name: string;
  shortName: string;
  startingPoint: string;
  highlights: string[];
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

export const PLANNING_PACKAGES: PlanningPackage[] = [
  {
    id: "venue-finder",
    number: "01",
    name: "Venue Discovery & Budget Blueprint",
    shortName: "Venue Discovery",
    startingPoint: "Help us choose a venue and understand our budget.",
    highlights: [
      "Discovery consultation around your vision and priorities",
      "A curated shortlist of 3–5 venues",
      "A realistic budget blueprint and décor feasibility review",
      "Spending strategy and a clear next-steps roadmap",
    ],
    tagline: "Where most couples start.",
    description:
      "Designed for newly engaged couples who feel overwhelmed by the first—and most expensive—decision of wedding planning: choosing the right venue and understanding what their budget can truly support. This service gives couples clarity, confidence, and a strategic foundation before they commit to anything.",
    price: "$850",
    idealFor: "Couples who want a complete strategic foundation before committing to any major wedding decisions.",
    includes: [
      "Discovery consultation to understand your vision, priorities, and non-negotiables",
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
    shortName: "Coordination",
    startingPoint: "We've planned it. Take over the final logistics.",
    highlights: [
      "Review and organization of your existing plans and vendors",
      "Final vendor logistics, floor plan, and guest flow",
      "Master wedding-day timeline and rehearsal coordination",
      "On-site management from setup through breakdown",
    ],
    tagline: "You planned it. We'll carry it.",
    description:
      "Designed for couples who have independently planned their wedding and secured their primary vendors but need professional support bringing every detail together. We organize the existing plans, manage vendor communication and outstanding logistics, build the wedding-day timeline, and oversee the celebration from setup through breakdown.",
    price: "$4,200+",
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
    note: "Vendor sourcing, design development, and budget creation are not included. For support with these, explore Partial Planning or Full Wedding Planning.",
  },
  {
    id: "partial-planning",
    number: "03",
    name: "Partial Planning",
    shortName: "Partial Planning",
    startingPoint: "We've started. Help us finish.",
    highlights: [
      "Everything in Wedding Management & Coordination",
      "Sourcing and booking support for up to 4 remaining vendors",
      "Design guidance, budget tracking, and monthly planning sessions",
      "Guest list and RSVP oversight support, plus rehearsal dinner logistics planning",
    ],
    tagline: "Join partway. Finish together.",
    description:
      "Your venue is booked and some vendors are in place. We step in to organize the remaining decisions, source your outstanding vendors, refine the design direction, and carry your plans through the wedding day.",
    price: "$7,200+",
    idealFor: "Couples with a venue booked and some vendors secured who want professional support completing their plans.",
    includes: [
      "Everything in Wedding Management & Coordination",
      "Vendor sourcing, contract negotiation, and assistance booking up to 4 remaining vendors from your current point forward",
      "Design direction and cohesive styling recommendations across the celebration",
      "Budget tracking and payment schedule management",
      "Monthly planning sessions through the final month",
      "Guest list and RSVP oversight support",
      "Rehearsal dinner logistics coordination (planning only; on-site event coordination is a separate service)",
    ],
    note: "Rehearsal dinner support covers planning and logistics; on-site dinner coordination is quoted separately. Multi-venue, destination, and other complex celebrations may require a custom scope.",
  },
  {
    id: "full-planning",
    number: "04",
    name: "Full Wedding Planning",
    shortName: "Full Planning",
    startingPoint: "Guide and manage the entire process.",
    highlights: [
      "Concept development and mood boards for your approval",
      "Budget development, venue research, and vendor sourcing",
      "Design direction and guest-experience planning",
      "Rehearsal coordination and wedding-day management",
    ],
    tagline: "Concept to fruition. You approve, we execute.",
    description:
      "From the first concept to the final send-off, we research, organize, and manage the details. Our team develops your budget, sources the venue and vendors, presents design concepts, and oversees the wedding day. You review the options, approve the direction, and stay involved wherever you choose.",
    price: "$9,500+",
    idealFor: "Couples who want one team to carry the full planning process, doing the legwork while they review and approve the decisions.",
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
        title: "Concept, Vision & Organization",
        items: [
          "Initial planning consultation to review your vision, priorities, guest count, budget, and planning needs",
          "Mood boards and design concepts developed and presented for your approval",
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
