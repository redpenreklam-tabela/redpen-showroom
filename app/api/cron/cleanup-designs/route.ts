import { del, list } from "@vercel/blob";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DESIGN_PREFIX = "showroom-designs/";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const LIST_LIMIT = 1000;
const DELETE_BATCH_SIZE = 100;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  // Güvenli olmayan açık cleanup endpoint'i bırakmıyoruz.
  if (!secret) return false;

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json(
      {
        ok: false,
        error: "Unauthorized",
        hint: process.env.CRON_SECRET
          ? undefined
          : "CRON_SECRET environment variable eksik.",
      },
      { status: 401 }
    );
  }

  const storeId = process.env.REDPEN_SHOWROOM_DESIGNS_STORE_ID;

  if (!storeId) {
    return Response.json(
      {
        ok: false,
        error:
          "REDPEN_SHOWROOM_DESIGNS_STORE_ID environment variable bulunamadı.",
      },
      { status: 503 }
    );
  }

  const startedAt = Date.now();
  const cutoff = new Date(startedAt - MAX_AGE_MS);

  let cursor: string | undefined;
  let scanned = 0;
  let deleted = 0;
  let deletedBytes = 0;

  try {
    do {
      const page = await list({
        prefix: DESIGN_PREFIX,
        limit: LIST_LIMIT,
        cursor,
        storeId,
      });

      scanned += page.blobs.length;

      const expired = page.blobs.filter(
        (blob) => blob.uploadedAt.getTime() < cutoff.getTime()
      );

      for (let i = 0; i < expired.length; i += DELETE_BATCH_SIZE) {
        const batch = expired.slice(i, i + DELETE_BATCH_SIZE);

        await del(
          batch.map((blob) => blob.url),
          { storeId }
        );

        deleted += batch.length;
        deletedBytes += batch.reduce((sum, blob) => sum + blob.size, 0);
      }

      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    return Response.json({
      ok: true,
      prefix: DESIGN_PREFIX,
      maxAgeHours: 24,
      cutoff: cutoff.toISOString(),
      scanned,
      deleted,
      deletedBytes,
      deletedMegabytes: Number((deletedBytes / 1024 / 1024).toFixed(2)),
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("REDPEN BLOB CLEANUP ERROR V37", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Bilinmeyen Blob cleanup hatası.",
        scanned,
        deleted,
      },
      { status: 500 }
    );
  }
}
