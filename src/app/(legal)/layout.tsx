import { Logo } from "@/components/brand/logo";
import { ROUTES } from "@/lib/routes";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Logo href={ROUTES.login} className="text-xl" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
