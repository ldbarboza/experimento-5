import { remove, update } from "../../../../lib/store";
import { validateUpdateInput } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

/** FR-04 — update a product; 404 when the id is unknown. */
export async function PUT(request: Request, { params }: RouteContext): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const result = validateUpdateInput(body);

  if (!result.valid) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }

  const updated = update(params.id, result.value);

  if (!updated) {
    return Response.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return Response.json(updated);
}

/** FR-05 — delete a product; 404 when the id is unknown. */
export async function DELETE(_request: Request, { params }: RouteContext): Promise<Response> {
  if (!remove(params.id)) {
    return Response.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
