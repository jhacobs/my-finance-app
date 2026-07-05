import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import InputField from "./input-field";
import SubscribeButton from "./subscribe-button";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
  },
  formComponents: {
    SubscribeButton,
  },
});
