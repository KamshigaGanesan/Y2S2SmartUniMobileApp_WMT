const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, totalItems } = req.body;

    const formattedItems = items.map((item) => ({
      name: item.name,
      price: item.price || 0,
      qty: item.qty ?? item.quantity ?? 1,
      source: item.source || 'Main',
    }));

    const order = new Order({
      items: formattedItems,
      totalAmount,
      totalItems,
      status: 'preparing',
    });

    const saved = await order.save();

    // 🚀 REAL-TIME: NEW ORDER
    const io = req.app.get('io');
    io.emit('newOrder', saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
  id,
  { status },
  { new: true }
);

if (!updated) {
  return res.status(404).json({ message: 'Order not found' });
}

    // 🚀 REAL-TIME: STATUS UPDATE
    const io = req.app.get('io');
    io.emit('orderUpdated', updated);

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};