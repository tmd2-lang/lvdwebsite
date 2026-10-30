// node render-video.js <ads dir> <frames dir> <size> [fps] [only these times...]
const path = require("path"), fs = require("fs"), puppeteer = require("puppeteer-core");
const [, , dir, out, size = "feed", fpsArg = "30", ...times] = process.argv;
const [w, h] = size === "story" ? [1080, 1920] : [1080, 1350];
const fps = Number(fpsArg), DURATION = 14;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto(`file://${path.resolve(dir)}/video.html?size=${size}&t=0`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const list = times.length ? times.map(Number) : Array.from({ length: DURATION * fps }, (_, i) => i / fps);
  for (const [i, t] of list.entries()) {
    await page.evaluate((t) => window.seek(t), t);
    const name = times.length ? `t${t}.jpg` : `f${String(i).padStart(4, "0")}.jpg`;
    await page.screenshot({ path: `${out}/${name}`, type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: w, height: h } });
  }
  await browser.close();
  console.log(`${list.length} frames`);
})();
