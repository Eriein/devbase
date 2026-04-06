import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileUser } from "@/lib/db/profile";
import { getUserStripeInfo } from "@/lib/db/subscriptions";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, stripeInfo, itemCount, collectionCount] = await Promise.all([
    getProfileUser(session.user.id),
    getUserStripeInfo(session.user.id),
    prisma.item.count({ where: { userId: session.user.id } }),
    prisma.collection.count({ where: { userId: session.user.id } }),
  ]);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security and preferences.
        </p>
      </div>

      {/* Subscription */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Subscription
        </h2>
        <SubscriptionSection
          isPro={session.user.isPro}
          hasStripeCustomer={!!stripeInfo?.stripeCustomerId}
          itemCount={itemCount}
          collectionCount={collectionCount}
        />
      </section>

      {/* Editor */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Editor</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground">
            Editor Preferences
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize the code editor appearance and behavior. Changes are saved
            automatically.
          </p>
          <div className="mt-5">
            <EditorPreferencesForm />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Account</h2>

        {/* Change Password — only for email/password users */}
        {user.password && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-foreground">
              Change Password
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          </div>
        )}

        {/* Delete Account */}
        <div className="rounded-lg border border-destructive/30 bg-card p-6">
          <h3 className="text-sm font-medium text-destructive">
            Delete Account
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your account and all of your data. This action
            cannot be undone.
          </p>
          <div className="mt-4">
            <DeleteAccountDialog hasPassword={user.password} />
          </div>
        </div>
      </section>
    </div>
  );
}
