import type { Metadata } from "next";
import Link from "next/link";
import { AuthAlert } from "@/features/auth/components/auth-alert";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { GoogleSignIn } from "@/features/auth/components/google-sign-in";
import { LOGIN_ERROR_CODES, ROUTES } from "@/lib/routes";
import { getSingleSearchParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Entrar",
};

const LOGIN_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  [LOGIN_ERROR_CODES.invalidLink]:
    "Não foi possível concluir a entrada. Tente de novo.",
  [LOGIN_ERROR_CODES.accessDenied]:
    "Esta conta não tem acesso à área do consultório.",
};

function getLoginErrorMessage(errorCode?: string): string | undefined {
  return errorCode ? LOGIN_ERROR_MESSAGES[errorCode] : undefined;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const errorMessage = getLoginErrorMessage(getSingleSearchParam(error));

  return (
    <>
      <AuthHeader
        title="Acesse sua conta"
        description="Sua agenda, seus pacientes e o financeiro em um só lugar."
      />
      <div className="flex flex-col gap-4">
        {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}
        <GoogleSignIn
          label="Entrar com Google"
          nextPath={getSingleSearchParam(next)}
        />
      </div>
      <p className="text-center text-muted-foreground text-sm leading-relaxed">
        Ao entrar, você concorda com os{" "}
        <Link href={ROUTES.terms} className="text-primary hover:underline">
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href={ROUTES.privacy} className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </>
  );
}
