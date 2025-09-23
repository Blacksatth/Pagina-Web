"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Edit, Trash2, ImageIcon } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  image: string
  extraImages: string[]
  stock: number
  onSale: boolean
  salePrice?: number
}

interface ImageData {
  url: string
  publicId: string
}

export default function AdminPanel() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    images: [] as ImageData[],
    stock: 0,
    onSale: false,
    salePrice: 0,
  })
  const [products, setProducts] = useState<Product[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(message)
      setError("")
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(message)
      setSuccess("")
      setTimeout(() => setError(""), 5000)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products")
      const data = await res.json()
      const transformedProducts = data.map((product: any) => ({
        ...product,
        extraImages: product.images?.map((img: any) => img.url) || [],
      }))
      setProducts(transformedProducts)
      console.log("[v0] Products fetched:", transformedProducts)
    } catch (err) {
      console.error(err)
      showMessage("Error al cargar productos", "error")
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "productos")
    formData.append("folder", "products")

    const res = await fetch("https://api.cloudinary.com/v1_1/ddpexfbjn/image/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    return { url: data.secure_url, publicId: data.public_id }
  }

  const handleAddImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    setSubmitting(true)

    try {
      const imageData: ImageData[] = []

      for (let i = 0; i < e.target.files.length; i++) {
        const { url, publicId } = await uploadToCloudinary(e.target.files[i])
        imageData.push({ url, publicId })
      }

      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...imageData],
      }))
    } catch (err) {
      console.error(err)
      showMessage("Error al subir imágenes", "error")
    } finally {
      setSubmitting(false)
      e.target.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleAddOrUpdateProduct = async () => {
    if (!form.name.trim() || !form.price || !form.category.trim() || form.images.length === 0) {
      showMessage("Todos los campos y al menos una imagen son obligatorios", "error")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        price: Number.parseFloat(form.price),
        category: form.category.trim(),
        description: form.description.trim(),
        stock: form.stock,
        onSale: form.onSale,
        salePrice: form.onSale ? form.salePrice : undefined,
        image: form.images[0].url, // Main image URL
        publicId: form.images[0].publicId, // Main image publicId
        extraImages: form.images.slice(1).map((img) => ({
          url: img.url,
          publicId: img.publicId,
        })), // Extra images with both URL and publicId
      }

      console.log("[v0] Sending payload:", payload)

      const url = editId ? `http://localhost:3001/products/${editId}` : "http://localhost:3001/products"
      const method = editId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      console.log("[v0] Server response:", result)

      if (!res.ok) throw new Error(result.error || "Error guardando producto")

      showMessage(editId ? "Producto actualizado" : "Producto agregado", "success")
      resetForm()
      fetchProducts()
    } catch (err: any) {
      console.log("[v0] Error saving product:", err)
      showMessage(err.message || "Error desconocido", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    const imageData: ImageData[] = [
      { url: product.image, publicId: "" }, // Main image
      ...(product.extraImages || []).map((url) => ({ url, publicId: "" })), // Extra images
    ]

    console.log("[v0] Editing product with images:", imageData)

    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      images: imageData,
      stock: product.stock,
      onSale: product.onSale,
      salePrice: product.salePrice || 0,
    })
    setEditId(product.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      description: "",
      images: [],
      stock: 0,
      onSale: false,
      salePrice: 0,
    })
    setEditId(null)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return
    try {
      const res = await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar producto")
      showMessage("Producto eliminado", "success")
      fetchProducts()
    } catch (err) {
      console.error(err)
      showMessage("Error al eliminar producto", "error")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
          Panel de Administración de Productos
        </h1>

        {(error || success) && (
          <div
            className={`p-4 mb-6 rounded-lg ${
              error
                ? "bg-red-500/20 text-red-300 border border-red-500"
                : "bg-green-500/20 text-green-300 border border-green-500"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1 bg-slate-800 rounded-2xl p-6 shadow-2xl h-fit sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-teal-300">
              {editId ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto"}
            </h2>

            <div className="space-y-5">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Precio"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number.parseInt(e.target.value) || 0 })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
                />
              </div>

              <input
                type="text"
                placeholder="Categoría"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
              />
              <textarea
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 resize-none"
              />

              {/* Imágenes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <ImageIcon size={18} /> Imágenes del Producto
                </label>
                <div className="relative border border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-700 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImageFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-slate-400 relative z-10">Arrastra y suelta imágenes o haz clic para subir</p>
                </div>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded overflow-hidden">
                        <Image
                          src={img.url || "/placeholder.svg"}
                          alt={`Imagen ${idx}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-1"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Oferta */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={form.onSale}
                  onChange={(e) =>
                    setForm({ ...form, onSale: e.target.checked, salePrice: e.target.checked ? form.salePrice : 0 })
                  }
                  className="w-4 h-4 text-teal-600 bg-gray-700 rounded border-gray-600"
                />
                <label className="text-sm font-medium">Producto en oferta</label>
              </div>
              {form.onSale && (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Precio de Oferta"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600"
                />
              )}

              {/* Botones */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddOrUpdateProduct}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    submitting ? "bg-teal-700 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
                  }`}
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : editId ? "Actualizar Producto" : "Agregar Producto"}
                </button>
                {editId && (
                  <button
                    onClick={resetForm}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-teal-300">📝 Lista de Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 px-4">Imagen</th>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                        </td>
                        <td className="py-4 px-4 font-medium">{product.name}</td>
                        <td className="py-4 px-4">
                          <span className={`${product.onSale ? "line-through text-slate-400" : ""}`}>
                            ${product.price.toFixed(2)}
                          </span>
                          {product.onSale && (
                            <span className="ml-2 text-green-400 font-bold">${product.salePrice?.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">{product.stock}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.onSale ? "bg-green-600/20 text-green-400" : "bg-slate-600/20 text-slate-400"
                            }`}
                          >
                            {product.onSale ? "Oferta" : "Normal"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                              aria-label="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No hay productos para mostrar. Agrega uno nuevo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
