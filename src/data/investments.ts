import { media } from "@/lib/media-slots";

export interface DeliverableItem {
  bold: string;
  text: string;
}

export interface InvestmentTierData {
  id: "production" | "design-florals" | "essentials";
  tierNumber: string;
  tierLabel: string;
  isSignature?: boolean;
  name: string;
  price: string;
  tagline: string;
  desc: string;
  idealFor: string;
  image: string;
  deliverables: DeliverableItem[];
  subtext: string;
  inquireQuery: string;
}

export const INVESTMENT_TIERS: InvestmentTierData[] = [
  {
    id: "production",
    tierNumber: "01",
    tierLabel: "TIER ONE · SIGNATURE",
    isSignature: true,
    name: "The Full Production",
    price: "Starting at $55,000",
    tagline: "Walk in. Fall in love. Remember forever.",
    desc: "For couples who want a breathtaking, fully immersive wedding environment. Irene and our lead production team take complete ownership of your spatial story—unifying design, florals, custom fabrication, and seamless day-of execution.",
    idealFor: "Grand ballroom transformations, custom tented estates, historic mansions, and multi-day celebrations requiring high-touch production management.",
    image: media["investments.production"],
    deliverables: [
      {
        bold: "High-Level Creative Direction",
        text: "Deep-dive spatial design sessions, comprehensive mood board styling, custom color harmony, and unlimited vision refinements.",
      },
      {
        bold: "Full Bridal Party & Personal Florals",
        text: "Bespoke bridal bouquet, groom's boutonnière, attendant bouquets, boutonnieres, corsages, and family personal florals.",
      },
      {
        bold: "Bespoke Ceremony Architecture",
        text: "Grand entrance floral statements, continuous aisle meadows, architectural floral arch / canopy backdrop, and custom candle styling.",
      },
      {
        bold: "Immersive Reception Installations",
        text: "Suspended floral chandelier treatments, ceiling trusses, multi-tiered dynamic centerpieces, and custom sweetheart canopy styling.",
      },
      {
        bold: "Full Production & Fabrication",
        text: "Architectural lighting design, custom drapery, stage wraps, bespoke dance floor wrapping, and premium rental curation (custom lounge suites, designer bar fronts, and bespoke signage).",
      },
      {
        bold: "Comprehensive Lead Team Execution",
        text: "Our lead designers and full technical crew manage every stage from early morning load-in through midnight strike and breakdown.",
      },
    ],
    subtext: "* Final pricing is customized based on guest count, venue scale, and bespoke production elements.",
    inquireQuery: "Full Production ($55k+)",
  },
  {
    id: "design-florals",
    tierNumber: "02",
    tierLabel: "TIER TWO",
    isSignature: false,
    name: "Design + Florals",
    price: "FROM $20,000 – $35,000",
    tagline: "Elevated design, thoughtfully layered.",
    desc: "For couples seeking a lush, layered aesthetic with custom floral artistry and curated styling that elevates every guest touchpoint.",
    idealFor: "Couples with established venues looking to transform their ceremony and reception with tailored floral artistry, custom tabletop styling, and curated accent rentals.",
    image: media["investments.design-florals"],
    deliverables: [
      {
        bold: "Curated Design Direction",
        text: "Personalized aesthetic blueprint, color palette guidance, and cohesive styling strategy tailored to your venue.",
      },
      {
        bold: "Full Bridal Party Florals",
        text: "Custom bridal bouquet, groom's boutonnière, attendant bouquets, boutonnieres, corsages, and family flowers.",
      },
      {
        bold: "Custom Ceremony Design",
        text: "Bespoke floral arch or structural backdrop, accented with aisle markers or romantic petal placement.",
      },
      {
        bold: "Elevated Reception Tablescapes",
        text: "Full floral centerpieces featuring dynamic height variation (low garden bowls & elevated stands), candle clusters, and accent décor.",
      },
      {
        bold: "Sweetheart Area Styling",
        text: "Lush floral focal point and coordinated specialty linen styling.",
      },
      {
        bold: "Enhanced Rentals & Management",
        text: "Specialty tabletop rentals (chargers, custom napkins, fine glassware), accent lounge furniture, and full delivery, installation, and on-site coordination.",
      },
    ],
    subtext: "* Final pricing is customized based on guest count and design selections.",
    inquireQuery: "Design + Florals ($20k-$35k)",
  },
  {
    id: "essentials",
    tierNumber: "03",
    tierLabel: "TIER THREE",
    isSignature: false,
    name: "Elegant",
    price: "FROM $8,000 – $15,000",
    tagline: "Where your vision begins to bloom.",
    desc: "Perfect for couples who want beautifully cohesive florals and considered styling for intimate weddings and celebrations without managing multiple vendors.",
    idealFor: "Intimate gatherings, boutique venues, micro-weddings, and private estate dinners with refined floral focus.",
    image: media["investments.essentials"],
    deliverables: [
      {
        bold: "Personal Florals",
        text: "Signature bridal bouquet and groom's boutonnière crafted with premium seasonal blooms.",
      },
      {
        bold: "Ceremony Backdrop",
        text: "Clean, elegant draped arch or tailored floral pillars, designed to seamlessly repurpose for reception focal moments.",
      },
      {
        bold: "Reception Centerpieces",
        text: "Harmonious mix of low lush arrangements, delicate bud vase groupings, and ambient candle styling (votives and taper candles).",
      },
      {
        bold: "Sweetheart Area",
        text: "Floral accent arrangement paired with coordinated table and linen styling.",
      },
      {
        bold: "Select Rental Pieces",
        text: "Sweetheart chairs, accent furniture, minimal tabletop décor, and specialty candleware.",
      },
      {
        bold: "Setup & On-Site Oversight",
        text: "Lady Victoria design team on-site for white-glove installation, room placement, and final styling.",
      },
    ],
    subtext: "* Final pricing varies based on guest count and floral selections.",
    inquireQuery: "Elegant ($8k-$15k)",
  },
];
