import type { UpstreamDiagnostics } from "./types";

// Only these provider diagnostics can leave the server. Never return an error
// body, cookies, authorization headers, arbitrary titles or HTML challenge pages.
const safeHeader = (value: string | null) =>
  value && /^[a-zA-Z0-9_.:/;= -]{1,160}$/.test(value) ? value : null;

async function problemCode(response: Response): Promise<{
  errorCode: number | null;
  ownerActionRequired: boolean;
  retryable: boolean | null;
}> {
  const empty = { errorCode: null, ownerActionRequired: false, retryable: null };
  if (!response.headers.get("content-type")?.includes("application/json"))
    return empty;
  const reader = response.body?.getReader();
  if (!reader) return empty;
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) return empty;
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object") return empty;
    const d = data as Record<string, unknown>;
    return {
      errorCode:
        typeof d.error_code === "number" &&
        Number.isSafeInteger(d.error_code) &&
        d.error_code >= 0 && d.error_code <= 99999
          ? d.error_code
          : null,
      ownerActionRequired: d.owner_action_required === true,
      retryable: typeof d.retryable === "boolean" ? d.retryable : null,
    };
  } catch {
    return empty;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function upstreamDiagnostics(
  response: Response,
): Promise<UpstreamDiagnostics> {
  return {
    status: response.status,
    requestId: safeHeader(response.headers.get("x-request-id")),
    edgeRay: safeHeader(response.headers.get("cf-ray")),
    contentType: safeHeader(response.headers.get("content-type")),
    mitigation: safeHeader(response.headers.get("cf-mitigated")),
    ...(response.ok ? {
      errorCode: null, ownerActionRequired: false, retryable: null,
    } : await problemCode(response)),
  };
}
