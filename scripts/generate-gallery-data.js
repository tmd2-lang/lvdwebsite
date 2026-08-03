const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

const galleryPath = path.join(__dirname, '../public/gallery');
const outputPath = path.join(__dirname, '../src/lib/gallery-data.ts');

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
  return {
    ...existingBySrc.get(src),
    src,
    width: dimensions.width,
    height: dimensions.height,
    alt: existingBySrc.get(src)?.alt || "Lady Victoria Designs portfolio image",
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
