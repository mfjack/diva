"use client";

import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SearchInput({
  placeholder,
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <InputGroup className={cn("h-10 w-full rounded-lg", className)}>
      <InputGroupAddon>
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputGroup>
  );
}
