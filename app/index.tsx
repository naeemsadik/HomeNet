import Head from "expo-router/head";
import { PageMeta } from "@/components/PageMeta";
import { HERO_IMAGE_URL } from "@/lib/heroImage";
import { HomeScreen } from "@/screens/HomeScreen";

export default function IndexRoute() {
  return (
    <>
      <PageMeta
        title="HomeNet — Verified Property Listings in Bangladesh"
        description="Search verified apartments, houses and land across Dhaka. Contact property owners directly."
      />
      {/* The hero is the LCP element and a CSS background image, which the
          preload scanner cannot see until the bundle has rendered. Announcing
          it in the head starts the download in parallel with the JS. It lives
          here, not in +html.tsx, so other pages don't preload an image they
          never show. The URL must match HomeScreen's, hence the shared constant. */}
      <Head>
        <link rel="preload" as="image" fetchPriority="high" href={HERO_IMAGE_URL} />
      </Head>
      <HomeScreen />
    </>
  );
}
