import Head from "expo-router/head";
import { JsonLd } from "@/components/JsonLd";
import { PageMeta } from "@/components/PageMeta";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { HERO_IMAGE_URL } from "@/lib/heroImage";
import { HomeScreen } from "@/screens/HomeScreen";

export default function IndexRoute() {
  return (
    <>
      <PageMeta
        title="HomeNet BD | Verified Property Listings in Bangladesh"
        description="Search verified apartments, houses and land across Dhaka. Contact property owners directly."
      />
      {/* The hero is the LCP element and a CSS background image, which the
          preload scanner cannot see until the bundle has rendered. Announcing
          it in the head starts the download in parallel with the JS. It lives
          here, not in +html.tsx, so other pages don't preload an image they
          never show. The URL must match HomeScreen's, hence the shared constant. */}
      {/* Who HomeNet is and how to search it: the homepage is where Google
          and answer engines look for the brand's entity data. */}
      <JsonLd nodes={[organizationSchema(), websiteSchema()]} />
      <Head>
        <link rel="preload" as="image" fetchPriority="high" href={HERO_IMAGE_URL} />
      </Head>
      <HomeScreen />
    </>
  );
}
