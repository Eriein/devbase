import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PricingClient } from "./PricingClient";

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/upgrade");
  }

  if (session.user.isPro) {
    redirect("/settings");
  }

  return <PricingClient />;
}