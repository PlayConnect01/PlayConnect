const db = require('../database')
const jwt = require('jsonwebtoken')

function decodeToken(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    return jwt.verify(token, 'ascefbth,plnihcdxuwy')
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

exports.addToCart = (req, res) => {
  const decoded = decodeToken(req, res)
  if (!decoded) return

  const { productId } = req.body

  db.products.findOne({ where: { id: productId } })
    .then(product => {
      if (!product) return res.status(404).json({ message: 'Product not found' })

      db.cart.findOrCreate({ where: { UserId: decoded.id }, defaults: { totalItems: 0, totalAmount: 0 } })
        .then(([cart]) => {
          db.CartProducts.findOrCreate({ 
            where: { CartId: cart.id, ProductId: productId }, 
            defaults: { quantity: 1, priceAtPurchase: product.price } 
          }).then(([cartProduct, created]) => {
            if (!created) cartProduct.quantity++
            cart.totalItems++
            cart.totalAmount = parseFloat(cart.totalAmount) + parseFloat(product.price)
            cartProduct.save()
            cart.save()
            res.status(200).json({ message: 'Product added to cart' })
          })
        })
    })
    .catch(() => res.status(500).json({ message: 'Error adding product to cart' }))
}
 
exports.removeFromCart = (req, res) => {
  const decoded = decodeToken(req, res)
  if (!decoded) return

  const { productId } = req.params

  db.cart.findOne({ where: { UserId: decoded.id } })
    .then(cart => {
      if (!cart) return res.status(404).json({ message: 'Cart not found' })

      db.CartProducts.findOne({ where: { CartId: cart.id, ProductId: productId } })
        .then(cartProduct => {
          if (!cartProduct) return res.status(404).json({ message: 'Product not found in cart' })

          db.products.findOne({ where: { id: productId } })
            .then(product => {
              const totalPrice = cartProduct.quantity * parseFloat(product.price)
              cartProduct.quantity = 0
              cart.totalItems -= cartProduct.quantity
              cart.totalAmount = cart.totalItems === 0 ? 0 : parseFloat(cart.totalAmount) - totalPrice
              cart.save()
              res.status(200).json({ message: 'Product removed from cart' })
            })
        })
    })
    .catch(() => res.status(500).json({ message: 'Error removing product from cart' }))
}