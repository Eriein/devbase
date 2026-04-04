import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProfileUser } from "@/lib/db/profile";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await getProfileUser(session.user.id);
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
