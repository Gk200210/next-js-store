import ProductsContainer from "@/components/products/ProductsContainer";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ layout?: string; search?: string }>;
}) {
  const { layout = "grid", search = "" } = await searchParams;

  return (
    <div>
      <ProductsContainer layout={layout} search={search} />
    </div>
  );
}