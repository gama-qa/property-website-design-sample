import { normaliseContact, validateContact } from "@/lib/contact-message";

/**
 * MOCK ENDPOINT. There is no backend, mailbox or CRM behind this. A valid
 * message is written to the server console and acknowledged; nothing is
 * stored and nobody is notified. Replace the console.log with a real delivery
 * before using this for actual enquiries.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, error: "invalid-body" }, { status: 400 });
  }

  const input = normaliseContact(body as Record<string, unknown>);
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: "validation", errors }, { status: 422 });
  }

  const reference = `HC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  console.log(
    "[contact] MOCK: logged only, not delivered anywhere",
    JSON.stringify({ reference, ...input, receivedAt: new Date().toISOString() }),
  );

  return Response.json({ ok: true, reference });
}
