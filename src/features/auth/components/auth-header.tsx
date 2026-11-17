type AuthHeaderProps = {
  title: string;
  description: string;
};

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-heading font-semibold text-2xl tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
