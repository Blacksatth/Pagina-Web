import ProductClient from "./ProductClient"

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductClient id={params.id} />
}
