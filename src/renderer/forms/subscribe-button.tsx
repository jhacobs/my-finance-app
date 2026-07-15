import { Button } from "../components/ui/button";
import { useFormContext } from "./app-form";

type SubscribeButtonProps = {
  label: string;
};

export default function SubscribeButton({ label }: SubscribeButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          className="cursor-pointer"
          disabled={!canSubmit || isSubmitting}
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
