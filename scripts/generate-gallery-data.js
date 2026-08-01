const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

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

const data = allFiles.map((file) => {
  const dimensions = sizeOf(file);
  const src = file.split('/public')[1];
  return {
    src,
    width: dimensions.width,
    height: dimensions.height,
    alt: ""
  };
});

const fileContent = `export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const galleryImages: GalleryImage[] = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outputPath, fileContent);
console.log('Successfully generated gallery-data.ts with image dimensions.');
