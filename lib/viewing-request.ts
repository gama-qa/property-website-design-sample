/**
 * Viewing request: one set of rules, used by the form in the browser and by
 * the route handler. There is no backend behind this (sample project).
 */
export type ViewingRequestInput = {
  slug: string;
  name: string;
  email: string;
  phone: string;
  /** Preferred date, ISO yyyy-mm-dd. */
  date: string;
  message: string;
};

export type ViewingField = "name" | "email" | "phone" | "date" | "message";
export type ViewingErrors = Partial<Record<ViewingField, string>>;

export const VIEWING_FIELDS: ViewingField[] = ["name", "email", "phone", "date", "message"];
export const MESSAGE_MAX = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date in Jakarta, yyyy-mm-dd. Call from event handlers or the server, not during render. */
export function todayInJakarta(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
}

export function normalise(input: Partial<Record<keyof ViewingRequestInput, unknown>>): ViewingRequestInput {
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    slug: text(input.slug),
    name: text(input.name).replace(/\s+/g, " "),
    email: text(input.email).toLowerCase(),
    phone: text(input.phone),
    date: text(input.date),
    message: text(input.message),
  };
}

/**
 * @param earliest Earliest acceptable date, yyyy-mm-dd (today in Jakarta).
 * Messages say what is wrong and what a valid value looks like.
 */
export function validateViewingRequest(input: ViewingRequestInput, earliest: string): ViewingErrors {
  const errors: ViewingErrors = {};

  if (input.name.length < 2) errors.name = "Isi nama lengkap Anda.";
  else if (input.name.length > 80) errors.name = "Nama maksimal 80 karakter.";

  if (!input.email) errors.email = "Isi alamat email Anda.";
  else if (!EMAIL.test(input.email) || input.email.length > 120) {
    errors.email = "Ini tidak terlihat seperti alamat email. Contoh: nama@contoh.com";
  }

  const digits = input.phone.replace(/\D/g, "");
  if (!input.phone) errors.phone = "Isi nomor telepon yang bisa kami hubungi.";
  else if (!/^\+?[\d\s().-]+$/.test(input.phone) || digits.length < 8 || digits.length > 15) {
    errors.phone = "Gunakan 8 sampai 15 angka. Contoh: +62 812 3456 7890";
  }

  if (!input.date) errors.date = "Pilih tanggal yang Anda inginkan.";
  else if (!ISO_DATE.test(input.date) || Number.isNaN(Date.parse(`${input.date}T00:00:00Z`))) {
    errors.date = "Tanggal ini tidak valid.";
  } else if (input.date < earliest) {
    errors.date = "Tanggal ini sudah lewat. Pilih hari ini atau setelahnya.";
  } else if (new Date(`${input.date}T00:00:00Z`).getUTCDay() === 0) {
    errors.date = "Survei berlangsung Senin sampai Sabtu. Pilih hari lain.";
  }

  if (input.message.length > MESSAGE_MAX) {
    errors.message = `Pesan maksimal ${MESSAGE_MAX} karakter (sekarang ${input.message.length}).`;
  }

  return errors;
}
