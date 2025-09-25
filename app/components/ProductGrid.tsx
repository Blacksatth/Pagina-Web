"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryUrl } from "@/app/utils/cloudinary";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  extraImages: string[];
  stock: number;
  onSale: boolean;
  salePrice?: number;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ⚡ Usar NEXT_PUBLIC_API_URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!API_URL) {
      console.error("❌ NEXT_PUBLIC_API_URL no está definida. Configúrala en Vercel.");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error(`Error al cargar productos: ${res.statusText}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };
    fetchProducts();
  }, [API_URL]);

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = products
    .filter((p) => !filter || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition flex-shrink-0 ${
            filter === "" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition flex-shrink-0 ${
              filter === cat ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-gray-800 p-4 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col"
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4">
              <Image
                src={cloudinaryUrl(product.image, 500, 400) || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full capitalize z-10">
                {capitalize(product.category)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold truncate text-white group-hover:underline mb-1">
              {capitalize(product.name)}
            </h3>
            <p className="text-green-400 font-bold text-sm sm:text-base">
              ${Number(product.price).toLocaleString("es-CO")}
            </p>
            {product.onSale && (
              <p className="text-yellow-400 text-sm mt-1">
                Oferta: ${product.salePrice?.toLocaleString("es-CO")}
              </p>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 mt-10 text-lg">
          No se encontraron productos.
        </p>
      )}
    </section>
  );
}
