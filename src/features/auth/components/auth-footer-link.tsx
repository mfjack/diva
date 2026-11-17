import Link from "next/link";

type AuthFooterLinkProps = {
  question: string;
  href: string;
  linkLabel: string;
};

export function AuthFooterLink({
  question,
  href,
  linkLabel,
}: AuthFooterLinkProps) {
  return (
    <p className="text-center text-muted-foreground text-sm">
      {question}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}
