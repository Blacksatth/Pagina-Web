import ProductClient from "@/app/products/[id]/ProductClient"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  return <ProductClient id={id} />
}
