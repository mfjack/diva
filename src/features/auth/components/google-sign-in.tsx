"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useGoogleSignInMutation } from "../hooks/use-google-sign-in-mutation";
import { AUTH_BUTTON_CLASS_NAME } from "./auth-styles";
import { GoogleIcon } from "./google-icon";

type GoogleSignInProps = {
  label: string;
  nextPath?: string;
};

export function GoogleSignIn({ label, nextPath }: GoogleSignInProps) {
  const googleSignInMutation = useGoogleSignInMutation();
  const isRedirecting =
    googleSignInMutation.isPending || googleSignInMutation.isSuccess;

  function handleGoogleSignIn() {
    googleSignInMutation.mutate(nextPath, {
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <>
      <FieldSeparator>ou</FieldSeparator>
      <Button
        type="button"
        variant="outline"
        disabled={isRedirecting}
        aria-busy={isRedirecting}
        onClick={handleGoogleSignIn}
        className={cn(AUTH_BUTTON_CLASS_NAME, "gap-2.5 font-normal")}
      >
        {isRedirecting ? <Spinner aria-hidden /> : <GoogleIcon />}
        {label}
      </Button>
    </>
  );
}
