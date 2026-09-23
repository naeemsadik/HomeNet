import { PageMeta } from "@/components/PageMeta";
import { AboutScreen } from "@/screens/AboutScreen";

export default function AboutRoute() {
  return (
    <>
      <PageMeta
        title="About HomeNet"
        description="How HomeNet verifies property listings and connects seekers with owners directly."
      />
      <AboutScreen />
    </>
  );
}
