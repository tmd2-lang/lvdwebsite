export const DOCUMENT_BUCKET = "client-documents";

export const DOCUMENT_CATEGORIES = ["Contracts", "Design", "Planning", "Invoices"] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type ClientDocument = {
  id: string;
  created_at: string;
  client_id: string;
  name: string;
  category: DocumentCategory;
  note: string | null;
  storage_path: string;
  content_type: string | null;
  size_bytes: number;
  uploaded_by: string | null;
};

function databaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Document storage is not configured.");
  return { url, serviceRoleKey };
}

function databaseHeaders(prefer?: string) {
  const { serviceRoleKey } = databaseConfig();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function responseJson<T>(response: Response, failure: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Document request failed:", payload);
    throw new Error(failure);
  }
  return payload as T;
}

export function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getDocumentsForClient(clientId: string): Promise<ClientDocument[]> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/documents?select=*&client_id=eq.${encodeURIComponent(clientId)}&order=created_at.desc`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  return responseJson<ClientDocument[]>(response, "Could not load documents.");
}

/**
 * One document, but only if it belongs to the celebration given. The owner
 * check is part of the query, so a stranger's id simply returns nothing.
 */
export async function getDocumentForClient(documentId: string, clientId: string): Promise<ClientDocument | null> {
  const { url } = databaseConfig();
  const response = await fetch(
    `${url}/rest/v1/documents?select=*&id=eq.${encodeURIComponent(documentId)}&client_id=eq.${encodeURIComponent(clientId)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<ClientDocument[]>(response, "Could not load that document.");
  return rows[0] || null;
}

export async function uploadDocument(input: {
  clientId: string;
  file: File;
  name: string;
  category: DocumentCategory;
  note?: string;
  uploadedBy?: string;
}): Promise<ClientDocument> {
  const { url, serviceRoleKey } = databaseConfig();

  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const storagePath = `${input.clientId}/${Date.now()}-${safeName}`;

  const upload = await fetch(`${url}/storage/v1/object/${DOCUMENT_BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": input.file.type || "application/octet-stream",
    },
    body: await input.file.arrayBuffer(),
    cache: "no-store",
  });

  if (!upload.ok) {
    console.error("Document upload failed:", await upload.text().catch(() => ""));
    throw new Error("That file could not be uploaded. Please try again.");
  }

  const record = await fetch(`${url}/rest/v1/documents`, {
    method: "POST",
    headers: databaseHeaders("return=representation"),
    body: JSON.stringify({
      client_id: input.clientId,
      name: input.name.trim() || input.file.name,
      category: input.category,
      note: input.note?.trim() || null,
      storage_path: storagePath,
      content_type: input.file.type || null,
      size_bytes: input.file.size,
      uploaded_by: input.uploadedBy || null,
    }),
    cache: "no-store",
  });

  const rows = await responseJson<ClientDocument[]>(record, "The file uploaded but could not be saved.");
  if (!rows[0]) throw new Error("The file uploaded but could not be saved.");
  return rows[0];
}

/**
 * A one-off address for a file, valid for a few minutes.
 *
 * Files are never publicly reachable. Each download goes through the site,
 * which checks who is asking before asking storage for a short-lived link.
 */
export async function signedDocumentUrl(storagePath: string, seconds = 300): Promise<string | null> {
  const { url, serviceRoleKey } = databaseConfig();
  const response = await fetch(`${url}/storage/v1/object/sign/${DOCUMENT_BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: seconds }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Signing a document link failed:", await response.text().catch(() => ""));
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { signedURL?: string } | null;
  return payload?.signedURL ? `${url}/storage/v1${payload.signedURL}` : null;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { url, serviceRoleKey } = databaseConfig();

  const lookup = await fetch(
    `${url}/rest/v1/documents?select=storage_path&id=eq.${encodeURIComponent(documentId)}&limit=1`,
    { headers: databaseHeaders(), cache: "no-store" },
  );
  const rows = await responseJson<{ storage_path: string }[]>(lookup, "Could not find that document.");
  const path = rows[0]?.storage_path;

  if (path) {
    await fetch(`${url}/storage/v1/object/${DOCUMENT_BUCKET}/${path}`, {
      method: "DELETE",
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      cache: "no-store",
    }).catch(() => null);
  }

  const removed = await fetch(`${url}/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}`, {
    method: "DELETE",
    headers: databaseHeaders(),
    cache: "no-store",
  });
  if (!removed.ok) throw new Error("Could not remove that document.");
}
