import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, FieldGroup } from "../components/ui/field";
import { onboardingMiddleware } from "../auth/middleware";
import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "../forms/app-form";
import { OnboardingForm } from "../schemas/auth-schema";
import { toast } from "sonner";

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
    <main className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Welcome to Budget Buddy!</h1>
        <p className="text-center text-gray-600">
          Let's get you set up to manage your finances effectively.
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
