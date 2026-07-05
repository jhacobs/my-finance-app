import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Field, FieldGroup } from "../components/ui/field";
import { loginMiddleware } from "../auth/middleware";
import { useAppForm } from "../forms/app-form";
import { LoginForm } from "../schemas/auth-schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
    <main className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Welcome back to Budget Buddy!</h1>
        <p className="text-center text-gray-600">
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
