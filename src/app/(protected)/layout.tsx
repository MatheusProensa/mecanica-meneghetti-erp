import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Nav from "@/components/Nav";
import TopBar from "@/components/TopBar";
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
    <div className="flex flex-1">
      <Nav userName={session.user.name ?? session.user.email ?? ""} />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
      </div>
      <Toast />
    </div>
  );
}
