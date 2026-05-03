import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { apiUrl } from '@/constants/api';

export default function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
  fetchOrders();

  const interval = setInterval(fetchOrders, 5000); // refresh every 5s

  return () => clearInterval(interval);
}, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return '#facc15';
      case 'onway':
        return '#3b82f6';
      case 'delivered':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  // 👉 ADD HERE (below useEffect)

const groupOrders = (orders) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return {
    today: orders.filter(o => new Date(o.createdAt).toDateString() === today),
    yesterday: orders.filter(o => new Date(o.createdAt).toDateString() === yesterday),
    older: orders.filter(o => {
      const d = new Date(o.createdAt).toDateString();
      return d !== today && d !== yesterday;
    })
  };
};

const Timeline = ({ status }) => {
  const steps = ['preparing', 'onway', 'delivered'];

  return (
    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      {steps.map((step, i) => {
        const active = steps.indexOf(status) >= i;

        return (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: active ? '#22c55e' : '#d1d5db'
            }} />

            {i < steps.length - 1 && (
              <View style={{
                width: 40,
                height: 2,
                backgroundColor: active ? '#22c55e' : '#d1d5db'
              }} />
            )}
          </View>
        );
      })}
    </View>
  );
};

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(apiUrl('/api/orders'));
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };
 const grouped = groupOrders(orders);
 const renderOrder = (order, index) => {
  return (
    <View
      key={index}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 3
      }}
    >
      <Text style={{ fontWeight: '700', fontSize: 16 }}>
        Order #{index + 1}
      </Text>

      <View style={{
        backgroundColor: getStatusColor(order.status),
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginTop: 6
      }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {order.status}
        </Text>
      </View>

      {order.createdAt && (
        <Text style={{ color: '#6b7280', marginTop: 6 }}>
          Ordered at: {formatTime(order.createdAt)}
        </Text>
      )}

      <Text style={{ marginTop: 6 }}>
        Total: LKR {order.totalAmount}
      </Text>

      {/* 🔥 TIMELINE */}
      <Timeline status={order.status} />

      <View style={{ marginTop: 10 }}>
        {order.items?.map((item, i) => {
          const qty = item.qty ?? item.quantity ?? 0;
          const price = item.price ?? 0;

          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 6
              }}
            >
              <View>
                <Text style={{ fontWeight: '600' }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {item.source}
                </Text>
              </View>

              <Text>
                x{qty} — LKR {price * qty}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
  return (
  <ScrollView style={{ padding: 16, backgroundColor: '#f3f4f6' }}>
    
    <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 16 }}>
      📜 Order History
    </Text>

    {orders.length === 0 ? (
      <Text>No orders yet</Text>
    ) : (
      <>
        {grouped.today.length > 0 && (
          <>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>
              Today
            </Text>
            {grouped.today.map((order, index) =>
              renderOrder(order, index)
            )}
          </>
        )}

        {grouped.yesterday.length > 0 && (
          <>
            <Text style={{ fontWeight: '700', marginTop: 10 }}>
              Yesterday
            </Text>
            {grouped.yesterday.map((order, index) =>
              renderOrder(order, index)
            )}
          </>
        )}
      </>
    )}
  </ScrollView>
);
}