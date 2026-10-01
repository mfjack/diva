import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha área",
};

export default function PortalPage() {
  return (
    <main className="p-6">
      <h1 className="font-heading text-4xl">Minha área</h1>
    </main>
  );
}
