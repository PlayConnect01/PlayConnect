const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all orders with product details for a user
const getOrderHistory = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        // Get all orders with their items and product details
        const orders = await prisma.order.findMany({
            where: {
                user_id: userId
            },
            include: {
                order_items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Transform the data to include all necessary details
        const transformedOrders = orders.map(order => ({
            order_id: order.order_id,
            status: order.status,
            total_amount: order.total_amount,
            created_at: order.created_at,
            completed_at: order.completed_at,
            payment_intent_id: order.payment_intent_id,
            items: order.order_items.map(item => ({
                order_item_id: item.order_item_id,
                product: {
                    product_id: item.product.product_id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    price: item.product.price,
                    rating: item.product.rating
                },
                quantity: item.quantity,
                price_at_time: item.price_at_time,
                discount_at_time: item.discount_at_time,
                subtotal: (item.price_at_time * item.quantity) - item.discount_at_time
            }))
        }));

        res.status(200).json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error('Error getting order history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch order history'
        });
    }
};

// Update order status and items
const updateOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { status, items } = req.body;
        
        // Get the order first
        const order = await prisma.order.findUnique({
            where: { order_id: orderId },
            include: { order_items: true }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Start transaction for updates
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Update status if provided
            if (status) {
                const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
                if (!validStatuses.includes(status.toLowerCase())) {
                    throw new Error('Invalid status');
                }

                await prisma.order.update({
                    where: { order_id: orderId },
                    data: {
                        status: status.toLowerCase(),
                        completed_at: status.toLowerCase() === 'completed' ? new Date() : null
                    }
                });
            }

            // 2. Update items if provided
            if (items && Array.isArray(items)) {
                for (const item of items) {
                    if (!item.order_item_id || !item.quantity) {
                        throw new Error('Invalid item data');
                    }

                    await prisma.orderItem.update({
                        where: { order_item_id: item.order_item_id },
                        data: { quantity: item.quantity }
                    });
                }
            }

            // 3. Get updated order with all details
            const updatedOrder = await prisma.order.findUnique({
                where: { order_id: orderId },
                include: {
                    order_items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            // 4. Calculate new total
            const newTotal = updatedOrder.order_items.reduce((total, item) => {
                return total + (item.price_at_time * item.quantity) - item.discount_at_time;
            }, 0);

            // 5. Update total amount
            return await prisma.order.update({
                where: { order_id: orderId },
                data: { total_amount: newTotal },
                include: {
                    order_items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        });

        // Transform the response
        const transformedOrder = {
            order_id: result.order_id,
            status: result.status,
            total_amount: result.total_amount,
            created_at: result.created_at,
            completed_at: result.completed_at,
            payment_intent_id: result.payment_intent_id,
            items: result.order_items.map(item => ({
                order_item_id: item.order_item_id,
                product: {
                    product_id: item.product.product_id,
                    name: item.product.name,
                    description: item.product.description,
                    image_url: item.product.image_url,
                    price: item.product.price,
                    rating: item.product.rating
                },
                quantity: item.quantity,
                price_at_time: item.price_at_time,
                discount_at_time: item.discount_at_time,
                subtotal: (item.price_at_time * item.quantity) - item.discount_at_time
            }))
        };

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            order: transformedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update order'
        });
    }
};

module.exports = {
    getOrderHistory,
    updateOrder
};
