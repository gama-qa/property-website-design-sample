/**
 * Contact details and service facts for the sample site. All fictional:
 * the phone numbers are not assigned to anyone, the email uses the reserved
 * `.example` domain and the office address has no street number, so none of
 * it can reach or locate a real person.
 */
export const site = {
  name: "Halden Residences",
  email: "survei@halden-residences.example",
  phone: "+62 21 5550 0142",
  phoneHref: "tel:+622155500142",
  /** Short form, for one line. */
  office: "Jalan Kemang Raya, Jakarta Selatan",
  /** Full form, one entry per line. */
  officeLines: ["Jalan Kemang Raya", "Bangka, Mampang Prapatan", "Jakarta Selatan 12730"],
  hours: "Senin sampai Sabtu, 09.00–17.00 WIB",
  closed: "Minggu dan hari libur nasional tutup",
  /** Kept in sync with the viewing form, which rejects Sundays. */
  viewingDays: "Senin sampai Sabtu",
  viewingLengthMinutes: 45,
  /** Line for tenants reporting a problem (see /about). */
  tenantPhone: "+62 21 5550 0177",
  tenantPhoneHref: "tel:+622155500177",
} as const;

/** Listings shown on the home page, in order. The first one is the large card. */
export const featuredSlugs = ["kemang-garden-house", "senopati-garden-residence", "bsd-cluster-house"] as const;
