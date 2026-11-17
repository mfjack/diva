import type { Metadata } from "next";
import { RouteNotFound } from "@/components/feedback/route-not-found";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return <RouteNotFound homeHref={ROUTES.home} />;
}
