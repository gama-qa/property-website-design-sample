/**
 * General contact message: one set of rules, used by the form in the browser
 * and by the route handler. There is no backend behind this (sample project).
 */
export type ContactInput = { name: string; email: string; message: string };
export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_FIELDS: ContactField[] = ["name", "email", "message"];
export const CONTACT_MESSAGE_MIN = 10;
export const CONTACT_MESSAGE_MAX = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseContact(input: Partial<Record<ContactField, unknown>>): ContactInput {
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    name: text(input.name).replace(/\s+/g, " "),
    email: text(input.email).toLowerCase(),
    message: text(input.message),
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (input.name.length < 2) errors.name = "Isi nama Anda.";
  else if (input.name.length > 80) errors.name = "Nama maksimal 80 karakter.";

  if (!input.email) errors.email = "Isi alamat email Anda.";
  else if (!EMAIL.test(input.email) || input.email.length > 120) {
    errors.email = "Ini tidak terlihat seperti alamat email. Contoh: nama@contoh.com";
  }

  if (!input.message) errors.message = "Tulis pesan Anda.";
  else if (input.message.length < CONTACT_MESSAGE_MIN) {
    errors.message = `Pesan terlalu pendek. Tulis minimal ${CONTACT_MESSAGE_MIN} karakter.`;
  } else if (input.message.length > CONTACT_MESSAGE_MAX) {
    errors.message = `Pesan maksimal ${CONTACT_MESSAGE_MAX} karakter (sekarang ${input.message.length}).`;
  }

  return errors;
}
