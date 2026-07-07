import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, FieldGroup } from "../components/ui/field";
import { loginMiddleware } from "../auth/middleware";
import { useAppForm } from "../forms/app-form";
import { LoginForm } from "../schemas/auth-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    await loginMiddleware();
  },
});

function Login() {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (password: string) => {
      return await window.electronAPI.loginUser(password);
    },
    onSuccess: (success: boolean) => {
      if (!success) {
        toast.error("Invalid password. Please try again.");
        return;
      }

      navigate({
        to: "/",
      });
    },
  });

  const form = useAppForm({
    defaultValues: {
      password: "",
    },
    validators: {
      onSubmit: LoginForm,
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
          Welcome back!
        </h1>
        <p className="text-center text-muted-foreground">
          Please enter your password to access your financial dashboard.
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
                  type="password"
                  id="password"
                  label="Password"
                />
              )}
            />
            <Field>
              <form.AppForm>
                <form.SubscribeButton label="Log in" />
              </form.AppForm>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </main>
  );
}
