const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

const galleryPath = path.join(__dirname, '../public/gallery');
const outputPath = path.join(__dirname, '../src/lib/gallery-data.ts');

const collectionDefaults = {
  'amber-kendall': {
    alt: 'Amber & Kendall Wedding - Lady Victoria Designs',
    collection: 'Amber & Kendall Wedding',
    category: 'Weddings',
    slug: 'amber-kendall',
  },
  'jenny-jordan': {
    alt: 'Jenny & Jordan Wedding - Lady Victoria Designs',
    collection: 'Jenny & Jordan Wedding',
    category: 'Weddings',
    slug: 'jenny-jordan',
  },
  'purple-grandeur': {
    alt: 'Purple Grandeur Floral Design - Lady Victoria Designs',
    collection: 'Purple Grandeur',
    category: 'Artistry',
    slug: 'purple-grandeur',
  },
  'white-green-botanicals': {
    alt: 'White & Green Botanicals - Lady Victoria Designs',
    collection: 'White & Green Botanicals',
    category: 'Ceremonies',
    slug: 'white-green-botanicals',
  },
  'two-tone-luxe': {
    alt: 'Two-Tone Luxe Wedding Design - Lady Victoria Designs',
    collection: 'Two-Tone Luxe',
    category: 'Receptions',
    slug: 'two-tone-luxe',
  },
  'r-and-j': {
    alt: 'R & J Editorial Celebration - Lady Victoria Designs',
    collection: 'R & J Editorial Celebration',
    category: 'Weddings',
    slug: 'r-and-j',
  },
  'curated-installations': {
    alt: 'Curated Floral Masterpiece - Lady Victoria Designs',
    collection: 'Curated Masterpieces',
    category: 'Artistry',
    slug: 'curated-installations',
  },
  'estate-florals': {
    alt: 'Estate Florals & Sculptural Design - Lady Victoria Designs',
    collection: 'Estate Florals',
    category: 'Weddings',
    slug: 'estate-florals',
  },
  'table-artistry': {
    alt: 'Bespoke Table Artistry - Lady Victoria Designs',
    collection: 'Bespoke Table Artistry',
    category: 'Tablescapes',
    slug: 'table-artistry',
  },
  'classic-wedding-archive': {
    alt: 'Classic Wedding Archive - Lady Victoria Designs',
    collection: 'Classic Wedding Archive',
    category: 'Weddings',
    slug: 'classic-wedding-archive',
  },
  'white-silver-reception': {
    alt: 'White & Silver Reception - Lady Victoria Designs',
    collection: 'White & Silver Reception',
    category: 'Receptions',
    slug: 'white-silver-reception',
  },
  'editorial-wedding-archive': {
    alt: 'Editorial Wedding Archive - Lady Victoria Designs',
    collection: 'Editorial Wedding Archive',
    category: 'Weddings',
    slug: 'editorial-wedding-archive',
  },
  'grand-staircase-wedding': {
    alt: 'Grand Staircase Wedding - Lady Victoria Designs',
    collection: 'Grand Staircase Wedding',
    category: 'Weddings',
    slug: 'grand-staircase-wedding',
  },
};

function getImagesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getImagesRecursively(file));
    } else {
      if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = getImagesRecursively(galleryPath);
allFiles.sort();

const existingSource = fs.readFileSync(outputPath, 'utf8');
const existingArray = existingSource.match(/export const galleryImages: GalleryImage\[\] = (\[[\s\S]*\]);/);
const existingImages = existingArray ? JSON.parse(existingArray[1]) : [];
const existingBySrc = new Map(existingImages.map((image) => [image.src, image]));

const data = allFiles.map((file) => {
  const dimensions = imageSize(fs.readFileSync(file));
  const src = file.split('/public')[1];
  const folder = path.basename(path.dirname(file));
  const existingImage = existingBySrc.get(src);
  const defaults = collectionDefaults[folder] || {
    alt: `${folder.replace(/-/g, ' ')} - Lady Victoria Designs`,
    collection: folder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: 'Artistry',
    slug: folder,
  };
  return {
    src,
    width: dimensions.width,
    height: dimensions.height,
    alt: existingImage?.alt || defaults.alt,
    collection: existingImage?.collection || defaults.collection,
    category: existingImage?.category || defaults.category,
    slug: existingImage?.slug || defaults.slug,
  };
});

const fileContent = `export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  collection: string;
  category: string;
  slug: string;
};

export const galleryImages: GalleryImage[] = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outputPath, fileContent);
console.log('Successfully generated gallery-data.ts with image dimensions.');
