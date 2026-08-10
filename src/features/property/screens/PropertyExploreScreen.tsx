import React from "react";
import { AppChrome } from "@/components/AppChrome";
import { PropertyFeed } from "../components/PropertyFeed";

export function PropertyExploreScreen() {
  return (
    <AppChrome active="buy">
      <PropertyFeed />
    </AppChrome>
  );
}

