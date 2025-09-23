"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/app/context/CartContext"
import { Minus, Plus, X } from "lucide-react"
import Modal from "react-modal"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id: string | number
  name: string
  price: number
  category: string
  image: string | string[]
  extraImages?: string[]
  description?: string
}

export default function ProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [moreProducts, setMoreProducts] = useState<Product[]>([])
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      Modal.setAppElement("body")
    }

    async function fetchData() {
      try {
        // Obtener todos los productos
        const resAll = await fetch("http://localhost:3001/products")
        const allProducts: Product[] = await resAll.json()

        // Buscar producto por id
        const data = allProducts.find(p => String(p.id) === String(id)) || null
        if (!data) {
          setProduct(null)
          return
        }
        setProduct(data)

        // Recomendaciones y más productos
        const recs = allProducts.filter(p => String(p.id) !== String(id) && p.category === data.category).slice(0, 4)
        const more = allProducts.filter(p => String(p.id) !== String(id)).slice(0, 8)

        setRecommendations(recs)
        setMoreProducts(more)
      } catch (err) {
        console.error("Error cargando productos:", err)
      }
    }

    fetchData()
  }, [id])

  if (!product) {
    return <div className="p-10 text-center text-red-500">❌ Producto no encontrado</div>
  }

  const images = [...(Array.isArray(product.image) ? product.image : [product.image]), ...(product.extraImages || [])]
  const whatsappMessage = `Hola, quiero comprar el producto:\n📦 *${product.name}*\n💰 Precio: $${product.price}\n📂 Categoría: ${product.category}`
  const cartItem = cart.find(item => String(item.id) === String(product.id))

  return (
    <div className="bg-gray-900 text-white min-h-screen px-4 py-10 ">
      <Link href="/" className="text-blue-400 hover:underline">&larr; Volver al inicio</Link>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mt-8 items-start bg-gray-800">
        {/* Imágenes */}
        <div className="space-y-3">
          <div className="relative group">
            <Image
              src={images[activeImageIndex] || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={400}
              unoptimized
              className="rounded-xl w-full max-h-[300px] object-contain cursor-pointer"
              onClick={() => { setSelectedImage(images[activeImageIndex]); setModalOpen(true) }}
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => { setSelectedImage(img); setActiveImageIndex(i) }}
                className={`border-2 rounded-xl p-[2px] cursor-pointer transition-all duration-200 ${activeImageIndex === i ? "border-blue-500" : "border-transparent hover:border-gray-500"}`}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Vista ${i + 1}`}
                  width={60}
                  height={60}
                  unoptimized
                  className="rounded-lg object-cover w-[60px] h-[60px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info producto */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
          <p className="text-green-400 text-xl font-bold">${product.price.toLocaleString()}</p>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {product.description || "Este producto no tiene descripción."}
          </p>

          <div className="bg-gray-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => decreaseQuantity(String(product.id))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"><Minus size={18} /></button>
              <span className="text-lg font-semibold">{cartItem ? cartItem.quantity : 0}</span>
              <button
                onClick={() => {
                 
                }}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total:</p>
              <p className="text-green-400 font-bold text-lg">
                ${cartItem ? (cartItem.quantity * product.price).toLocaleString() : "0"}
              </p>
            </div>
          </div>

          {/* Botones comprar */}
          <div className="hidden sm:flex flex-row gap-4 mt-4">
            <a
              href={`https://wa.me/573025636290?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg transition flex-1 text-center"
              rel="noreferrer"
            >
              Comprar por WhatsApp
            </a>
            <button
              onClick={() => router.push("/checkout")}
              disabled={!cartItem || cartItem.quantity === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg transition text-center"
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-xl font-bold mb-4">🔄 También te puede interesar</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map(p => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className="bg-gray-800 p-4 rounded-xl hover:scale-105 transition cursor-pointer">
                  <Image
                    src={Array.isArray(p.image) ? p.image[0] : p.image}
                    alt={p.name}
                    width={300}
                    height={200}
                    unoptimized
                    className="rounded-xl w-full h-40 object-cover"
                  />
                  <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
                  <p className="text-green-400 font-bold text-sm">${p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modal imagen */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Vista de imagen"
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80"
      >
        <div className="relative max-w-3xl w-full p-4">
          <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-red-400">
            <X size={28} />
          </button>
          {selectedImage && (
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Vista ampliada"
              unoptimized
              width={800}
              height={600}
              className="rounded-xl max-h-[80vh] w-full object-contain"
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
