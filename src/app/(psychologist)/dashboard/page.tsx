import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel",
};

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="font-heading text-4xl">Painel</h1>
    </main>
  );
}
