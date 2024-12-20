// path/to/controller/CartController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to add a product to the cart
// Function to add a product to the cart
// Function to add a product to the cart
async function addToCart(req, res) {
    const { userId, productId, quantity, price } = req.body; // Expect userId in the request body

    // Ensure quantity starts from 1
    const quantityToAdd = Math.max(1, Number(quantity)); // Default to 1 if quantity is less than 1

    try {
        // Check if the cart already exists for the user
        let cart = await prisma.cart.findUnique({
            where: { user_id: userId }, // Use userId from the request body
        });

        // If no cart exists, create one
        if (!cart) {
            cart = await prisma.cart.create({
                data: { user_id: userId },
            });
        }

        // Check if the product already exists in the cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cart.cart_id,
                product_id: productId,
            },
        });

        if (existingCartItem) {
            // If the product exists, update the quantity
            const updatedCartItem = await prisma.cartItem.update({
                where: { cart_item_id: existingCartItem.cart_item_id },
                data: {
                    quantity: existingCartItem.quantity + quantityToAdd, // Increment quantity
                    subtotal: price * (existingCartItem.quantity + quantityToAdd), // Update subtotal
                },
            });
            return res.status(200).json(updatedCartItem);
        } else {
            // If the product does not exist, create a new cart item
            const cartItem = await prisma.cartItem.create({
                data: {
                    cart_id: cart.cart_id,
                    product_id: productId,
                    quantity: quantityToAdd,
                    price,
                    subtotal: price * quantityToAdd,
                },
            });
            return res.status(201).json(cartItem);
        }
    } catch (error) {
        console.error("Error adding to cart:", error); // Log the error details
        res.status(500).json({ error: 'An error occurred while adding to the cart.', details: error.message });
    }
}

// Function to delete a product from the cart
async function deleteFromCart(req, res) {
    const { cartItemId } = req.params;

    try {
        // Log the cartItemId to ensure it's being received correctly
        console.log("Deleting cart item with ID:", cartItemId);

        const deletedItem = await prisma.cartItem.delete({
            where: { cart_item_id: Number(cartItemId) }, // Ensure this matches your database schema
        });

        // Log the deleted item for confirmation
        console.log("Deleted item:", deletedItem);

        res.json(deletedItem);
    } catch (error) {
        console.error("Error deleting from cart:", error);
        res.status(500).json({ error: 'An error occurred while deleting from the cart.', details: error.message });
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
         // Map the cart items to include product details
        const cartItems = cart ? cart.items.map(item => ({
            cart_item_id: item.id, // Assuming you have an ID for the cart item
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image_url, // Ensure this field exists in your product model
            quantity: item.quantity,
        })) : [];
         res.json(cartItems);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: 'An error occurred while fetching cart items.' });
    }
}
async function getCartCount(req, res) {
    const { userId } = req.params; // Get userId from the request parameters

    try {
        // Find the cart for the user
        const cart = await prisma.cart.findUnique({
            where: { user_id: Number(userId) },
            include: { items: true }, // Include cart items
        });

        // Calculate the total count of items in the cart
        const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

        res.json({ count }); // Return the count
    } catch (error) {
        console.error("Error fetching cart count:", error);
        res.status(500).json({ error: 'An error occurred while fetching cart count.', details: error.message });
    }
}

// Export the functions
module.exports = {
    addToCart,
    deleteFromCart,
    getAllCartItems,
    getCartCount
};