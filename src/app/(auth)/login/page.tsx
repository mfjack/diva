import type { Metadata } from "next";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { LOGIN_ERROR_CODES } from "@/lib/routes";
import { getSingleSearchParam } from "@/lib/search-params";
import { SignInForm } from "./components/sign-in-form";

export const metadata: Metadata = {
  title: "Entrar",
};

const LOGIN_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  [LOGIN_ERROR_CODES.invalidLink]:
    "Esse link expirou ou já foi usado. Entre com sua senha ou peça um novo link.",
  [LOGIN_ERROR_CODES.accessDenied]:
    "Esta conta não tem acesso à área do consultório.",
};

function getLoginErrorMessage(errorCode?: string): string | undefined {
  return errorCode ? LOGIN_ERROR_MESSAGES[errorCode] : undefined;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;

  return (
    <>
      <AuthHeader
        title="Acesse sua conta"
        description="Sua agenda, seus pacientes e o financeiro em um só lugar."
      />
      <SignInForm
        nextPath={getSingleSearchParam(next)}
        initialErrorMessage={getLoginErrorMessage(getSingleSearchParam(error))}
      />
    </>
  );
}
