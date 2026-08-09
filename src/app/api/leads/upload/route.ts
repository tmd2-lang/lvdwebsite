import { randomUUID } from "node:crypto";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit per image

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/gif",
]);

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Storage is not configured yet." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Please select a valid image file." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Image must be smaller than 15MB." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json({ error: "Only JPG, PNG, WebP, AVIF, HEIC, or GIF images are allowed." }, { status: 400 });
    }

    // Generate a clean, unique filename
    const originalBase = path.basename(file.name, path.extname(file.name));
    const safeBase = originalBase
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 50) || "upload";
    
    const extension = path.extname(file.name).toLowerCase() || (file.type === "image/jpeg" ? ".jpg" : ".png");
    const fileName = `${safeBase}-${randomUUID().slice(0, 8)}${extension}`;
    
    // Upload directly to Supabase Storage via REST API using Service Role Key
    const bucketName = "inquiry_attachments";
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type,
        "x-upsert": "false"
      },
      body: arrayBuffer,
      cache: "no-store",
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => "");
      console.error("Supabase Storage upload failed:", errorText);
      return Response.json({ error: "Failed to upload image. Please try again." }, { status: 502 });
    }

    // Generate the public URL for the uploaded file
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;

    return Response.json({ url: publicUrl, name: file.name, size: file.size });
  } catch (error) {
    console.error("Image upload failed:", error);
    return Response.json({ error: "An unexpected error occurred during upload." }, { status: 500 });
  }
}
