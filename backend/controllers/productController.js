import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'

// Fetch all products
// Route GET /api/products
// Access Public
const getProducts = asyncHandler(async(req, res) => {
    const pageSize = 9
    const page = Number(req.query.pageNumber) || 1

    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {}

    const count = await Product.countDocuments({ ...keyword })
    const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1))
    res.json({ products, page, pages: Math.ceil(count / pageSize) })
})

// Fetch single product
// Route GET /api/products/:id
// Access Public
const getProductById = asyncHandler(async(req, res) => {
    const product = await Product.findById(req.params.id)
    if(product) {
        res.json(product)
    } else {
        res.status(404)
        throw new Error('Product not found.')
    }
})

// Delete a product
// Route DELETE /api/products/:id
// Access Private/Admin
const deleteProduct = asyncHandler(async(req, res) => {
    const product = await Product.findById(req.params.id)
    if(product) {
        await product.remove()
        res.json({ message: 'Product removed.' })
    } else {
        res.status(404)
        throw new Error('Product not found.')
    }
})

// Create a product
// Route POST /api/products
// Access Private/Admin
const createProduct = asyncHandler(async(req, res) => {
    const product = new Product({
        name: 'Sample',
        price: 0,
        user: req.user._id,
        image: '/image/sample.jpg',
        brand: 'Sample brand',
        category: 'Sample category',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample desc'
    })
    const createdProduct = await product.save()
    res.status(201).json(createdProduct)
})

// Update a product
// Route PUT /api/products/:id
// Access Private/Admin
const updateProduct = asyncHandler(async(req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body

    const product = await Product.findById(req.params.id)

    if(product) {
        product.name = name
        product.price = price
        product.description = description
        product.image = image
        product.brand = brand
        product.category = category
        product.countInStock = countInStock

        const updatedProduct = await product.save()
        res.json(updatedProduct)
    } else {
        res.status(404)
        throw new Error('Product not found.')
    }
})

// Create new review
// Route POST /api/products/:id/reviews
// Access Private
const createProductReview = asyncHandler(async(req, res) => {
    const { rating, comment } = req.body

    const product = await Product.findById(req.params.id)

    if(product) {
        const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())
        if(alreadyReviewed) {
            res.status(400)
            throw new Error('Product already reviewed.')
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }
        product.reviews.push(review)
        product.numReviews = product.reviews.length
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

        await product.save()
        res.status(201).json({ message: 'Review added.' })
    } else {
        res.status(404)
        throw new Error('Product not found.')
    }
})

// Get top rated products
// Route GET /api/products/top
// Access Public
const getTopProducts = asyncHandler(async(req, res) => {
    const products = await Product.find({}).sort({rating: -1 }).limit(3)
    res.json(products)
})

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview, getTopProducts }