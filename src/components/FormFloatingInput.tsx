import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { FloatingInput } from "./AuthFormFields";
import type { KeyboardTypeOptions, StyleProp, ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface FormFloatingInputProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
}

/**
 * Controlled wrapper around `FloatingInput` that bridges react-hook-form's
 * `Controller` with the existing input component.
 *
 * Usage:
 * ```tsx
 * <FormFloatingInput control={control} name="email" label="Email" icon={Mail} />
 * ```
 */
export function FormFloatingInput<T extends FieldValues>({
  control,
  name,
  label,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  icon,
  style,
  editable,
}: FormFloatingInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FloatingInput
          label={label}
          value={value ?? ""}
          onChangeText={onChange}
          error={error?.message}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          icon={icon}
          style={style}
          editable={editable}
        />
      )}
    />
  );
}
