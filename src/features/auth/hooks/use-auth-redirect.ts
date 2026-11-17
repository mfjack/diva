import { useRouter } from "next/navigation";

export function useAuthRedirect() {
  const router = useRouter();

  return function redirectAfterAuth(path: string) {
    router.replace(path);
    router.refresh();
  };
}
