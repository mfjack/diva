"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSignOutMutation } from "../hooks/use-sign-out-mutation";

export function SignOutButton() {
  const signOutMutation = useSignOutMutation();

  function handleSignOut() {
    signOutMutation.mutate(undefined, {
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Sair da conta"
      disabled={signOutMutation.isPending}
      onClick={handleSignOut}
      className="shrink-0 group-data-[collapsible=icon]:hidden"
    >
      <LogOut aria-hidden />
    </Button>
  );
}
