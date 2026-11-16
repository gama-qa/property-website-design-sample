"use client";

import { useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { controlBorder, controlClass, Field, FormFailure, SelectChevron } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import {
  MESSAGE_MAX,
  normalise,
  todayInJakarta,
  validateViewingRequest,
  VIEWING_FIELDS,
  type ViewingErrors,
  type ViewingField,
} from "@/lib/viewing-request";

type Values = Record<ViewingField, string>;
const EMPTY: Values = { name: "", email: "", phone: "", date: "", message: "" };

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "failed" }
  | { kind: "sent"; reference: string; date: string; propertyName: string };

export type PropertyOption = { slug: string; name: string; detail: string };

type Props =
  /** On a listing page: the property is fixed. */
  | { slug: string; propertyName: string; options?: undefined; initialSlug?: undefined }
  /** In the "Jadwalkan survei" modal: the visitor picks the property. */
  | { options: PropertyOption[]; initialSlug?: string; slug?: undefined; propertyName?: undefined };

const noopSubscribe = () => () => {};
const PROPERTY_ERROR = "Pilih properti yang ingin Anda survei.";

/**
 * Viewing request form. Posts to /api/viewing-request, which only logs the
 * request (no backend in this sample); the note under the form says so.
 */
export function ViewingForm(props: Props) {
  const uid = useId();
  const id = (field: ViewingField | "property") => `${uid}-${field}`;
  const [values, setValues] = useState<Values>(EMPTY);
  const [chosen, setChosen] = useState(props.options ? (props.initialSlug ?? "") : props.slug);
  const [errors, setErrors] = useState<ViewingErrors>({});
  const [propertyError, setPropertyError] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const propertyName = props.options ? (props.options.find((o) => o.slug === chosen)?.name ?? "") : props.propertyName;

  // Today's date for the picker's lower bound. Read on the client only, never during prerender.
  const today = useSyncExternalStore(noopSubscribe, () => todayInJakarta(), () => "");

  const change = (field: ViewingField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first attempt, clear or update a message as soon as the field is corrected.
    if (attempted) setErrors(validateViewingRequest(normalise({ slug: chosen, ...next }), todayInJakarta()));
    if (status.kind === "failed") setStatus({ kind: "idle" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "submitting") return;

    const input = normalise({ slug: chosen, ...values });
    const found = validateViewingRequest(input, todayInJakarta());
    const noProperty = !chosen;
    setAttempted(true);
    setErrors(found);
    setPropertyError(noProperty);
    const firstInvalid = noProperty ? "property" : VIEWING_FIELDS.find((f) => found[f]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/viewing-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: { ok?: boolean; reference?: string; errors?: ViewingErrors } = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "idle" });
        return;
      }
      if (!res.ok || !data.ok || !data.reference) throw new Error("request failed");
      setStatus({ kind: "sent", reference: data.reference, date: input.date, propertyName });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setStatus({ kind: "failed" });
    }
  };

  if (status.kind === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="border-t border-ink pt-8 outline-none">
        <Heading level={3} size="md">
          Permintaan diterima
        </Heading>
        <p className="mt-4 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink/75">
          Anda mengajukan survei {status.propertyName} pada{" "}
          <span className="tabular-nums">{formatDate(status.date)}</span>. Nomor referensi Anda{" "}
          <span className="font-medium text-ink tabular-nums">{status.reference}</span>.
        </p>
        <p className="mt-4 max-w-[46ch] text-[0.8125rem] leading-relaxed text-ink/60">
          Ini situs contoh. Permintaan hanya ditulis ke log server: tidak ada email yang dikirim dan tidak ada yang
          akan menelepon.
        </p>
        <Button
          className="mt-8"
          size="sm"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setPropertyError(false);
            setAttempted(false);
            setStatus({ kind: "idle" });
          }}
        >
          Kirim permintaan lain
        </Button>
      </div>
    );
  }

  const describe = (field: ViewingField) => (errors[field] ? `${id(field)}-error` : undefined);
  const border = (field: ViewingField) => controlBorder(Boolean(errors[field]));
  const busy = status.kind === "submitting";

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-7">
      {props.options ? (
        <Field id={id("property")} label="Properti" error={propertyError ? PROPERTY_ERROR : undefined}>
          <div className="relative">
            <select
              id={id("property")}
              name="property"
              value={chosen}
              onChange={(e) => {
                setChosen(e.target.value);
                if (e.target.value) setPropertyError(false);
              }}
              aria-invalid={propertyError}
              aria-describedby={propertyError ? `${id("property")}-error` : undefined}
              className={cn(controlClass, "h-11 cursor-pointer pr-10", controlBorder(propertyError), !chosen && "text-ink/50")}
            >
              <option value="">Pilih properti</option>
              {props.options.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name} · {o.detail}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </Field>
      ) : null}

      <div className="grid gap-7 sm:grid-cols-2">
        <Field id={id("name")} label="Nama lengkap" error={errors.name}>
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => change("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className={cn(controlClass, "h-11", border("name"))}
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
            className={cn(controlClass, "h-11", border("email"))}
          />
        </Field>
        <Field id={id("phone")} label="Telepon" error={errors.phone}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+62 812 3456 7890"
            value={values.phone}
            onChange={(e) => change("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describe("phone")}
            className={cn(controlClass, "h-11 tabular-nums", border("phone"))}
          />
        </Field>
        <Field id={id("date")} label="Tanggal survei" hint="Senin sampai Sabtu" error={errors.date}>
          <input
            id={id("date")}
            name="date"
            type="date"
            min={today || undefined}
            value={values.date}
            onChange={(e) => change("date", e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={describe("date")}
            className={cn(controlClass, "h-11 tabular-nums", border("date"))}
          />
        </Field>
      </div>

      <Field
        id={id("message")}
        label="Pesan"
        hint={`Opsional · ${values.message.length} / ${MESSAGE_MAX}`}
        error={errors.message}
      >
        <textarea
          id={id("message")}
          name="message"
          rows={props.options ? 3 : 4}
          value={values.message}
          onChange={(e) => change("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message")}
          className={cn(controlClass, "resize-y py-3 leading-relaxed", border("message"))}
        />
      </Field>

      <div aria-live="polite">
        {status.kind === "failed" ? (
          <FormFailure>Permintaan tidak terkirim. Isian Anda masih ada di formulir, jadi Anda bisa mencoba lagi.</FormFailure>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* aria-disabled, not disabled: a disabled button drops keyboard focus to the page. */}
        <Button
          type="submit"
          tone="moss"
          aria-disabled={busy}
          className={busy ? "pointer-events-none opacity-50" : undefined}
        >
          {busy ? "Mengirim…" : status.kind === "failed" ? "Coba lagi" : "Ajukan survei"}
        </Button>
        <p className="max-w-[34ch] text-[0.75rem] leading-relaxed text-ink/55">
          Situs contoh: permintaan hanya dicatat di server dan tidak dikirim ke siapa pun.
        </p>
      </div>
    </form>
  );
}
