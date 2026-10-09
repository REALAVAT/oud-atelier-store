"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "next-intl";

export function RevenueChart({ data, format }: { data: { date: string; revenue: number }[]; format: (n: number) => string }) {
  const locale = useLocale();
  const day = (iso: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8975a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b8975a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2d9c9" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickFormatter={day} tick={{ fontSize: 11, fill: "#5f584e" }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis
            domain={[0, (max: number) => Math.max(1000, Math.ceil(max / 1000) * 1000)]}
            tickCount={5}
            allowDecimals={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v))}
            tick={{ fontSize: 11, fill: "#5f584e" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: "#b8975a", strokeWidth: 1 }}
            contentStyle={{ background: "#0e0d0b", border: "none", borderRadius: 0, color: "#f7f3ec", fontSize: 12 }}
            labelFormatter={(l) => day(String(l))}
            formatter={(v) => [format(Number(v)), ""]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#7a5f30" strokeWidth={1.5} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
