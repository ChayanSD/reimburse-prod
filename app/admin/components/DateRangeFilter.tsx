"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get("days") || "30";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("days", value);
    router.push(`?${params.toString()}`);
    router.refresh(); // Refresh server components
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={currentDays} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 Days</SelectItem>
          <SelectItem value="30">Last 30 Days</SelectItem>
          <SelectItem value="90">Last 90 Days</SelectItem>
          <SelectItem value="365">Last Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
