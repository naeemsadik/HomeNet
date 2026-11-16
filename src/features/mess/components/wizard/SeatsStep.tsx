import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Copy, Plus, Trash2 } from "@/components/icons";
import { AppButton } from "@/components/ui";
import { formatLocalizedNumber, useTranslation, type TranslationKey } from "@/i18n";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { formatDate, todayIso } from "../../utils/format";
import { emptySeat, firstOfNextMonth, type MessListingForm } from "../../utils/wizardForm";
import { MessChip } from "../MessChip";
import { FieldBlock, NumberInput, Segmented, StepCard, Stepper, TextField, ToggleRow, fieldStyles, useWizardField } from "./fields";

/** Step 2: the mess in counts, then each open seat (PRD 3.3.1). */
export function SeatsStep() {
  const { t } = useTranslation();
  const { control, getValues, setValue, formState, getFieldState } = useFormContext<MessListingForm>();
  // keyName: the seats carry their own `id` from the server, which must survive.
  const { fields, append, remove } = useFieldArray({ control, name: "seats", keyName: "fieldKey" });
  const [sameRent, setSameRent] = useState(false);
  const seatsError = getFieldState("seats", formState).error;
  const seatsRootMessage = seatsError?.root?.message ?? seatsError?.message;

  const counts: { name: "total_rooms" | "total_seats" | "current_residents" | "washroom_count" | "floor_level"; label: TranslationKey; min: number; max: number }[] = [
    { name: "total_rooms", label: "mess.wizard.seats.totalRooms", min: 1, max: 30 },
    { name: "total_seats", label: "mess.wizard.seats.totalSeats", min: 1, max: 60 },
    { name: "current_residents", label: "mess.wizard.seats.currentResidents", min: 0, max: 60 },
    { name: "washroom_count", label: "mess.wizard.seats.washroomCount", min: 1, max: 30 },
    { name: "floor_level", label: "mess.wizard.seats.floor", min: 0, max: 40 },
  ];

  const applySameRent = (rent: number | null) => {
    getValues("seats").forEach((_, index) => {
      if (index > 0) setValue(`seats.${index}.rent`, rent);
    });
  };

  return (
    <>
      <StepCard title={t("mess.wizard.seats.building")}>
        {counts.map((count) => (
          <CountField key={count.name} {...count} />
        ))}
        <BuildingToggle name="has_lift" label={t("mess.wizard.seats.lift")} />
        <BuildingToggle name="has_security_guard" label={t("mess.wizard.seats.guard")} />
        <BuildingToggle name="has_cctv" label={t("mess.wizard.seats.cctv")} />
        <BuildingToggle name="has_generator" label={t("mess.wizard.seats.generator")} />
      </StepCard>

      <StepCard title={t("mess.wizard.seats.openSeats")}>
        <Text style={styles.hint}>{t("mess.wizard.seats.openSeatsHelp")}</Text>
        {fields.length > 1 ? (
          <ToggleRow
            label={t("mess.wizard.seats.sameRent")}
            value={sameRent}
            onChange={(on) => {
              setSameRent(on);
              if (on) applySameRent(getValues("seats.0.rent"));
            }}
          />
        ) : null}
        {fields.map((field, index) => (
          <SeatCard
            key={field.fieldKey}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
            rentLocked={sameRent && index > 0}
            onRentChange={sameRent && index === 0 ? applySameRent : undefined}
          />
        ))}
        {seatsRootMessage ? <Text style={styles.error}>{t(seatsRootMessage as TranslationKey)}</Text> : null}
        <View style={styles.addRow}>
          {fields.length ? (
            <AppButton
              label={t("mess.wizard.seats.duplicate")}
              icon={Copy}
              onPress={() => append(emptySeat(getValues(`seats.${fields.length - 1}`)))}
              variant="secondary"
            />
          ) : null}
          <AppButton label={t("mess.wizard.seats.addSeat")} icon={Plus} onPress={() => append(emptySeat())} variant="ghost" />
        </View>
      </StepCard>
    </>
  );
}

function CountField({ name, label, min, max }: { name: "total_rooms" | "total_seats" | "current_residents" | "washroom_count" | "floor_level"; label: TranslationKey; min: number; max: number }) {
  const { t } = useTranslation();
  const field = useWizardField(name);
  return (
    <FieldBlock error={field.error}>
      <Stepper label={t(label)} value={field.value} onChange={field.onChange} min={min} max={max} />
    </FieldBlock>
  );
}

function BuildingToggle({ name, label }: { name: "has_lift" | "has_security_guard" | "has_cctv" | "has_generator"; label: string }) {
  const field = useWizardField(name);
  return <ToggleRow label={label} value={field.value} onChange={field.onChange} />;
}

function SeatCard({
  index,
  canRemove,
  onRemove,
  rentLocked,
  onRentChange,
}: {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  rentLocked: boolean;
  onRentChange?: (rent: number | null) => void;
}) {
  const { t, language } = useTranslation();
  const room = useWizardField(`seats.${index}.room_label`);
  const seatType = useWizardField(`seats.${index}.seat_type`);
  const beds = useWizardField(`seats.${index}.beds_in_room`);
  const washroom = useWizardField(`seats.${index}.washroom`);
  const balcony = useWizardField(`seats.${index}.has_balcony`);
  const rent = useWizardField(`seats.${index}.rent`);
  const from = useWizardField(`seats.${index}.available_from`);
  const today = todayIso();
  const nextMonth = firstOfNextMonth();

  return (
    <View style={styles.seat}>
      <View style={styles.seatHead}>
        <Text style={styles.seatTitle}>{t("mess.wizard.seats.seatN", { n: formatLocalizedNumber(index + 1, language) })}</Text>
        {canRemove ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t("mess.wizard.seats.remove")} onPress={onRemove} style={[styles.remove, webPointer]}>
            <Trash2 size={16} color={colorTokens.errorText} />
          </Pressable>
        ) : null}
      </View>

      <View style={fieldStyles.row}>
        <View style={fieldStyles.half}>
          <FieldBlock label={t("mess.wizard.seats.room")} error={room.error}>
            <TextField label={t("mess.wizard.seats.room")} value={room.value} onChange={room.onChange} placeholder={t("mess.wizard.seats.roomPlaceholder")} maxLength={30} />
          </FieldBlock>
        </View>
        <View style={fieldStyles.half}>
          <FieldBlock label={t("mess.wizard.seats.rent")} error={rent.error}>
            <NumberInput
              label={t("mess.wizard.seats.rent")}
              prefix="৳"
              value={rent.value}
              editable={!rentLocked}
              onChange={(next) => {
                rent.onChange(next);
                onRentChange?.(next);
              }}
            />
          </FieldBlock>
        </View>
      </View>

      <FieldBlock label={t("mess.wizard.seats.seatType")} error={seatType.error}>
        <Segmented
          label={t("mess.wizard.seats.seatType")}
          value={seatType.value}
          onChange={(next) => {
            seatType.onChange(next);
            if (next === "single") beds.onChange(1);
            else if (beds.value < 2) beds.onChange(2);
          }}
          options={[
            { value: "single", label: t("mess.seatType.single") },
            { value: "shared", label: t("mess.seatType.shared") },
          ]}
        />
      </FieldBlock>
      {seatType.value === "shared" ? (
        <FieldBlock error={beds.error}>
          <Stepper label={t("mess.wizard.seats.beds")} value={beds.value} onChange={beds.onChange} min={2} max={8} />
        </FieldBlock>
      ) : null}

      <FieldBlock label={t("mess.wizard.seats.washroom")} error={washroom.error}>
        <Segmented
          label={t("mess.wizard.seats.washroom")}
          value={washroom.value}
          onChange={washroom.onChange}
          options={[
            { value: "common", label: t("mess.washroomShort.common") },
            { value: "attached", label: t("mess.washroomShort.attached") },
          ]}
        />
      </FieldBlock>
      <ToggleRow label={t("mess.wizard.seats.balcony")} value={balcony.value} onChange={balcony.onChange} />

      <FieldBlock label={t("mess.wizard.seats.availableFrom")} error={from.error}>
        <View style={styles.dateRow}>
          <MessChip role="radio" label={t("mess.seat.availableNow")} selected={from.value <= today} onPress={() => from.onChange(today)} />
          <MessChip role="radio" label={formatDate(nextMonth, language)} selected={from.value === nextMonth} onPress={() => from.onChange(nextMonth)} />
          <View style={styles.dateInput}>
            <TextField label={t("mess.wizard.seats.availableFrom")} value={from.value} onChange={from.onChange} placeholder={t("mess.wizard.rules.rentRevisedPlaceholder")} maxLength={10} />
          </View>
        </View>
      </FieldBlock>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colorTokens.muted },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colorTokens.errorText },
  addRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seat: { gap: 14, padding: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colorTokens.border, backgroundColor: colorTokens.canvas },
  seatHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seatTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colorTokens.ink },
  remove: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill },
  dateRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  dateInput: { width: 150 },
});
