"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const idx = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div className="lg:grid lg:grid-cols-[84px_1fr] lg:gap-5">
      {/* Thumbnails (desktop) */}
      <div className="hidden flex-col gap-3 lg:flex">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={t("image", { index: i + 1 })}
            aria-current={i === active}
            className={cn(
              "relative aspect-[4/5] overflow-hidden border transition-opacity",
              i === active ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill sizes="84px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image (desktop) with hover zoom */}
      <div
        className="group relative hidden aspect-[4/5] cursor-zoom-in overflow-hidden bg-muted lg:block"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          sizes="(min-width: 1280px) 46vw, 55vw"
          className="object-cover transition-transform duration-300 ease-out"
          style={
            zoom
              ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : { transform: "scale(1)" }
          }
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(true);
          }}
          className="absolute end-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={t("zoom")}
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Mobile carousel */}
      <div className="relative -mx-5 sm:-mx-8 lg:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => {
                setActive(i);
                setLightbox(true);
              }}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-muted"
              aria-label={t("zoom")}
            >
              <Image src={src} alt={i === 0 ? name : ""} fill priority={i === 0} fetchPriority={i === 0 ? "high" : undefined} sizes="100vw" quality={60} className="object-cover" />
            </button>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className={cn("h-0.5 w-6 transition-colors", i === active ? "bg-foreground" : "bg-foreground/25")} />
          ))}
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="h-[100dvh] max-h-none w-screen max-w-none rounded-none bg-background p-0 ring-0 sm:max-w-none">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="relative h-full w-full">
            <Image src={images[active]} alt={name} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={cn("relative size-14 overflow-hidden border", i === active ? "border-foreground" : "border-transparent opacity-60")}
                aria-label={t("image", { index: i + 1 })}
              >
                <Image src={src} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
