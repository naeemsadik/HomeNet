import { Redirect } from "expo-router";

/**
 * The old "My seat listings" address. Seat listings now sit on My listings with
 * the seller's properties, so saved links land there. vercel.json redirects it on
 * the website too, ahead of the /mess/:id rewrite that would read "my" as an id.
 */
export default function MyMessListingsRedirect() {
  return <Redirect href="/my-properties" />;
}
