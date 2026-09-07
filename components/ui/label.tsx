"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  htmlFor,
  onClick,
  ...props
}: React.ComponentProps<"label">) {
  /**
   * A `<label htmlFor>` click is forwarded by the browser as a synthetic
   * "activate" click on the associated control. For a custom Select - base-ui
   * renders its trigger as a `<button role="combobox">` - that forwarded
   * click *opens the dropdown*, so clicking the label text (which sits
   * directly above the field) popped the menu open on its own (client
   * report, 2026-09-07: "uske upar click karne pe bhi dropdown open ho jata
   * hai"). Native `<input>`/`<select>` don't misbehave this way, so only the
   * forward to a combobox is suppressed here; text-input labels still focus
   * their field on click as normal.
   */
  const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
    if (htmlFor) {
      const target = document.getElementById(htmlFor);
      if (
        target &&
        (target.getAttribute("role") === "combobox" ||
          target.getAttribute("aria-haspopup") === "listbox")
      ) {
        event.preventDefault();
      }
    }
    onClick?.(event);
  };

  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
