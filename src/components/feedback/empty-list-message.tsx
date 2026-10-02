type EmptyListMessageProps = {
  message: string;
};

export function EmptyListMessage({ message }: EmptyListMessageProps) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
      {message}
    </p>
  );
}
