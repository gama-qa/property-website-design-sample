// Listing photographs for the five properties that have no footage of their own.
//
//   node scripts/make-listing-images.mjs
//
// Sources are stock photographs from Pexels (Pexels licence: free to use,
// attribution not required, may be modified; must not be resold unaltered or
// redistributed on other stock platforms). The owner asked for these on
// 2026-11-16 so the listings stop showing the same house.
//
// Originals live in /source-images/pexels/<id>.jpg (downloaded once from
// https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg). This script
// only resizes them: max 2000px wide, JPEG quality 82. Nothing is hotlinked.
// Credits are also written to /public/images/listings/CREDITS.md.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "source-images", "pexels");
const out = join(root, "public", "images", "listings");
mkdirSync(out, { recursive: true });

// slug -> [main, second]; keep in sync with src/data/properties.ts
export const listingPhotos = [
  { slug: "menteng-low-rise-flat", n: 1, id: 7031720, by: "Max Vakhtbovych", page: "spacious-apartment-with-living-room-and-bedroom-and-wooden-furniture-7031720" },
  { slug: "menteng-low-rise-flat", n: 2, id: 6284232, by: "Max Vakhtbovych", page: "interior-of-modern-bedroom-with-soft-bed-and-wooden-walls-6284232" },
  { slug: "senopati-garden-residence", n: 1, id: 6430734, by: "Skylar Kang", page: "backyard-of-modern-residential-villa-with-comfy-wicker-furniture-and-tropical-plants-6430734" },
  { slug: "senopati-garden-residence", n: 2, id: 18470969, by: "Alan Antony", page: "small-living-room-in-the-apartment-18470969" },
  { slug: "bsd-cluster-house", n: 1, id: 35361412, by: "Alef Morais", page: "modern-luxury-house-with-glass-windows-and-wooden-finish-35361412" },
  { slug: "bsd-cluster-house", n: 2, id: 10153052, by: "Jonathan Borba", page: "interior-design-of-a-kitchen-10153052" },
  { slug: "pik-two-bedroom", n: 1, id: 7160605, by: "Dorin Ursulescu", page: "a-beige-sofa-in-the-living-room-7160605" },
  { slug: "pik-two-bedroom", n: 2, id: 6480212, by: "Max Vakhtbovych", page: "interior-of-house-with-bed-near-lamps-and-armchair-6480212" },
  { slug: "senopati-one-bedroom", n: 1, id: 19050701, by: "Gül Işık", page: "large-windows-in-living-room-19050701" },
  { slug: "senopati-one-bedroom", n: 2, id: 7147286, by: "Max Vakhtbovych", page: "interior-of-minimalist-kitchen-with-wooden-furniture-and-island-7147286" },
];

const lines = [
  "# Listing photographs: sources",
  "",
  "Stock photographs from Pexels, used under the Pexels licence (free to use, attribution not required).",
  "They are representative interiors for fictional listings, not photographs of real properties for rent.",
  "",
  "| File | Photographer | Source |",
  "|---|---|---|",
];

for (const p of listingPhotos) {
  const name = `${p.slug}-${p.n}.jpg`;
  const info = await sharp(join(src, `${p.id}.jpg`))
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(join(out, name));
  console.log(`${name}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB  (${p.by})`);
  lines.push(`| ${name} | ${p.by} | https://www.pexels.com/photo/${p.page}/ |`);
}

writeFileSync(join(out, "CREDITS.md"), lines.join("\n") + "\n");
