"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { UserGrowthData, ChartData } from "../actions";

interface OverviewProps {
  data: UserGrowthData[] | ChartData[];
  type?: "users" | "receipts";
}

export function Overview({ data, type = "users" }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey={type === "users" ? "date" : "name"}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
             // value is YYYY-MM-DD
             if (value.includes("-")) {
                 const [_, month, day] = value.split("-");
                 return `${month}/${day}`;
             }
             return value;
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
             contentStyle={{ background: "#333", border: "none", color: "#fff", borderRadius: "8px" }}
             labelStyle={{ color: "#aaa" }}
        />
        <Bar
          dataKey={type === "users" ? "count" : "value"}
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
