import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import Toast from "@/components/ui/Toast";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <AppShell userName={session.user.name ?? session.user.email ?? ""}>{children}</AppShell>
      <Toast />
    </>
  );
}
