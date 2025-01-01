const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all orders for a user
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        user_id: parseInt(userId),
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Format the response
    const formattedOrders = orders.map(order => ({
      order_id: order.order_id,
      status: order.status,
      total_amount: parseFloat(order.total_amount),
      created_at: order.created_at,
      completed_at: order.completed_at,
      items: order.order_items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        product: {
          name: item.product.name,
          image: item.product.image,
        },
      })),
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        order_id: parseInt(orderId),
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format the response
    const formattedOrder = {
      order_id: order.order_id,
      status: order.status,
      total_amount: parseFloat(order.total_amount),
      created_at: order.created_at,
      completed_at: order.completed_at,
      items: order.order_items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price),
        product: {
          name: item.product.name,
          image: item.product.image,
        },
      })),
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
};
