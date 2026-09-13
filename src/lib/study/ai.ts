export async function getAiStatus(): Promise<{ available: boolean }> {
  return { available: false };
}

export async function destilarComModelo(_input: {
  data: { fonteId: string; capitulo: string; paginas: string; recorte: string };
}): Promise<{ ok: false; error: string } | { ok: true; data: Record<string, never> }> {
  return { ok: false, error: "AI is not available" };
}

export async function tutorSocratico(_input: { data: unknown }): Promise<
  { ok: false; error: string } | { ok: true; data: Record<string, never> }
> {
  return { ok: false, error: "AI is not available" };
}

export async function compararFontes(_input: { data: unknown }): Promise<
  { ok: false; error: string } | { ok: true; data: Record<string, never> }
> {
  return { ok: false, error: "AI is not available" };
}
