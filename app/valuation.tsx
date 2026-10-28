import { Redirect } from "expo-router";

/** `/valuation` is an alias — canonical page is `/instant-valuation`. */
export default function ValuationRoute() {
  return <Redirect href={"/instant-valuation" as any} />;
}
