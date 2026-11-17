"use client";

import { RouteError } from "@/components/feedback/route-error";

type PsychologistErrorProps = {
  retry: () => void;
};

export default function PsychologistError({ retry }: PsychologistErrorProps) {
  return <RouteError retry={retry} />;
}
