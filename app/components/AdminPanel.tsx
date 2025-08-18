"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getIdTokenResult } from "firebase/auth"
import { auth, storage } from "../lib/firebase"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import {  getProducts, deleteProduct, editProduct } from "../lib/firebaseFunctions"
import { collection, addDoc, updateDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase" // ajusta la ruta según dónde tengas tu config de firebase


interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  description?: string
  extraImages?: string[]
}

export default function AdminPanel() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    images: [] as string[],
  })
  const [products, setProducts] = useState<Product[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const router = useRouter()

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

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts()
      const validProducts = (data as Product[]).filter(
        (p) => p.id && p.name && typeof p.price !== "undefined" && p.category && p.image,
      )
      setProducts(
        validProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === "number" ? p.price : Number.parseFloat(String(p.price)),
          category: p.category,
          image: p.image,
          description: p.description || "",
          extraImages: p.extraImages || [],
        })),
      )
      const uniqueCategories = [...new Set(validProducts.map((p) => p.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error fetching products:", error)
      showMessage("Error al cargar los productos", "error")
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setLoading(true)
      if (!user) {
        router.push("/")
        return
      }

      try {
        const tokenResult = await getIdTokenResult(user)
        const adminStatus = tokenResult.claims.admin === true
        setIsAdmin(adminStatus)

        if (!adminStatus) {
          console.warn("⛔ Usuario autenticado pero no es admin")
          router.push("/")
          return
        }

        await fetchProducts()
      } catch (error) {
        console.error("Error al obtener claims del usuario:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, fetchProducts])

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setForm((prev) => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }))
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    if (index < imageFiles.length) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImages(true)
    try {
      const previews = files.map((file) => URL.createObjectURL(file))
      setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }))
      setImageFiles((prev) => [...prev, ...files])
    } catch (error) {
      console.error("Error al procesar las imágenes:", error)
      showMessage("Error al procesar las imágenes", "error")
    } finally {
      setUploadingImages(false)
    }
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      showMessage("El nombre del producto es obligatorio", "error")
      return false
    }
    if (!form.price || Number.parseFloat(form.price) <= 0) {
      showMessage("El precio debe ser mayor a 0", "error")
      return false
    }
    if (!form.category.trim()) {
      showMessage("La categoría es obligatoria", "error")
      return false
    }
    if (form.images.length === 0 && imageFiles.length === 0) {
      showMessage("Al menos una imagen es obligatoria", "error")
      return false
    }
    return true
  }

  const handleAddOrUpdate = async () => {
  if (!validateForm()) return

  setSubmitting(true)
  try {
    const uploadedImages: string[] = []

    // Subir nuevas imágenes
    for (const file of imageFiles) {
      const imageRef = ref(storage, `productos/${Date.now()}-${file.name}`)
      const snapshot = await uploadBytes(imageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      uploadedImages.push(url)
    }

    const allImages = [
      ...form.images.filter((url) => url.startsWith("http")),
      ...uploadedImages,
    ]

    const productData = {
      name: form.name.trim(),
      price: Number.parseFloat(form.price),
      category: form.category.trim(),
      image: allImages[0],
      description: form.description.trim(),
      extraImages: allImages.slice(1),
    }

    if (editId) {
      // 🔹 Si existe id, editamos el producto
      await editProduct(editId, productData)
      showMessage("Producto actualizado exitosamente", "success")
    } else {
      // 🔹 Si no hay id, lo creamos en Firestore
      const docRef = await addDoc(collection(db, "products"), productData)

      // Guardamos el id generado por Firestore dentro del documento
      await updateDoc(docRef, { id: docRef.id })

      showMessage("Producto agregado exitosamente", "success")
    }

    // Reset del formulario
    setForm({ name: "", price: "", category: "", description: "", images: [] })
    setImageFiles([])
    setEditId(null)
    await fetchProducts()
  } catch (error) {
    console.error("Error al guardar el producto:", error)
    showMessage("Error al guardar el producto", "error")
  } finally {
    setSubmitting(false)
  }
}


  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description || "",
      images: [product.image, ...(product.extraImages || [])],
    })
    setImageFiles([])
    setEditId(product.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      showMessage("Producto eliminado exitosamente", "success")
      await fetchProducts()
      setShowDeleteModal(null)
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      showMessage("Error al eliminar el producto", "error")
    }
  }

  const handleCancelEdit = () => {
    setForm({ name: "", price: "", category: "", description: "", images: [] })
    setImageFiles([])
    setEditId(null)
    setNewImageUrl("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
          </div>
          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm">
              <span>🛡️</span>
              Administrador Verificado
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Product Form */}
        <div className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {editId ? "✏️" : "➕"} {editId ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <p className="text-slate-400 mt-1">
              {editId ? "Modifica los datos del producto seleccionado" : "Completa la información del nuevo producto"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  placeholder="Ej: iPhone 15 Pro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">O crear nueva categoría</label>
                <input
                  type="text"
                  placeholder="Nueva categoría"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                placeholder="Describe las características del producto..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none min-h-[100px]"
              />
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Imágenes del Producto *</label>
              {/* Add Image URL */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                />
                <button
                  onClick={handleAddImageUrl}
                  className="px-4 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg border border-slate-500 transition-colors"
                >
                  ➕
                </button>
              </div>

              {/* Upload Files */}
              <div className="mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
                  {uploadingImages ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span>📁</span>
                  )}
                  Subir Imágenes
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImagesUpload}
                    disabled={uploadingImages}
                  />
                </label>
              </div>

              {/* Image Preview */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Imagen ${idx + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-24 object-cover rounded-lg border border-slate-600"
                        unoptimized
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddOrUpdate}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editId ? "Actualizando..." : "Agregando..."}
                  </>
                ) : (
                  <>
                    {editId ? "✏️" : "➕"} {editId ? "Actualizar Producto" : "Agregar Producto"}
                  </>
                )}
              </button>
              {editId && (
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              📦 Productos Existentes ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-400 text-lg">No hay productos disponibles</p>
              <p className="text-slate-500 text-sm">Agrega tu primer producto usando el formulario de arriba</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover border border-slate-600"
                        unoptimized
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0 flex-grow">
                          <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-bold text-green-400">${product.price}</span>
                            <span className="px-2 py-1 bg-slate-600 rounded text-sm">{product.category}</span>
                          </div>
                          {product.description && (
                            <p className="text-slate-300 text-sm mt-2 line-clamp-2">{product.description}</p>
                          )}
                          {product.extraImages && product.extraImages.length > 0 && (
                            <p className="text-slate-400 text-xs mt-1">
                              +{product.extraImages.length} imagen{product.extraImages.length > 1 ? "es" : ""} adicional
                              {product.extraImages.length > 1 ? "es" : ""}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(product.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">¿Eliminar producto?</h3>
              <p className="text-slate-300 mb-4">
                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
