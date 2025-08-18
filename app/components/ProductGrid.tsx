'use client'

import { getProducts } from '../lib/firebaseFunctions'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import { Product } from '../context/CartContext'

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()

  useEffect(() => {
    getProducts().then((data) => {
      const filteredData = (data as Product[]).filter(
        (p) => p.id && p.name && p.image && typeof p.price === 'number'
      )
      setProducts(filteredData)
    })
  }, [])

  const categories = [...new Set(products.map(p => p.category))]
  const filtered = products
    .filter(p => !filter || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

  return (
    <section id="products" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
        🧢 Nuestros Productos
      </h2>

      {/* Buscador */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === '' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${filter === cat ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id)

          return (
            <div
              key={product.id}
              className="bg-gray-800 p-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between"
            >
              <Link
                href={`/products/${product.id}`}
                className="block aspect-square relative rounded-xl overflow-hidden"
              >
                <Image
                  src={Array.isArray(product.image) ? product.image[0] : product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full capitalize z-10">
                  {capitalize(product.category)}
                </span>
              </Link>

              <Link href={`/products/${product.id}`}>
                <h3 className="text-base sm:text-lg font-semibold mt-4 truncate hover:underline text-white">
                  {capitalize(product.name)}
                </h3>
              </Link>

              <p className="text-green-400 font-bold text-sm sm:text-base mt-1">
                ${Number(product.price).toLocaleString('es-CO')}
              </p>

              {cartItem ? (
                <div className="mt-3 flex items-center justify-between bg-gray-700 p-2 rounded-md">
                  <button
                    onClick={() => decreaseQuantity(product.id)}
                    className="px-3 py-1 bg-gray-600 rounded text-white text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 font-semibold text-white">{cartItem.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(product.id)}
                    className="px-3 py-1 bg-gray-600 rounded text-white text-sm"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white text-sm font-medium transition"
                >
                  Añadir al carrito
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
