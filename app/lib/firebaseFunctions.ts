// lib/firebaseFunctions.ts
import { db } from './firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'

export type Product ={
  id?: number | string
  name: string
  price: number
  category: string
  image: string | string[]
  description?: string
  [key: string]: unknown // permite campos extra sin perder tipado
}

// Obtener productos (incluye ID)
export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[]
}
export async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, 'products', id)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) return null

  return { id: snapshot.id, ...snapshot.data() } as Product
}
// Agregar producto
export async function addProduct(product: Product): Promise<number> {
  const metaRef = doc(db, 'metadata', 'products')
  const metaSnap = await getDoc(metaRef)
  let newId = 101

  if (metaSnap.exists()) {
    const lastId = metaSnap.data().lastId || 0
    newId = lastId + 1
  }

  const productRef = doc(db, 'products', String(newId))
  await setDoc(productRef, { ...product, id: newId })

  await setDoc(metaRef, { lastId: newId }, { merge: true })

  return newId
}

// Eliminar producto
export async function deleteProduct(id: number | string): Promise<void> {
  const productRef = doc(db, 'products', String(id))
  await deleteDoc(productRef)
}

// Actualizar producto
export async function editProduct(
  id: number | string,
  updatedData: Partial<Product>
): Promise<void> {
  const productRef = doc(db, 'products', String(id))
  await updateDoc(productRef, updatedData)
}
