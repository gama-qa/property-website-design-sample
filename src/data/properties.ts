/**
 * Fictional listings for the sample site. Copy is Indonesian (owner's request,
 * 2026-11-16). Numbers are plausible for the premium rental segment in Jakarta
 * and are kept consistent across list, detail and walkthrough. No reviews,
 * ratings or vanity stats.
 *
 * IMAGE MAPPING
 * ---------------------------------------------------------------------
 * - kemang-garden-house: the owner's own material. One video (house-02) and six
 *   photographs of the same house: exterior, entrance, living, kitchen, bedroom,
 *   terrace. The only listing with a walkthrough.
 *
 * - The other five listings use stock photographs from Pexels (owner's request,
 *   so the listings stop showing the same house). Two per listing: a main image
 *   and a second one for the hover crossfade and the carousel. Sources and
 *   photographers: public/images/listings/CREDITS.md, built by
 *   scripts/make-listing-images.mjs. They are representative interiors, not
 *   photographs of real properties for rent.
 *
 * Every listing's facts (floor, description, amenities) were written to agree
 * with what its photographs show. If an image changes, re-check the copy.
 */

export type PropertyType = "apartment" | "house";
export type Area = "Kemang" | "Senopati" | "Menteng" | "BSD City" | "Pantai Indah Kapuk";
export type Orientation = "Utara" | "Timur Laut" | "Timur" | "Tenggara" | "Selatan" | "Barat Daya" | "Barat" | "Barat Laut";
export type Furnishing = "Perabot lengkap" | "Perabot sebagian" | "Tanpa perabot";

/** Display label for a property type. */
export const TYPE_LABEL: Record<PropertyType, string> = { apartment: "Apartemen", house: "Rumah" };

export type PropertyImage = {
  src: string;
  /** Describes what is actually in the frame. */
  alt: string;
};

export type NearbyPoint = {
  name: string;
  distanceKm: number;
};

export type Property = {
  slug: string;
  name: string;
  type: PropertyType;
  area: Area;
  /** General location only, no street number. */
  address: string;
  /** IDR per month. */
  pricePerMonth: number;
  /** Months. */
  minimumLease: number;
  /** Months of rent. */
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  /** Apartments: internal area. Houses: building area (land area in description). */
  sizeM2: number;
  floor: string;
  orientation: Orientation;
  furnishing: Furnishing;
  /** Anything not listed is metered and paid by the tenant. */
  utilitiesIncluded: string[];
  /** Earliest move-in date, ISO yyyy-mm-dd. */
  availability: string;
  /** Max 6. */
  amenities: string[];
  /** Exactly 3. */
  nearby: [NearbyPoint, NearbyPoint, NearbyPoint];
  description: string;
  /** First image is the main image. */
  images: PropertyImage[];
  hasWalkthrough: boolean;
  /** Matches an id in src/data/walkthrough.json. */
  walkthroughId?: "house-02";
};

const STILLS = "/images/stills";
const LISTINGS = "/images/listings";

/** The owner's six photographs of the Kemang house. */
const KEMANG: PropertyImage[] = [
  { src: `${STILLS}/house-02-exterior.jpg`, alt: "Fasad dua lantai dari travertine dan kayu oak dengan pintu depan kayu yang tinggi, taman depan, dan carport berpaving." },
  { src: `${STILLS}/house-02-entrance.jpg`, alt: "Pintu depan kayu oak yang terbuka dan lorong dengan konsol tanam serta cermin dinding, tembus ke ruang keluarga." },
  { src: `${STILLS}/house-02-living.jpg`, alt: "Ruang keluarga berplafon ganda dengan sofa sudut krem, meja kopi kayu oak, dan jendela setinggi dinding yang menghadap tanaman." },
  { src: `${STILLS}/house-02-kitchen.jpg`, alt: "Island dapur travertine dengan dua bangku, kabinet kayu oak, dan meja makan kayu di samping kaca setinggi plafon." },
  { src: `${STILLS}/house-02-bedroom.jpg`, alt: "Kamar tidur dengan ranjang rendah dari kayu oak, sprei linen, lemari tanam, dan tirai tipis di pintu geser." },
  { src: `${STILLS}/house-02-terrace.jpg`, alt: "Teras kayu dengan dua kursi santai dan meja bundar, pot tanaman, dan dinding pembatas bertanaman." },
];

export const properties: Property[] = [
  {
    slug: "kemang-garden-house",
    name: "Rumah Taman Kemang",
    type: "house",
    area: "Kemang",
    address: "Dekat Jalan Kemang Timur, Bangka, Mampang Prapatan, Jakarta Selatan",
    pricePerMonth: 95_000_000,
    minimumLease: 12,
    deposit: 2,
    bedrooms: 4,
    bathrooms: 4,
    sizeM2: 380,
    floor: "2 lantai",
    orientation: "Utara",
    furnishing: "Perabot sebagian",
    utilitiesIncluded: ["Perawatan taman, dua kali sebulan"],
    availability: "2027-01-04",
    amenities: [
      "Ruang keluarga berplafon ganda, tinggi 5,6 m",
      "Island dapur travertine dengan oven tanam",
      "Kamar tidur lantai dasar yang terbuka ke teras",
      "Teras kayu dan taman berdinding",
      "Carport untuk dua mobil",
      "Kamar ART dengan kamar mandi terpisah",
    ],
    nearby: [
      { name: "Jalan Kemang Raya", distanceKm: 0.9 },
      { name: "Lippo Mall Kemang", distanceKm: 1.2 },
      { name: "MRT Haji Nawi", distanceKm: 3.4 },
    ],
    description:
      "Rumah dua lantai berbahan travertine dan kayu oak di atas tanah 450 m². Pintu depan membuka ke lorong yang menyambung ke ruang keluarga berplafon ganda, dengan island dapur dan meja makan di sisi taman. Satu kamar tidur berada di lantai dasar dan terbuka ke teras kayu; tiga lainnya di lantai atas.",
    images: KEMANG,
    hasWalkthrough: true,
    walkthroughId: "house-02",
  },
  {
    slug: "menteng-low-rise-flat",
    name: "Apartemen Low-rise Menteng",
    type: "apartment",
    area: "Menteng",
    address: "Dekat Jalan Teuku Umar, Gondangdia, Menteng, Jakarta Pusat",
    pricePerMonth: 32_000_000,
    minimumLease: 12,
    deposit: 2,
    bedrooms: 2,
    bathrooms: 1,
    sizeM2: 104,
    floor: "Lantai 3 dari 4",
    orientation: "Timur",
    furnishing: "Perabot lengkap",
    utilitiesIncluded: ["Service charge (IPL)", "Air", "Internet 100 Mbps"],
    availability: "2026-12-15",
    amenities: [
      "Gedung empat lantai, 12 unit",
      "Dinding panel kayu di ruang keluarga dan kamar utama",
      "Pintu kaca dari ruang keluarga ke balkon",
      "Lift dan keamanan 24 jam",
      "Satu slot parkir beratap",
      "Mesin cuci dan kulkas",
    ],
    nearby: [
      { name: "Taman Suropati", distanceKm: 0.7 },
      { name: "KRL Gondangdia", distanceKm: 1.1 },
      { name: "MRT Bundaran HI", distanceKm: 2.3 },
    ],
    description:
      "Ruang keluarga berdinding panel kayu dengan sofa besar, TV dinding, dan pintu kaca ke balkon. Kamar utama memakai panel kayu yang sama, dengan ranjang berkepala empuk, dua nakas, dan lampu baca di dinding. Kamar kedua dan kamar mandi berada di lorong yang sama.",
    images: [
      { src: `${LISTINGS}/menteng-low-rise-flat-1.jpg`, alt: "Ruang keluarga dengan sofa abu tua, dinding panel kayu dengan TV, lampu lantai lengkung, dan tirai setinggi plafon; kamar tidur terlihat di ujung lorong." },
      { src: `${LISTINGS}/menteng-low-rise-flat-2.jpg`, alt: "Kamar tidur dengan dinding panel kayu, ranjang berkepala abu, dua nakas hitam, dan lampu baca di dinding." },
    ],
    hasWalkthrough: false,
  },
  {
    slug: "senopati-garden-residence",
    name: "Residensi Taman Senopati",
    type: "apartment",
    area: "Senopati",
    address: "Dekat Jalan Senopati, Selong, Kebayoran Baru, Jakarta Selatan",
    pricePerMonth: 78_000_000,
    minimumLease: 12,
    deposit: 2,
    bedrooms: 3,
    bathrooms: 3,
    sizeM2: 215,
    floor: "Lantai dasar dari 6",
    orientation: "Selatan",
    furnishing: "Perabot sebagian",
    utilitiesIncluded: ["Service charge (IPL)", "Perawatan taman"],
    availability: "2027-02-01",
    amenities: [
      "Dek kayu pribadi berpergola, sekitar 40 m²",
      "Pintu geser kaca dari ruang keluarga ke dek",
      "Kolam renang 20 m",
      "Gym",
      "Dua slot parkir basement",
      "Kamar ART dengan kamar mandi terpisah",
    ],
    nearby: [
      { name: "MRT ASEAN", distanceKm: 1.0 },
      { name: "Taman Langsat", distanceKm: 1.4 },
      { name: "SCBD, Pacific Place", distanceKm: 1.9 },
    ],
    description:
      "Unit lantai dasar di gedung enam lantai dengan ruang luar sendiri: dek kayu berpergola yang muat kursi santai dan meja makan kecil, dikelilingi tanaman rambat. Pintu geser kaca menghubungkannya ke ruang keluarga dengan sofa sudut krem. Tiga kamar tidur berada di sisi yang jauh dari jalan.",
    images: [
      { src: `${LISTINGS}/senopati-garden-residence-1.jpg`, alt: "Dek kayu berpergola dengan kursi anyaman, meja lipat, lampu lantai, dan tanaman rambat di depan pintu geser kaca." },
      { src: `${LISTINGS}/senopati-garden-residence-2.jpg`, alt: "Ruang keluarga dengan sofa sudut krem, karpet abu, TV dinding di atas meja hitam, dan tirai setinggi plafon." },
    ],
    hasWalkthrough: false,
  },
  {
    slug: "bsd-cluster-house",
    name: "Rumah Cluster BSD City",
    type: "house",
    area: "BSD City",
    address: "Cluster berpagar dekat Jalan BSD Raya Utama, Pagedangan, Tangerang",
    pricePerMonth: 42_000_000,
    minimumLease: 12,
    deposit: 2,
    bedrooms: 4,
    bathrooms: 3,
    sizeM2: 290,
    floor: "2 lantai",
    orientation: "Timur Laut",
    furnishing: "Perabot sebagian",
    utilitiesIncluded: ["Iuran keamanan dan kebersihan cluster"],
    availability: "2026-12-01",
    amenities: [
      "Pintu geser kayu sepanjang lantai dasar ke halaman",
      "Balkon berpagar kaca di lantai atas",
      "Island dapur dengan kompor dan oven tanam",
      "Cluster berpagar dengan keamanan 24 jam",
      "Carport untuk dua mobil",
      "Akses kolam renang clubhouse",
    ],
    nearby: [
      { name: "Pintu tol BSD", distanceKm: 3.1 },
      { name: "AEON Mall BSD City", distanceKm: 2.6 },
      { name: "KRL Rawa Buntu", distanceKm: 4.8 },
    ],
    description:
      "Rumah sudut di cluster berpagar, di atas tanah 300 m². Lantai dasar terbuka ke halaman rumput lewat deretan pintu geser kayu, dan lantai atas punya balkon berpagar kaca di bawah atap kayu yang lebar. Dapurnya memakai island dengan kompor, dengan meja makan di belakangnya.",
    images: [
      { src: `${LISTINGS}/bsd-cluster-house-1.jpg`, alt: "Rumah dua lantai dengan atap kayu lebar, balkon berpagar kaca, deretan pintu geser kayu di lantai dasar, dan halaman rumput dengan batu pijakan." },
      { src: `${LISTINGS}/bsd-cluster-house-2.jpg`, alt: "Dapur dengan island beralas hitam dan kompor, kabinet kayu berlampu, cooker hood gantung, dan meja makan di belakang." },
    ],
    hasWalkthrough: false,
  },
  {
    slug: "pik-two-bedroom",
    name: "Apartemen Dua Kamar PIK",
    type: "apartment",
    area: "Pantai Indah Kapuk",
    address: "Pantai Indah Kapuk, Kamal Muara, Penjaringan, Jakarta Utara",
    pricePerMonth: 24_000_000,
    minimumLease: 6,
    deposit: 2,
    bedrooms: 2,
    bathrooms: 2,
    sizeM2: 96,
    floor: "Lantai 12 dari 32",
    orientation: "Utara",
    furnishing: "Perabot lengkap",
    utilitiesIncluded: ["Service charge (IPL)", "Air"],
    availability: "2026-12-01",
    amenities: [
      "Sofa sudut dan karpet termasuk",
      "AC di ruang keluarga dan kedua kamar",
      "Kolam renang",
      "Gym",
      "Satu slot parkir basement",
      "Mesin cuci",
    ],
    nearby: [
      { name: "PIK Avenue", distanceKm: 1.3 },
      { name: "Pintu tol PIK", distanceKm: 2.0 },
      { name: "Bandara Soekarno–Hatta (lewat tol)", distanceKm: 16 },
    ],
    description:
      "Ruang keluarga terang dengan sofa sudut krem, tirai tipis setinggi plafon, dan AC dinding. Kamar utama berdinding putih dengan jendela lebar, lampu lantai, dan kursi berlengan di sudut. Minimum sewa enam bulan cocok untuk penugasan singkat atau masa transisi pindah rumah.",
    images: [
      { src: `${LISTINGS}/pik-two-bedroom-1.jpg`, alt: "Ruang keluarga putih dengan sofa sudut krem, tirai tipis dan tirai cokelat, lampu gantung bundar, dan AC dinding." },
      { src: `${LISTINGS}/pik-two-bedroom-2.jpg`, alt: "Kamar tidur putih dengan ranjang bersprei abu tua, lampu lantai berkaki tiga, kursi berlengan, AC dinding, dan jendela lebar." },
    ],
    hasWalkthrough: false,
  },
  {
    slug: "senopati-one-bedroom",
    name: "Loft Satu Kamar Senopati",
    type: "apartment",
    area: "Senopati",
    address: "Dekat Jalan Suryo, Rawa Barat, Kebayoran Baru, Jakarta Selatan",
    pricePerMonth: 26_000_000,
    minimumLease: 12,
    deposit: 2,
    bedrooms: 1,
    bathrooms: 1,
    sizeM2: 88,
    floor: "Lantai 6 dari 8",
    orientation: "Barat Laut",
    furnishing: "Perabot lengkap",
    utilitiesIncluded: ["Service charge (IPL)", "Air", "Internet 100 Mbps"],
    availability: "2027-01-15",
    amenities: [
      "Jendela besar berbingkai baja di ruang keluarga",
      "Plafon balok ekspos",
      "Island dapur dengan kompor tanam",
      "Kolam renang",
      "Gym",
      "Satu slot parkir basement",
    ],
    nearby: [
      { name: "Jalan Senopati", distanceKm: 0.3 },
      { name: "MRT ASEAN", distanceKm: 0.6 },
      { name: "SCBD, Pacific Place", distanceKm: 1.4 },
    ],
    description:
      "Ruang keluarga lapang dengan jendela besar berbingkai baja, plafon balok ekspos, dan sofa panjang di sisi jendela. Dapurnya memakai island putih dengan kompor tanam dan kabinet kayu setinggi plafon. Stasiun MRT ASEAN berjarak sekitar sepuluh menit jalan kaki.",
    images: [
      { src: `${LISTINGS}/senopati-one-bedroom-1.jpg`, alt: "Ruang keluarga loft dengan plafon balok putih, jendela besar berbingkai hitam, sofa putih panjang, dua kursi santai, dan lemari kayu tua." },
      { src: `${LISTINGS}/senopati-one-bedroom-2.jpg`, alt: "Dapur dengan island putih berkompor tanam, kabinet kayu setinggi plafon dengan oven tanam, dan cooker hood di plafon." },
    ],
    hasWalkthrough: false,
  },
];

export function getProperty(slug: string) {
  return properties.find((p) => p.slug === slug);
}
