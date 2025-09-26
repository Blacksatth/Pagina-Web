import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const app = express()
const prisma = new PrismaClient()
const SECRET = process.env.JWT_SECRET || 'mi_clave_secreta'

// =========================
// 🔹 Configuración Cloudinary
// =========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// =========================
// 🔹 Configuración Multer con Cloudinary
// =========================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // carpeta en Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// =========================
// 🔹 CORS Configuration - FIXED
// =========================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://pagina-web-coral-iota.vercel.app',
    'https://pagina-web-production-ff54.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// =========================
// ✅ Registro
// =========================
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        role: 'user'
      }
    })
    res.json({ success: true, id: user.id, role: user.role })
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(400).json({ success: false, message: 'El email ya está registrado' })
    } else {
      res.status(500).json({ success: false, message: err.message })
    }
  }
})

// =========================
// ✅ Login
// =========================
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true }
    })
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' })

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return res.status(401).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' })
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, token })
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// =========================
// ✅ Verificar admin
// =========================
app.get('/verify-admin', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    const decoded = jwt.verify(token, SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    })

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    if (user.role !== 'admin') return res.status(403).json({ error: 'No eres admin' })

    res.json({ role: user.role })
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado' })
  }
})

// =========================
// ✅ Crear producto con URLs (no multer)
// =========================
app.post('/products', async (req, res) => {
  const { name, price, category, description, stock, onSale, salePrice, image, publicId, extraImages } = req.body;

  if (!name || !price || !category || !image || !publicId) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        description,
        stock: parseInt(stock) || 0,
        onSale: onSale === true || onSale === 'true',
        salePrice: salePrice ? parseFloat(salePrice) : null,
        image,      // url principal
        publicId,   // publicId principal
        images: {
          create: (extraImages || []).map((img) => ({
            url: img.url,       // url de la imagen extra
            publicId: img.publicId, // publicId de Cloudinary
          })),
        },
      },
      include: { images: true },
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando producto' });
  }
});

// =========================
// ✅ Obtener productos - UPDATED
// =========================
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: true }
    })
    
    // Transform data to match frontend interface
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
    
    res.json(transformedProducts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error cargando productos' })
  }
})

// =========================
// ✅ Actualizar producto
// =========================
app.put('/products/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, category, image, description, stock, onSale, salePrice } = req.body

  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { name, price, category, image, description, stock, onSale, salePrice },
    })
    res.json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error actualizando producto' })
  }
})

// =========================
// ✅ Eliminar producto (y su imagen en Cloudinary)
// =========================
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true }
    })

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" })
    }

    // Borrar imagen principal
    if (product.publicId) {
      await cloudinary.uploader.destroy(`products/${product.publicId}`)
    }

    // Borrar imágenes extras
    for (const img of product.images) {
      await cloudinary.uploader.destroy(`products/${img.publicId}`)
    }

    await prisma.product.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error eliminando producto' })
  }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));