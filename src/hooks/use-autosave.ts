import { useCallback, useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

const AUTOSAVE_DELAY_MS = 800;

export function useAutosave<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  onSave: (values: TFieldValues) => void,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const flush = useCallback(() => {
    if (timeoutRef.current === null) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    void form.handleSubmit((values) => onSaveRef.current(values))();
  }, [form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(flush, AUTOSAVE_DELAY_MS);
    });
    return () => {
      subscription.unsubscribe();
      flush();
    };
  }, [form, flush]);
}
