import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import AppShell from "@/components/AppShell";
import Toast from "@/components/ui/Toast";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) {
    redirect("/login");
  }

  return (
    <>
      <AppShell userName={usuario.name} permissoes={usuario.permissoes}>
        {children}
      </AppShell>
      <Toast />
    </>
  );
}
