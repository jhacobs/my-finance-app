import { FieldLabel, Field, FieldError } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { useFieldContext } from "./app-form";

type InputFieldProps = {
  label: string;
  type: string;
  id: string;
  placeholder?: string;
};

export default function InputField({
  label,
  id,
  type = "text",
  placeholder,
}: InputFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={() => field.handleBlur()}
        placeholder={placeholder}
      ></Input>
      {field.state.meta.errors.length > 0 && (
        <FieldError
          errors={field.state.meta.errors.map((error) => ({
            message: error.message as string,
          }))}
        />
      )}
    </Field>
  );
}
