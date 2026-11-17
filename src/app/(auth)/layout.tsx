export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
        {children}
      </div>
    </main>
  );
}
