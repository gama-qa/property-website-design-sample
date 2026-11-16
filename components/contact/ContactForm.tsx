"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { controlBorder, controlClass, Field, FormFailure } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/cn";
import {
  CONTACT_FIELDS,
  CONTACT_MESSAGE_MAX,
  normaliseContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/lib/contact-message";

const EMPTY: ContactInput = { name: "", email: "", message: "" };

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "failed" } | { kind: "sent"; reference: string };

/**
 * Short contact form: name, email, message. Posts to /api/contact, which only
 * logs the message (no backend in this sample); the note under the form says so.
 */
export function ContactForm() {
  const uid = useId();
  const id = (field: ContactField) => `${uid}-${field}`;
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const change = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted) setErrors(validateContact(normaliseContact(next)));
    if (status.kind === "failed") setStatus({ kind: "idle" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "submitting") return;

    const input = normaliseContact(values);
    const found = validateContact(input);
    setAttempted(true);
    setErrors(found);
    const firstInvalid = CONTACT_FIELDS.find((f) => found[f]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: { ok?: boolean; reference?: string; errors?: ContactErrors } = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "idle" });
        return;
      }
      if (!res.ok || !data.ok || !data.reference) throw new Error("request failed");
      setStatus({ kind: "sent", reference: data.reference });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setStatus({ kind: "failed" });
    }
  };

  if (status.kind === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="border-t border-ink pt-8 outline-none">
        <Heading level={3} size="md">
          Pesan diterima
        </Heading>
        <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink/75">
          Nomor referensi Anda <span className="font-medium text-ink tabular-nums">{status.reference}</span>.
        </p>
        <p className="mt-4 max-w-[46ch] text-[0.8125rem] leading-relaxed text-ink/60">
          Ini situs contoh. Pesan hanya ditulis ke log server: tidak ada email yang dikirim dan tidak ada yang akan
          membalas.
        </p>
        <Button
          className="mt-8"
          size="sm"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setAttempted(false);
            setStatus({ kind: "idle" });
          }}
        >
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  const describe = (field: ContactField) => (errors[field] ? `${id(field)}-error` : undefined);
  const busy = status.kind === "submitting";

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <Field id={id("name")} label="Nama" error={errors.name}>
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => change("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className={cn(controlClass, "h-11", controlBorder(Boolean(errors.name)))}
          />
        </Field>
        <Field id={id("email")} label="Email" error={errors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => change("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className={cn(controlClass, "h-11", controlBorder(Boolean(errors.email)))}
          />
        </Field>
      </div>

      <Field
        id={id("message")}
        label="Pesan"
        hint={`${values.message.length} / ${CONTACT_MESSAGE_MAX}`}
        error={errors.message}
      >
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          value={values.message}
          onChange={(e) => change("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message")}
          className={cn(controlClass, "resize-y py-3 leading-relaxed", controlBorder(Boolean(errors.message)))}
        />
      </Field>

      <div aria-live="polite">
        {status.kind === "failed" ? (
          <FormFailure>Pesan tidak terkirim. Isian Anda masih ada di formulir, jadi Anda bisa mencoba lagi.</FormFailure>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" aria-disabled={busy} className={busy ? "pointer-events-none opacity-50" : undefined}>
          {busy ? "Mengirim…" : status.kind === "failed" ? "Coba lagi" : "Kirim pesan"}
        </Button>
        <p className="max-w-[34ch] text-[0.75rem] leading-relaxed text-ink/55">
          Situs contoh: pesan hanya dicatat di server dan tidak dikirim ke siapa pun.
        </p>
      </div>
    </form>
  );
}
