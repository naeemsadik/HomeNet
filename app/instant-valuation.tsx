import React from "react";
import { PageMeta } from "@/components/PageMeta";
import { InstantValuationScreen } from "@/features/valuation/screens/InstantValuationScreen";

export default function InstantValuationRoute() {
  return (
    <>
      <PageMeta
        title="Instant Property Valuation in Dhaka | HomeNet BD"
        description="Calculate the true market sale value and estimated rental yield of your Dhaka property instantly with HomeNet's verified valuation engine."
      />
      <InstantValuationScreen />
    </>
  );
}
