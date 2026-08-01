const fs = require('fs');
const path = require('path');

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

let imports = '';
let arrayItems = '';

allFiles.forEach((file, index) => {
  // get relative path from src/lib to the image
  // file is absolute.
  // We can just use the public path: '@/../public/gallery/...' or relative
  let relPath = file.split('/public')[1];
  // Next.js static imports require relative path from the current file, or alias
  // Let's use relative from src/lib to public: ../../public...
  let relativePath = '../../public' + relPath;
  
  imports += `import img${index} from '${relativePath}';\n`;
  arrayItems += `  { src: img${index}, alt: "" },\n`;
});

const fileContent = `// Automatically generated static imports
${imports}
export type GalleryImage = {
  src: import("next/image").StaticImageData;
  alt: string;
};

export const galleryImages: GalleryImage[] = [
${arrayItems}];
`;

console.log(fileContent);
