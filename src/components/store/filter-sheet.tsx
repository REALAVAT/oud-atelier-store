"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";

export default function FilterSheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  returnFocus: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] gap-0 rounded-none bg-background p-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal">{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        <SheetFooter className="grid grid-cols-2 gap-3 border-t px-6 py-4">{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
