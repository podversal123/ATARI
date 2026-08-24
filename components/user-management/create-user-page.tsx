"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { BASE_ROLES, DISTRICTS, KVKS, STATES, scopeFieldFor } from "@/lib/rbac";
import { useSession } from "@/lib/session";

const KVK_USER_ROLE = "KVK User";

type UserFormState = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleName: string;
  scopeValue: string;
};

function roleByName(name: string) {
  return BASE_ROLES.find((role) => role.name === name);
}

function scopeOptionsFor(kind: ReturnType<typeof scopeFieldFor>) {
  if (!kind) return null;
  switch (kind.kind) {
    case "state":
      return STATES;
    case "district":
      return DISTRICTS;
    case "kvk":
      return KVKS.map((kvk) => kvk.name);
    default:
      return null;
  }
}

/**
 * Create User, as a dedicated full page rather than the cramped popup it
 * used to be - same field set and validation as before (still no backend,
 * so Save just returns to the list), laid out like Form Management's Add
 * New pages for consistency across the app.
 */
export function CreateUserPage() {
  const router = useRouter();
  const session = useSession();
  const isKvk = session.role !== "super-admin";
  const backHref = "/user-management";

  const [form, setForm] = useState<UserFormState>(
    isKvk
      ? {
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          roleName: KVK_USER_ROLE,
          scopeValue: session.kvkName ?? "",
        }
      : {
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          roleName: "",
          scopeValue: "",
        },
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRole = roleByName(form.roleName);
  const scopeField = selectedRole ? scopeFieldFor(selectedRole.scope) : null;
  const scopeOptions = scopeOptionsFor(scopeField);

  function updateForm<K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onRoleChange(roleName: string) {
    setForm((prev) => ({ ...prev, roleName, scopeValue: "" }));
  }

  function submitForm() {
    if (!form.fullName.trim() || !form.email.trim() || !form.roleName) {
      setFormError("Full name, email and role are required.");
      return;
    }
    if (scopeField && !form.scopeValue) {
      setFormError(`${scopeField.label} is required for this role.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError("Password and confirm password do not match.");
      return;
    }
    router.push(backHref);
  }

  return (
    <div>
      <PageHeader
        backHref={backHref}
        trail={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User Management", href: "/user-management" },
          { label: "Create User" },
        ]}
        title="Create User"
      />

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="user-name">Full Name</Label>
            <Input
              id="user-name"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={(event) => updateForm("fullName", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="name@atariams.org"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-phone">Phone Number (Optional)</Label>
            <Input
              id="user-phone"
              placeholder="10-digit mobile (6–9...)"
              value={form.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-password">Password</Label>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateForm("password", event.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-confirm-password">Confirm Password</Label>
            <Input
              id="user-confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(event) =>
                updateForm("confirmPassword", event.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="user-role">Role *</Label>
            {isKvk ? (
              <Input id="user-role" value={KVK_USER_ROLE} disabled />
            ) : (
              <Select
                value={form.roleName}
                onValueChange={(value) => onRoleChange(value as string)}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {BASE_ROLES.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {scopeField &&
            (isKvk ? (
              <div className="space-y-1.5">
                <Label htmlFor="user-scope-text">{scopeField.label} *</Label>
                <Input id="user-scope-text" value={form.scopeValue} disabled />
              </div>
            ) : scopeOptions ? (
              <div className="space-y-1.5">
                <Label htmlFor="user-scope">{scopeField.label} *</Label>
                <Select
                  value={form.scopeValue}
                  onValueChange={(value) =>
                    updateForm("scopeValue", value as string)
                  }
                >
                  <SelectTrigger id="user-scope" className="w-full">
                    <SelectValue placeholder={scopeField.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="user-scope-text">{scopeField.label} *</Label>
                <Input
                  id="user-scope-text"
                  placeholder={scopeField.placeholder}
                  value={form.scopeValue}
                  onChange={(event) =>
                    updateForm("scopeValue", event.target.value)
                  }
                />
              </div>
            ))}
        </div>

        {formError && (
          <p className="mt-4 text-sm text-destructive">{formError}</p>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
          <Button onClick={submitForm}>
            <Save className="size-3.5" />
            Create User
          </Button>
        </div>
      </div>
    </div>
  );
}
