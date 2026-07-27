import { PropertyDetails } from "../../_components/PropertyDetails";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyDetails propertyId={Number(id)} />;
}
