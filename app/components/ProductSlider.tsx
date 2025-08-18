'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '../lib/firebaseFunctions'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '../lib/firebaseFunctions'


export default function ProductSlider() {
  const [products, setProducts] = useState<Product[]>([])
  const [index, setIndex] = useState(0)

  // Obtener productos
  useEffect(() => {
    getProducts().then((data: Product[]) => {
      const filtered = data
        .filter((p) => p.id && p.name && p.image)
        .slice(0, 5)
      setProducts(filtered)
    })
  }, [])

  // Cambio automático
  useEffect(() => {
    if (products.length === 0) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [products])

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % products.length)
  }

  if (products.length === 0) return null

  return (
    <section className="relative h-48 sm:h-40 overflow-hidden">
      <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden max-w-3xl mx-auto group">
        {products.map((product, i) => (
          <Link key={product.id} href={`/products/${product.id}`} className="absolute inset-0">
            <div className={`relative w-full h-full transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <Image
                src={Array.isArray(product.image) ? product.image[0] : product.image}
                alt={product.name}
                fill
                className="object-cover w-full h-full"
                priority={i === 0}
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent px-6 py-4 rounded-b-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{product.name}</h3>
              </div>
            </div>
          </Link>
        ))}

        {/* Botón Izquierdo */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute top-20 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white z-20"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Botón Derecho */}
        <button
          onClick={handleNext}
          className="hidden sm:flex absolute h-10 top-20 right-10 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white z-10"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  )
}
