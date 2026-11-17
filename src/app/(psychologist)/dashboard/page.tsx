import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function PsychologistHomePage() {
  redirect(ROUTES.psychologist.home);
}
