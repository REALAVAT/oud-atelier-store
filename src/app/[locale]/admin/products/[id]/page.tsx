import { ProductEditor } from "@/components/admin/product-editor";

export default async function EditProductPage({ params }: PageProps<"/[locale]/admin/products/[id]">) {
  const { id } = await params;
  return <ProductEditor id={decodeURIComponent(id)} />;
}
