// Import PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to add a product to the cart
async function addToCart(req, res) {
    const { userId, productId, quantity, price } = req.body;
    const quantityToAdd = Math.max(1, Number(quantity));

    try {
        // Find or create a cart for the user
        const cart = await prisma.cart.upsert({
            where: { user_id: parseInt(userId) },
            update: {},
            create: { user_id: parseInt(userId) },
        });

        // Check if the product exists in the cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cart.cart_id,
                product_id: parseInt(productId),
            },
        });

        if (existingCartItem) {
            // Update existing cart item
            const updatedCartItem = await prisma.cartItem.update({
                where: { cart_item_id: existingCartItem.cart_item_id },
                data: {
                    quantity: existingCartItem.quantity + quantityToAdd,
                    subtotal: price * (existingCartItem.quantity + quantityToAdd),
                },
            });
            return res.status(200).json(updatedCartItem);
        } else {
            // Add new item to the cart
            const newCartItem = await prisma.cartItem.create({
                data: {
                    cart_id: cart.cart_id,
                    product_id: parseInt(productId),
                    quantity: quantityToAdd,
                    price: parseFloat(price),
                    subtotal: parseFloat(price) * quantityToAdd,
                },
            });
            return res.status(201).json(newCartItem);
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Failed to add item to the cart.", details: error.message });
    }
}

// Function to delete a cart item
async function deleteFromCart(req, res) {
    const { cartItemId } = req.params;

    try {
        await prisma.cartItem.delete({
            where: { cart_item_id: parseInt(cartItemId) },
        });
        res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ error: "Failed to delete cart item." });
    }
}

// Function to get all items in a user's cart
async function getAllCartItems(req, res) {
    const { userId } = req.params;

    try {
        const cart = await prisma.cart.findUnique({
            where: { user_id: parseInt(userId) },
            include: {
                items: {
                    include: {
                        product: true, // Assuming product details are in MarketplaceProduct
                    },
                },
            },
        });

        if (!cart) {
            return res.status(404).json({ error: "Cart not found." });
        }

        const cartItems = cart.items.map((item) => ({
            cart_item_id: item.cart_item_id,
            product_id: item.product_id,
            name: item.product.name,
            description: item.product.description,
            price: item.price,
            image: item.product.image_url,
            quantity: item.quantity,
            subtotal: item.subtotal,
        }));

        res.status(200).json(cartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: "Failed to fetch cart items.", details: error.message });
    }
}

// Function to get the total cart count for a user
async function getCartCount(req, res) {
    const { userId } = req.params;

    try {
        const cart = await prisma.cart.findUnique({
            where: { user_id: parseInt(userId) },
            include: { items: true },
        });

        const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching cart count:", error);
        res.status(500).json({ error: "Failed to fetch cart count.", details: error.message });
    }
}

// Function to clear a user's cart
async function clearCart(req, res) {
    const { userId } = req.params;

    try {
        const cart = await prisma.cart.findUnique({
            where: { user_id: parseInt(userId) },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cart_id: cart.cart_id },
            });
        }

        res.status(200).json({ message: "Cart cleared successfully." });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ error: "Failed to clear cart.", details: error.message });
    }
}

// Function to update a cart item
async function updateCartItem(req, res) {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    try {
        const cartItem = await prisma.cartItem.update({
            where: { cart_item_id: parseInt(cartItemId) },
            data: {
                quantity: parseInt(quantity),
                subtotal: { multiply: parseInt(quantity) },
            },
        });

        res.status(200).json(cartItem);
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ error: "Failed to update cart item.", details: error.message });
    }
}

module.exports = {
    addToCart,
    deleteFromCart,
    getAllCartItems,
    getCartCount,
    clearCart,
    updateCartItem,
};
