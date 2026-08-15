import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PNG_BYTES = 4_300_000;

function createDesignId() {
  const date = new Date();
  const y = String(date.getUTCFullYear()).slice(-2);
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RP-${y}${m}${d}-${random}`;
}

export async function POST(request: Request) {
  try {
    const storeId = process.env.REDPEN_SHOWROOM_DESIGNS_STORE_ID;

    if (!storeId) {
      return NextResponse.json(
        { error: "Vercel Blob store bağlantısı bulunamadı. REDPEN_SHOWROOM_DESIGNS_STORE_ID eksik." },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PNG dosyası bulunamadı." }, { status: 400 });
    }

    if (file.type !== "image/png") {
      return NextResponse.json({ error: "Sadece PNG kabul edilir." }, { status: 415 });
    }

    if (file.size > MAX_PNG_BYTES) {
      return NextResponse.json(
        { error: "Tasarım PNG dosyası 4.3 MB sınırını aşıyor." },
        { status: 413 }
      );
    }

    const designId = createDesignId();

    const blob = await put(`showroom-designs/${designId}.png`, file, {
      access: "public",
      storeId,
      addRandomSuffix: false,
      contentType: "image/png",
      cacheControlMaxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      designId,
      url: blob.url,
    });
  } catch (error) {
    console.error("REDPEN DESIGN UPLOAD ERROR V35", error);
    const detail = error instanceof Error ? error.message : "Bilinmeyen Blob yükleme hatası.";

    return NextResponse.json(
      { error: `Tasarım görseli kaydedilemedi: ${detail}` },
      { status: 500 }
    );
  }
}
