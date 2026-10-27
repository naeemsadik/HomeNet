import { Redirect, useLocalSearchParams } from "expo-router";

/** `/search` is an alias — redirects to canonical `/buy` browse route, preserving any search query parameters. */
export default function SearchRoute() {
  const params = useLocalSearchParams();
  const searchParams = new URLSearchParams(params as Record<string, string>).toString();
  const href = searchParams ? `/buy?${searchParams}` : "/buy";
  return <Redirect href={href as any} />;
}
