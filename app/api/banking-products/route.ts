import { findAll, insert } from "../../../lib/store";
import { validateCreateInput } from "../../../lib/validation";

// The store lives in process memory, so the list must never be cached at build
// time — Next.js otherwise prerenders this GET handler (ADR-01).
export const dynamic = "force-dynamic";

/** FR-02 — list every product, most recent first. */
export async function GET(): Promise<Response> {
  return Response.json(findAll());
}

/** FR-03 — create a product. */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const result = validateCreateInput(body);

  if (!result.valid) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }

  return Response.json(insert(result.value), { status: 201 });
}
