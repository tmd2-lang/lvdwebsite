import mediaValues from "@/config/media.json";

export type MediaSlotId = keyof typeof mediaValues;

export type MediaSlotDefinition = {
  id: MediaSlotId;
  label: string;
  group: string;
  note: string;
};

export const media = mediaValues;

export const MEDIA_SLOTS: MediaSlotDefinition[] = [
  { id: "home.hero.1", label: "Hero slideshow 1", group: "Homepage", note: "First image visitors see" },
  { id: "home.hero.2", label: "Hero slideshow 2", group: "Homepage", note: "Second slideshow image" },
  { id: "home.hero.3", label: "Hero slideshow 3", group: "Homepage", note: "Third slideshow image" },
  { id: "home.hero.4", label: "Hero slideshow 4", group: "Homepage", note: "Fourth slideshow image" },
  { id: "home.hero.5", label: "Hero slideshow 5", group: "Homepage", note: "Fifth slideshow image" },
  { id: "home.parallax", label: "Full-width divider", group: "Homepage", note: "Large image above Our Work" },
  { id: "home.work.1", label: "Our Work 1", group: "Homepage", note: "Parallax project grid" },
  { id: "home.work.2", label: "Our Work 2", group: "Homepage", note: "Parallax project grid" },
  { id: "home.work.3", label: "Our Work 3", group: "Homepage", note: "Parallax project grid" },
  { id: "home.work.4", label: "Our Work 4", group: "Homepage", note: "Parallax project grid" },
  { id: "home.work.5", label: "Our Work 5", group: "Homepage", note: "Parallax project grid" },
  { id: "home.work.6", label: "Our Work 6", group: "Homepage", note: "Parallax project grid" },
  { id: "home.founder", label: "Meet Irene portrait", group: "Homepage", note: "Founder section" },
  { id: "home.testimonials", label: "Kind Words background", group: "Homepage", note: "Full-section testimonial image" },
  { id: "global.contact", label: "Contact callout", group: "Shared", note: "Used across several pages" },
  { id: "about.hero", label: "About hero", group: "About", note: "Wide floating image" },
  { id: "about.founder", label: "Irene portrait", group: "About", note: "Founder biography image" },
  { id: "about.craft.1", label: "Craft image 1", group: "About", note: "First artistry image" },
  { id: "about.craft.2", label: "Craft image 2", group: "About", note: "Center artistry image" },
  { id: "about.craft.3", label: "Craft image 3", group: "About", note: "Third artistry image" },
  { id: "services.hero", label: "Services hero", group: "Services", note: "Wide services image" },
  { id: "services.capability.1", label: "Full Production", group: "Services", note: "Capability image" },
  { id: "services.capability.2", label: "Floral Design", group: "Services", note: "Capability image" },
  { id: "services.capability.3", label: "Staging & Lighting", group: "Services", note: "Capability image" },
  { id: "services.capability.4", label: "Decor & Rentals", group: "Services", note: "Capability image" },
  { id: "services.occasion.1", label: "Weddings", group: "Services", note: "What we design for" },
  { id: "services.occasion.2", label: "Corporate", group: "Services", note: "What we design for" },
  { id: "services.occasion.3", label: "Private Celebrations", group: "Services", note: "What we design for" },
  { id: "services.occasion.4", label: "Floral Gifting", group: "Services", note: "What we design for" },
  { id: "investments.production", label: "Full Production", group: "Investments", note: "Used on Home and Services" },
  { id: "investments.design-florals", label: "Design + Florals", group: "Investments", note: "Used on Home and Services" },
  { id: "investments.essentials", label: "Elegant", group: "Investments", note: "Used on Home and Services" },
  { id: "inquire.hero", label: "Inquiry image", group: "Inquiry", note: "Sticky image beside the form" }
];

export const MEDIA_SLOT_IDS = new Set<string>(MEDIA_SLOTS.map((slot) => slot.id));
