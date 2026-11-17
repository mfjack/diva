"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "all";

type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  allLabel: string;
  value: string | null;
  options: readonly FilterOption[];
  onChange: (value: string | null) => void;
};

export function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  const items = [{ value: ALL_VALUE, label: allLabel }, ...options];

  function handleValueChange(nextValue: string | null) {
    onChange(nextValue === ALL_VALUE ? null : nextValue);
  }

  return (
    <Select
      items={items}
      value={value ?? ALL_VALUE}
      onValueChange={handleValueChange}
    >
      <SelectTrigger aria-label={label} className="h-10 w-full rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
