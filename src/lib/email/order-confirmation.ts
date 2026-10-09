import type { Order } from "@/lib/types";
import { formatMoney } from "@/lib/currency";

const COPY = {
  en: {
    subject: (n: string) => `Your Oud Atelier order ${n}`,
    hello: (name: string) => `Thank you, ${name}`,
    intro: "Your order has been received and is being prepared by hand in our Dubai atelier.",
    order: "Order",
    qty: "Qty",
    subtotal: "Subtotal",
    discount: "Discount",
    giftWrap: "Gift wrapping",
    shipping: "Delivery",
    free: "Free",
    total: "Total",
    deliverTo: "Delivering to",
    track: "Track your order",
    footer: "Oud Atelier · Alserkal Avenue, Al Quoz, Dubai",
  },
  ar: {
    subject: (n: string) => `طلبك من عود أتيليه ${n}`,
    hello: (name: string) => `شكراً لك، ${name}`,
    intro: "تم استلام طلبك ويجري تحضيره يدوياً في مشغلنا في دبي.",
    order: "الطلب",
    qty: "الكمية",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    giftWrap: "تغليف الهدايا",
    shipping: "التوصيل",
    free: "مجاني",
    total: "الإجمالي",
    deliverTo: "التوصيل إلى",
    track: "تتبع طلبك",
    footer: "عود أتيليه · السركال أفنيو، القوز، دبي",
  },
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function orderConfirmationEmail(order: Order, siteUrl: string) {
  const l = order.locale === "ar" ? "ar" : "en";
  const c = COPY[l];
  const dir = l === "ar" ? "rtl" : "ltr";
  const align = l === "ar" ? "right" : "left";
  const opp = l === "ar" ? "left" : "right";
  const money = (aed: number) => formatMoney(aed, "AED", l);

  const rows = order.items
    .map(
      (i) => `<tr>
  <td style="padding:12px 0;border-bottom:1px solid #e2d9c9;text-align:${align}">
    <div style="font-family:Georgia,serif;font-size:16px;color:#0e0d0b">${esc(i.name[l])}</div>
    <div style="font-size:12px;color:#5f584e">${i.sizeMl} ml · ${c.qty} ${i.quantity}</div>
  </td>
  <td style="padding:12px 0;border-bottom:1px solid #e2d9c9;text-align:${opp};font-size:14px;white-space:nowrap">${money(i.priceAed * i.quantity)}</td>
</tr>`,
    )
    .join("");

  const line = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:4px 0;text-align:${align};font-size:${strong ? 16 : 14}px;${strong ? "font-weight:600;" : "color:#5f584e;"}">${label}</td><td style="padding:4px 0;text-align:${opp};font-size:${strong ? 16 : 14}px;${strong ? "font-weight:600;" : ""}">${value}</td></tr>`;

  const a = order.address;
  const html = `<!doctype html>
<html lang="${l}" dir="${dir}">
<body style="margin:0;background:#f7f3ec;font-family:Helvetica,Arial,sans-serif;color:#0e0d0b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2d9c9">
        <tr><td style="background:#0e0d0b;padding:28px;text-align:center">
          <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:6px;color:#f7f3ec">OUD ATELIER</div>
          <div style="font-size:10px;letter-spacing:4px;color:#d9c49a;margin-top:6px">DUBAI</div>
        </td></tr>
        <tr><td style="padding:32px 28px;text-align:${align}" dir="${dir}">
          <div style="font-size:11px;letter-spacing:3px;color:#7a5f30;text-transform:uppercase">${c.order} ${esc(order.number)}</div>
          <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:12px 0">${esc(c.hello(order.customerName.split(" ")[0] ?? ""))}</h1>
          <p style="font-size:14px;line-height:1.6;color:#5f584e;margin:0 0 24px">${c.intro}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            ${line(c.subtotal, money(order.subtotalAed))}
            ${order.discountAed > 0 ? line(`${c.discount} (${esc(order.discountCode ?? "")})`, `−${money(order.discountAed)}`) : ""}
            ${order.giftWrapAed > 0 ? line(c.giftWrap, money(order.giftWrapAed)) : ""}
            ${line(c.shipping, order.shippingAed === 0 ? c.free : money(order.shippingAed))}
            ${line(c.total, money(order.totalAed), true)}
          </table>
          <div style="margin-top:28px;padding:16px;background:#f7f3ec;font-size:13px;line-height:1.6">
            <div style="font-size:11px;letter-spacing:2px;color:#7a5f30;text-transform:uppercase;margin-bottom:6px">${c.deliverTo}</div>
            ${esc(a.fullName)}<br>${esc(a.building)}, ${esc(a.street)}<br>${esc(a.area)}, ${esc(a.emirate.replace(/-/g, " "))}<br>${esc(a.phone)}
          </div>
          <div style="text-align:center;margin-top:32px">
            <a href="${siteUrl}/${l}/account/orders" style="display:inline-block;background:#0e0d0b;color:#f7f3ec;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:16px 28px">${c.track}</a>
          </div>
        </td></tr>
        <tr><td style="padding:20px;text-align:center;font-size:11px;color:#5f584e;border-top:1px solid #e2d9c9">${c.footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: c.subject(order.number), html };
}
