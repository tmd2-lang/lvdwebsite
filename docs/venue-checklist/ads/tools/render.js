// node render.js <ads dir> <out dir> [size] [ad ...]
const path = require("path"), fs = require("fs"), puppeteer = require("puppeteer-core");
const [, , dir, out, sizeArg, ...only] = process.argv;
const ADS = ["first-photo", "first-notes", "love-photo", "love-split", "wish-photo", "wish-list", "doc-preview", "cover"];
const SIZES = { feed: [1080, 1350], story: [1080, 1920] };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  for (const size of sizeArg && sizeArg !== "all" ? [sizeArg] : Object.keys(SIZES)) {
    const [w, h] = SIZES[size];
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    for (const ad of only.length ? only : ADS) {
      await page.goto(`file://${path.resolve(dir)}/index.html?ad=${ad}&size=${size}`, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${out}/${ad}-${size}.png`, clip: { x: 0, y: 0, width: w, height: h } });
      console.log(`${ad}-${size}.png`);
    }
  }
  await browser.close();
})();
