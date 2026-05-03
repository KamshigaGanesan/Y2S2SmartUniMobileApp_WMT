import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import { io } from 'socket.io-client';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderItem = {
  name?: string;
  foodItem?: { name: string };
  qty?: number;
  quantity?: number;
  price?: number;
};

type Order = {
  _id: string;
  status: 'pending' | 'preparing' | 'onway' | 'delivered' | 'rejected';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
};

const SOCKET_URL = 'https://northern-uni-smartcampus-network-system-production.up.railway.app';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();

    const socket = io(SOCKET_URL);
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));

    socket.on('orderUpdated', (updatedOrder: Order) => {
      console.log('🔥 Order update received via socket:', updatedOrder);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });
    
    socket.on('newOrder', (newOrder: Order) => {
      console.log('🔥 New order received via socket:', newOrder);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/orders'));
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      const res = await fetch(apiUrl(`/api/orders/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      // The change will be reflected via socket, no need to manually update state here
    } catch (err: any) {
      console.log('❌ ERROR updating status:', err);
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending': return styles.pending;
      case 'preparing': return styles.preparing;
      case 'onway': return styles.onway;
      case 'delivered': return styles.delivered;
      case 'rejected': return styles.rejected;
      default: return {};
    }
  };
  
  const getStatusPillStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending': return styles.pendingPill;
      case 'preparing': return styles.preparingPill;
      case 'onway': return styles.onwayPill;
      case 'delivered': return styles.deliveredPill;
      case 'rejected': return styles.rejectedPill;
      default: return {};
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin Orders' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading Canteen Orders...</Text>
        </LinearGradient>
      </>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders}><Text>Retry</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Orders' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>📦 Manage Canteen Orders</Text>
          <Text style={styles.subtitle}>
            View and update the status of all incoming food orders in real-time.
          </Text>

          {orders.map((order) => (
            <View key={order._id} style={[styles.card, getStatusStyle(order.status)]}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{order._id.substring(0, 6)}</Text>
                <View style={[styles.statusPill, getStatusPillStyle(order.status)]}>
                  <Text style={styles.statusPillText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.total}>Total: LKR {order.totalAmount.toFixed(2)}</Text>
              <Text style={styles.meta}>Received: {new Date(order.createdAt).toLocaleString()}</Text>

              <View style={styles.itemsContainer}>
                {order.items?.map((item, i) => (
                  <Text key={i} style={styles.itemText}>
                    • {(item.foodItem?.name || 'Unknown Item')} x {(item.qty || item.quantity || 0)}
                  </Text>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                {['pending', 'preparing', 'onway', 'delivered', 'rejected'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    disabled={order.status === s}
                    onPress={() => updateStatus(order._id, s as Order['status'])}
                    style={[styles.statusButton, getStatusPillStyle(s as Order['status']), order.status === s && styles.activeStatusButton]}
                  >
                    <Text style={styles.statusButtonText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#4b5563', marginBottom: 16 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderColor: '#d1d5db',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: '700', color: '#374151' },
  total: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 12 },

  itemsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
  },
  itemText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  statusPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeStatusButton: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statusButtonText: { color: '#fff', fontWeight: '600', textTransform: 'capitalize' },

  // Status-specific styles
  pending: { borderColor: '#f59e0b' },
  preparing: { borderColor: '#facc15' },
  onway: { borderColor: '#3b82f6' },
  delivered: { borderColor: '#22c55e' },
  rejected: { borderColor: '#ef4444' },

  pendingPill: { backgroundColor: '#f59e0b' },
  preparingPill: { backgroundColor: '#facc15' },
  onwayPill: { backgroundColor: '#3b82f6' },
  deliveredPill: { backgroundColor: '#22c55e' },
  rejectedPill: { backgroundColor: '#ef4444' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#1e3a8a' },
  errorText: { color: '#b91c1c', fontSize: 16, marginBottom: 10 },
});