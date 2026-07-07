import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, FieldGroup } from "../components/ui/field";
import { onboardingMiddleware } from "../auth/middleware";
import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "../forms/app-form";
import { OnboardingForm } from "../schemas/auth-schema";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  beforeLoad: async () => {
    await onboardingMiddleware();
  },
});

function Onboarding() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (password: string) => {
      return await window.electronAPI.registerUser(password);
    },
    onSuccess: (success: boolean) => {
      if (success) {
        toast.success("Account setup complete! You can now log in.");
        navigate({
          to: "/login",
        });
      } else {
        toast.error("Account setup failed.");
      }
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirm: "",
    },
    validators: {
      onSubmit: OnboardingForm,
    },
    onSubmit: ({ value }) => {
      mutate(value.password);
    },
  });

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-5 rounded-2xl border border-border/70 bg-card/90 p-8 shadow-[0_24px_50px_-42px_rgba(79,70,229,0.8)] backdrop-blur">
        <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-[0_16px_34px_-22px_var(--primary)]">
          <Wallet className="size-7" />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight">
          Welcome to My Finance App!
        </h1>
        <p className="text-center text-muted-foreground">
          Let's get you set up.
        </p>

        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField
              name="password"
              children={(field) => (
                <field.InputField
                  label="Input a password"
                  id="password"
                  type="password"
                />
              )}
            />
            <form.AppField
              name="confirm"
              children={(field) => (
                <field.InputField
                  label="Confirm password"
                  id="confirm"
                  type="password"
                />
              )}
            />
            <Field>
              <form.AppForm>
                <form.SubscribeButton label="Set up account" />
              </form.AppForm>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </main>
  );
}
