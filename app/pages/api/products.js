import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image,
      extraImages: product.images?.map(img => img.url) || [],
      stock: product.stock || 0,
      onSale: product.onSale || false,
      salePrice: product.salePrice
    }))
    
    res.status(200).json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  } finally {
    await prisma.$disconnect()
  }
}