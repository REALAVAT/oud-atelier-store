import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalog";
import { unsplash } from "@/lib/data/images";

const SIZE = { width: 1200, height: 630 };

async function loadImage(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("product");
  const product = slug ? await getProductBySlug(slug) : null;
  const raw = searchParams.get("title");
  const title = (product?.name.en ?? (raw && !/[\u0600-\u06FF]/.test(raw) ? raw : "Oud Atelier")).slice(0, 60);
  const subtitle = (product?.tagline.en ?? searchParams.get("subtitle") ?? "Rare oud & fine fragrance · Dubai").slice(0, 90);
  const price = product ? `From AED ${Math.min(...product.variants.map((v) => v.priceAed))}` : null;
  const src = product?.images[0] ? product.images[0].replace(/w=\d+/, "w=900") : unsplash("handsOil", 1400);
  const photo = await loadImage(src);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0e0d0b", color: "#f7f3ec", position: "relative" }}>
        {!product && photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", opacity: 0.38 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: product ? 660 : 1200, padding: "64px 72px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, letterSpacing: 12, textTransform: "uppercase" }}>Oud Atelier</div>
            <div style={{ fontSize: 14, letterSpacing: 8, color: "#d9c49a", marginTop: 8, textTransform: "uppercase" }}>Dubai</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 64, height: 2, background: "#b8975a", marginBottom: 28 }} />
            <div style={{ fontSize: product ? 68 : 80, lineHeight: 1.05, fontWeight: 400 }}>{title}</div>
            <div style={{ fontSize: 28, color: "#d9c49a", marginTop: 20, lineHeight: 1.3 }}>{subtitle}</div>
            {price && <div style={{ fontSize: 24, marginTop: 32, letterSpacing: 4, textTransform: "uppercase", color: "#f7f3ec" }}>{price}</div>}
          </div>
        </div>
        {product && photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={540} height={630} style={{ width: 540, height: 630, objectFit: "cover" }} />
        )}
      </div>
    ),
    {
      ...SIZE,
      headers: { "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
