import { OrderAdminDetail } from "@/components/admin/order-admin-detail";

export default async function AdminOrderPage({ params }: PageProps<"/[locale]/admin/orders/[id]">) {
  const { id } = await params;
  return <OrderAdminDetail id={decodeURIComponent(id)} />;
}
