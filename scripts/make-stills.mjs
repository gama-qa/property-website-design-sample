// Build the walkthrough images: max 2000px wide, JPEG quality 82.
//
//   node scripts/make-stills.mjs
//
// - Poster: frame 0 of the video, so the poster-to-video handoff has no jump.
// - Room stills: the owner's photographs in /source-video (2752x1536), one per
//   room. They are sharper than the 720p footage and are used for the still
//   fallback, the loading state and the property listing.
//
// Keep slugs and room ids in sync with src/data/walkthrough.json.
// Only the current source-video material is used; earlier stills (house-01-*,
// apartment-01-*) are retired and referenced nowhere.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "source-video");
const out = join(root, "public", "images", "stills");
mkdirSync(out, { recursive: true });

const clips = [
  {
    slug: "house-02",
    video: "property-1.mp4",
    posterTime: 0,
    // room id -> photograph (file names as supplied by the owner)
    photos: {
      exterior: "Exterior.jpg",
      entrance: "enterance.jpg",
      living: "living-room.jpg",
      kitchen: "kitchen.jpg",
      bedroom: "bedroom.jpg",
      terrace: "terrace.jpg",
    },
  },
];

async function save(input, name) {
  const info = await sharp(input)
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(join(out, name));
  console.log(`${name}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

for (const clip of clips) {
  const png = execFileSync(
    "ffmpeg",
    ["-v", "error", "-ss", String(clip.posterTime), "-i", join(src, clip.video), "-frames:v", "1", "-vf", "format=rgb24", "-f", "image2pipe", "-c:v", "png", "-"],
    { maxBuffer: 256 * 1024 * 1024 },
  );
  // The poster fills the screen before the video takes over, so the 720p frame
  // is enlarged here with Lanczos and lightly sharpened (better than letting
  // the browser stretch it), and saved at higher quality. Served unoptimized.
  const poster = await sharp(png)
    .resize({ width: 1920, kernel: "lanczos3" })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.2 })
    .jpeg({ quality: 90, mozjpeg: true, progressive: true })
    .toFile(join(out, `${clip.slug}-poster.jpg`));
  console.log(`${clip.slug}-poster.jpg  ${poster.width}x${poster.height}  ${(poster.size / 1024).toFixed(0)} KB`);
  for (const [room, file] of Object.entries(clip.photos)) {
    await save(join(src, file), `${clip.slug}-${room}.jpg`);
  }
}
