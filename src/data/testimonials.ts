export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  highlight?: string;
  rating: number;
  date?: string;
  source: string;
  category: "All" | "Weddings" | "Full Production" | "Design & Florals";
  service: string;
  image?: string;
};

export const testimonialsData: Testimonial[] = [
  {
    id: "latisha",
    name: "Latisha M.",
    role: "Bride · Luxury Wedding Celebration",
    quote: "Working with Irene for my wedding was the best decision that we made! From day one, the level of professionalism, design recommendations, and dedication were unmatched. Day of, words cannot describe, everything was beautiful beyond my imagination. She truly brought our vision to life.",
    highlight: "Words cannot describe, everything was beautiful beyond my imagination.",
    rating: 5,
    source: "Verified Google Review",
    category: "Weddings",
    service: "Full Production & Floral Design",
    image: "/gallery/aniedi-ekemini/aniedi-ekemini-01.jpg"
  },
  {
    id: "scott",
    name: "Scott W.",
    role: "Groom · Luxury Estate Wedding",
    quote: "From the moment I met Irene, I knew there was no one else I would rather work with. She was very professional and attentive to all our needs. She took our loose ideas and Pinterest boards and completely exceeded our expectations. The guests couldn't stop talking about how breathtaking the room looked.",
    highlight: "She took our loose ideas and completely exceeded our expectations.",
    rating: 5,
    source: "Verified Google Review",
    category: "Full Production",
    service: "Full Production & Design",
    image: "/gallery/amber-kendall/amber-kendall-06.jpeg"
  },
  {
    id: "nicole-eric",
    name: "Nicole & Eric",
    role: "Bride & Groom · Grand Ballroom Wedding",
    quote: "Lady Victoria Designs made our wedding day look absolutely stunning. Irene made the entire planning process stress-free. Every detail from the grand floral installations to the ambient candlelight was perfection. 10/10 would highly recommend if you care about quality and want the absolute best in the business.",
    highlight: "10/10 would highly recommend if you want the absolute best in the business.",
    rating: 5,
    source: "Verified Google Review",
    category: "Weddings",
    service: "Floral & Event Architecture",
    image: "/gallery/aniedi-ekemini/aniedi-ekemini-13.jpg"
  },
  {
    id: "nawa",
    name: "Nawa A.",
    role: "Bride · Editorial Wedding",
    quote: "Irene was an absolute joy to work with. She was professional and kind throughout the entire process, and I was so impressed with her ability to remain joyful and poised even through stressful times. Her creative eye and precision are world-class.",
    highlight: "Her creative eye and precision are world-class.",
    rating: 5,
    source: "Verified Google Review",
    category: "Design & Florals",
    service: "Bespoke Floral Design"
  },
  {
    id: "dean",
    name: "Dean P.",
    role: "Client · Signature Wedding",
    quote: "Delighted with the work from Lady Victoria Designs. The attention to detail on every element was thoughtfully executed, elegant, and seamlessly integrated with the overall luxury atmosphere of our wedding. Truly elevated our celebration to another level.",
    highlight: "Truly elevated our celebration to another level.",
    rating: 5,
    source: "Verified Google Review",
    category: "Weddings",
    service: "Floral & Decor Design"
  },
  {
    id: "ashley-michael",
    name: "Ashley & Michael",
    role: "Bride & Groom · Destination Wedding",
    quote: "Irene is an absolute visionary. We hired Lady Victoria Designs for our multi-day wedding and she executed every phase flawlessly. The ceremony arch was a monumental work of art, and the ballroom transformation took everyone's breath away. Worth every single penny.",
    highlight: "The ballroom transformation took everyone's breath away.",
    rating: 5,
    source: "Verified Google Review",
    category: "Full Production",
    service: "Full Production & Spatial Design",
    image: "/gallery/purple-grandeur/purple-grandeur-02.jpg"
  },
  {
    id: "victoria-james",
    name: "Victoria & James",
    role: "Bride · Luxury Reception",
    quote: "The florals were beyond anything I could have ever dreamed of. Irene listened to every single nuance of what I wanted and created something that felt so unique to us. Walking into the reception space brought tears of joy to my eyes.",
    highlight: "Walking into the reception space brought tears of joy to my eyes.",
    rating: 5,
    source: "Verified Google Review",
    category: "Design & Florals",
    service: "Luxury Floral Artistry",
    image: "/gallery/aniedi-ekemini/aniedi-ekemini-12.jpg"
  },
  {
    id: "kendra",
    name: "Kendra T.",
    role: "Bride · Private Estate Celebration",
    quote: "Irene went above and beyond for our celebration. Her communication was prompt, her contracts and design decks were immaculate, and her team on event day was exceptionally professional. I will recommend her to every bride I know.",
    highlight: "Her contracts and design decks were immaculate, and her team was exceptionally professional.",
    rating: 5,
    source: "Verified Google Review",
    category: "Weddings",
    service: "Wedding Design & Production"
  },
  {
    id: "marcus-brianna",
    name: "Marcus & Brianna",
    role: "Couple · Luxury Celebration",
    quote: "The level of elegance and artistry that Lady Victoria Designs delivers is unmatched in the industry. The floral chandeliers and tablescapes set an unforgettable mood for the evening.",
    highlight: "The level of elegance and artistry is unmatched in the industry.",
    rating: 5,
    source: "Verified Google Review",
    category: "Design & Florals",
    service: "Grand Installation Design"
  }
];
