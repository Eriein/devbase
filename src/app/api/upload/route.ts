import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { uploadToR2 } from "@/lib/r2";
import { validateUploadByItemType } from "@/lib/upload-validation";
import { ratelimit, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.isPro) {
    return NextResponse.json(
      { error: "File uploads require a Pro subscription" },
      { status: 403 }
    );
  }

  const { success, reset } = await ratelimit.upload.limit(session.user.id);
  if (!success) {
    const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000);
    return createRateLimitResponse(
      "Too many uploads. Please try again later.",
      secondsUntilReset
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const itemTypeName = formData.get("itemType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof itemTypeName !== "string") {
    return NextResponse.json({ error: "itemType is required" }, { status: 400 });
  }

  const validation = validateUploadByItemType(itemTypeName, {
    type: file.type,
    size: file.size,
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const ext = file.name.split(".").pop() ?? "";
  const key = `uploads/${session.user.id}/${randomUUID()}${ext ? `.${ext}` : ""}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadToR2(key, buffer, file.type);
  } catch (err) {
    console.error("R2 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type,
  });
}
