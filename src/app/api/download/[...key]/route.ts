import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFromR2 } from "@/lib/r2";
import { isKeyOwnedByUser } from "@/lib/upload-validation";
import type { ReadableStream as NodeReadableStream } from "stream/web";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keySegments } = await params;
  const key = keySegments.join("/");

  // Auth: only allow access to the user's own uploads
  const userId = session.user.id;
  if (!isKeyOwnedByUser(key, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let r2Object;
  try {
    r2Object = await getFromR2(key);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!r2Object.Body) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const inline = url.searchParams.get("inline") === "1";
  const fileName = key.split("/").pop() ?? "download";

  const contentType = r2Object.ContentType ?? "application/octet-stream";
  const disposition = inline
    ? "inline"
    : `attachment; filename="${fileName}"`;

  const body = r2Object.Body.transformToWebStream() as NodeReadableStream;

  return new NextResponse(body as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      ...(r2Object.ContentLength
        ? { "Content-Length": String(r2Object.ContentLength) }
        : {}),
    },
  });
}
