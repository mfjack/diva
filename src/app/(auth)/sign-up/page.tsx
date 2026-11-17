import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { getSingleSearchParam } from "@/lib/search-params";
import { SignUpForm } from "./components/sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const { next } = await searchParams;

  return (
    <>
      <AuthHeader
        title="Crie sua conta"
        description="Organize agenda, prontuários e financeiro do seu consultório."
      />
      <SignUpForm nextPath={getSingleSearchParam(next)} />
    </>
  );
}
