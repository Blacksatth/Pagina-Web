// lib/types.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category?: string
  image: string
  extraImages?: string[]
}

