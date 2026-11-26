"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ControlledFormField } from "./controlled-form-field";
import { getFieldDescriptionId } from "./form-field-shell";
import type { FormFieldProps } from "./form-field-types";

const TAG_SEPARATOR_KEYS = new Set(["Enter", ","]);

type TagsInputProps = {
  inputId: string;
  value: readonly string[];
  suggestions: readonly string[];
  placeholder: string;
  maxTags: number;
  isInvalid: boolean;
  onChange: (value: string[]) => void;
  onBlur: () => void;
};

function TagsInput({
  inputId,
  value,
  suggestions,
  placeholder,
  maxTags,
  isInvalid,
  onChange,
  onBlur,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const suggestionsId = `${inputId}-suggestions`;
  const canAddMore = value.length < maxTags;

  function addTag(rawTag: string) {
    const tag = rawTag.trim().toLowerCase();
    setDraft("");
    if (!tag || value.includes(tag) || !canAddMore) return;
    onChange([...value, tag]);
  }

  function removeTag(tag: string) {
    onChange(value.filter((currentTag) => currentTag !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (TAG_SEPARATOR_KEYS.has(event.key)) {
      event.preventDefault();
      addTag(draft);
      return;
    }
    if (event.key === "Backspace" && draft === "") {
      const lastTag = value.at(-1);
      if (lastTag) removeTag(lastTag);
    }
  }

  function handleBlur() {
    addTag(draft);
    onBlur();
  }

  return (
    <div
      className={cn(
        "flex min-h-12 flex-wrap items-center gap-1.5 rounded-lg bg-muted px-3 py-2 focus-within:ring-2 focus-within:ring-ring/15",
        isInvalid && "ring-2 ring-destructive/20",
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex h-7 items-center gap-1 rounded-md bg-primary/10 pr-1 pl-2 text-primary text-sm"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remover ${tag}`}
            onClick={() => removeTag(tag)}
            className="flex size-5 items-center justify-center rounded hover:bg-primary/15"
          >
            <X aria-hidden className="size-3" />
          </button>
        </span>
      ))}
      {canAddMore && (
        <input
          id={inputId}
          value={draft}
          list={suggestionsId}
          placeholder={value.length === 0 ? placeholder : ""}
          aria-invalid={isInvalid}
          aria-describedby={getFieldDescriptionId(inputId)}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-7 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      )}
      <datalist id={suggestionsId}>
        {suggestions
          .filter((suggestion) => !value.includes(suggestion))
          .map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
      </datalist>
    </div>
  );
}

type TagsFieldProps<TFieldValues extends FieldValues> = Omit<
  FormFieldProps<TFieldValues>,
  "autoComplete"
> & {
  suggestions?: readonly string[];
  maxTags: number;
};

export function TagsField<TFieldValues extends FieldValues>({
  placeholder = "Digite e aperte Enter",
  suggestions = [],
  maxTags,
  ...fieldProps
}: TagsFieldProps<TFieldValues>) {
  return (
    <ControlledFormField {...fieldProps}>
      {({ field, controlProps }) => (
        <TagsInput
          inputId={controlProps.id}
          value={field.value ?? []}
          suggestions={suggestions}
          placeholder={placeholder}
          maxTags={maxTags}
          isInvalid={controlProps["aria-invalid"]}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    </ControlledFormField>
  );
}
