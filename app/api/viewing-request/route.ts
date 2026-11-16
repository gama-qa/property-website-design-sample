import { normalise, todayInJakarta, validateViewingRequest } from "@/lib/viewing-request";
import { getProperty } from "@/src/data/properties";

/**
 * MOCK ENDPOINT. There is no backend, database, email or CRM behind this.
 * A valid request is written to the server console and acknowledged; nothing
 * is stored and nobody is notified. Replace the console.log with a real
 * delivery (email, CRM, queue) before using this for actual enquiries.
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

  const input = normalise(body as Record<string, unknown>);
  const property = getProperty(input.slug);
  if (!property) {
    return Response.json({ ok: false, error: "unknown-property" }, { status: 404 });
  }

  // One day of slack: the visitor's "today" may be ahead of or behind Jakarta's.
  const earliest = todayInJakarta(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const errors = validateViewingRequest(input, earliest);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: "validation", errors }, { status: 422 });
  }

  const reference = `HV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  console.log(
    "[viewing-request] MOCK: logged only, not delivered anywhere",
    JSON.stringify({ reference, property: property.slug, ...input, receivedAt: new Date().toISOString() }),
  );

  return Response.json({ ok: true, reference });
}
