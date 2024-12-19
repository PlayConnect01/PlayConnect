// path/to/controller/CartController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to add a product to the cart
async function addToCart(req, res) {
    const { userId, productId, quantity, price } = req.body;

    try {
        // Check if the cart already exists for the user
        let cart = await prisma.cart.findUnique({
            where: { user_id: userId },
        });

        // If no cart exists, create one
        if (!cart) {
            cart = await prisma.cart.create({
                data: { user_id: userId },
            });
        }

        // Add the product to the cart
        const cartItem = await prisma.cartItem.create({
            data: {
                cart_id: cart.cart_id,
                product_id: productId,
                quantity,
                price,
                subtotal: price * quantity,
            },
        });

        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding to the cart.' });
    }
}

// Function to delete a product from the cart
async function deleteFromCart(req, res) {
    const { cartItemId } = req.params;

    try {
        const deletedItem = await prisma.cartItem.delete({
            where: { cart_item_id: Number(cartItemId) },
        });

        res.json(deletedItem);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting from the cart.' });
    }
}

// Function to get all items in the cart for a specific user
async function getAllCartItems(req, res) {
    const { userId } = req.params;

    try {
        const cart = await prisma.cart.findUnique({
            where: { user_id: Number(userId) },
            include: { items: { include: { product: true } } }, // Include product details
        });

        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching cart items.' });
    }
}

// Export the functions
module.exports = {
    addToCart,
    deleteFromCart,
    getAllCartItems,
};