import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { SelectField } from "./ui";
import type { StyleProp, ViewStyle } from "react-native";

interface FormSelectFieldProps<T extends FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any, any>;
  name: Path<T>;
  options: string[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Controlled wrapper around `SelectField` that bridges react-hook-form's
 * `Controller` with the existing select component.
 *
 * Usage:
 * ```tsx
 * <FormSelectField control={control} name="type" options={["residential", "commercial"]} />
 * ```
 */
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  options,
  style,
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <SelectField
          value={value ?? options[0]}
          options={options}
          onChange={onChange}
          style={style}
        />
      )}
    />
  );
}
