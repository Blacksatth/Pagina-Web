"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Edit, Trash2, Image as ImageIcon } from "lucide-react"

interface ImageData {
  id: string
  url: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  image: string
  images?: ImageData[]
  extraImages: string[]
  stock: number
  onSale: boolean
  salePrice?: number
}

interface Message {
  text: string
  type: "success" | "error"
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Error al obtener productos")
      const data: Product[] = await response.json()

      const transformedProducts: Product[] = data.map((product) => ({
        ...product,
        extraImages: product.images?.map((img: ImageData) => img.url) || [],
      }))
      setProducts(transformedProducts)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      showMessage(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar producto")
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showMessage("Producto eliminado con éxito", "success")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido"
      showMessage(errorMessage, "error")
    }
  }

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

      {message && (
        <div
          className={`p-2 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="relative w-full h-48 mb-2">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-gray-800 font-bold">
                {product.onSale && product.salePrice
                  ? `$${product.salePrice} (Oferta)`
                  : `$${product.price}`}
              </p>
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>

              <div className="flex justify-end gap-2 mt-3">
                <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
