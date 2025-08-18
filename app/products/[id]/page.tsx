"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import Image from "next/image"
import { Plus, Minus, X } from "lucide-react"
import Modal from "react-modal"
import { useCart } from "@/app/context/CartContext"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string | string[]
  extraImages?: string[]
  description?: string
}

async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, "products", id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Product
}

async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [moreProducts, setMoreProducts] = useState<Product[]>([])

  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const root = document.getElementById("__next")
        if (root) Modal.setAppElement(root)
      }, 0)
    }

    async function fetchData() {
      if (!params.id) return console.log("No hay id")

      try {
        const data = await getProductById(params.id as string)
        if (!data) {
          console.log("No se encontró producto con id:", params.id)
          setProduct(null)
          setLoading(false)
          return
        }

        console.log("Producto encontrado:", data)
        setProduct(data)

        const allProducts = await getAllProducts()
        console.log("Todos los productos:", allProducts.length)

        const recommendations = allProducts.filter((p) => p.id !== data.id && p.category === data.category).slice(0, 4)
        const more = allProducts.filter((p) => p.id !== data.id).slice(0, 8)

        setRecommendations(recommendations)
        setMoreProducts(more)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div className="p-10 text-center text-red-500">❌ Producto no encontrado</div>
  }

  const images = [...(Array.isArray(product.image) ? product.image : [product.image]), ...(product.extraImages || [])]

  const whatsappMessage = `Hola, quiero comprar el producto:\n📦 *${product.name}*\n💰 Precio: $${product.price}\n📂 Categoría: ${product.category}`

  const cartItem = cart.find((item) => item.id === product.id)

  return (
    <div className="bg-gray-900 text-white min-h-screen px-4 py-10">
      <Link href="/" className="text-blue-400 hover:underline">
        &larr; Volver al inicio
      </Link>
      <div
        id="prueba"
        className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mt-8 items-start bg-gray-800 p-6 rounded-xl"
      >
        <div className="space-y-3">
          <div className="relative group">
            <Image
              id="product-image"
              src={images[activeImageIndex] || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={400}
              unoptimized
              className="rounded-xl w-full max-h-[300px] object-contain cursor-pointer"
              onClick={() => {
                setSelectedImage(images[activeImageIndex])
                setModalOpen(true)
              }}
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedImage(img)
                  setActiveImageIndex(i)
                }}
                className={`border-2 rounded-xl p-[2px] cursor-pointer transition-all duration-200 ${
                  activeImageIndex === i ? "border-blue-500" : "border-transparent hover:border-gray-500"
                }`}
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
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-green-400 text-xl font-bold">${product.price.toLocaleString()}</p>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {product.description || "Este producto no tiene descripción."}
          </p>
          <div className="bg-gray-700 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="text-lg font-semibold">{cartItem ? cartItem.quantity : 0}</span>
              <button
                onClick={() => {
                  if (cartItem) {
                    increaseQuantity(product.id)
                  } else {
                    addToCart({
                      ...product,
                      image: Array.isArray(product.image) ? product.image[0] : product.image,
                    })
                  }
                }}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
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
          <div className="hidden sm:flex flex-row gap-4 mt-4">
            <a
              href={`https://wa.me/573025636290?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg transition text-center flex-1"
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
          <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-gray-900 border-t border-gray-700 px-4 py-3 flex gap-3">
            <a
              href={`https://wa.me/573025636290?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3 rounded-xl text-sm font-medium text-center"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <button
              onClick={() =>
                addToCart({
                  ...product,
                  image: Array.isArray(product.image) ? product.image[0] : product.image,
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3 rounded-xl text-sm font-medium text-center"
            >
              Añadir
            </button>
            <button
              onClick={() => router.push("/checkout")}
              disabled={!cartItem || cartItem.quantity === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium text-center"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
      {recommendations.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-xl font-bold mb-4">🔄 También te puede interesar</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((p) => (
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
      {moreProducts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-20">
          <h2 className="text-xl font-bold mb-4">🛍️ Más productos interesantes</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {moreProducts.map((p) => (
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
