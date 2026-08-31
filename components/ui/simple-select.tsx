"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SimpleSelectOption = { value: string; label: string };

type SimpleSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
};

/**
 * Drop-in replacement for a raw <select>/<option> list, styled with the
 * app's shared Select primitives instead of the browser's native control
 * (client request, 2026-08-31: "the customized dropdown should be
 * everywhere" - every plain HTML select across the app gets this same
 * look). `h-9` default matches the height most filter-row selects already
 * used; pass a different height in `className` where a caller needs one.
 */
export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  id,
  disabled,
}: SimpleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("h-9 w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {(selected: string | null) => {
            // base-ui always defers to this render function once `children` is
            // passed - even while nothing is selected - so the `placeholder`
            // prop alone never shows on its own; it has to be returned here
            // explicitly for the empty/placeholder case (real bug, 2026-08-31:
            // every SimpleSelect with no value rendered completely blank
            // instead of its placeholder text until this was added).
            if (!selected) return placeholder;
            return options.find((option) => option.value === selected)?.label ?? selected;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
