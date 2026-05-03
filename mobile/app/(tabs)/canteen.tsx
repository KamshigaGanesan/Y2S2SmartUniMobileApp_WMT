import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type UiCategory = 'All' | 'Meals' | 'Snacks' | 'Drinks';

type FoodItem = {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Beverages' | 'Snacks';
  price: number;
  description: string;
  image?: string;
  availability: 'Available' | 'Unavailable';
  canteenId?: 'Main' | 'Eagle'; // safer
};

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_WIDTH = (width - 20 * 2 - CARD_GAP) / 2;

const fallbackImages: Record<string, string> = {
  idly: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',
  dosa: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  chicken: 'https://images.unsplash.com/photo-1604908177225-5d5b3d4e6c2c?auto=format&fit=crop&w=900&q=80',
  rice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
  juice: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=900&q=80',
  snack: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
};

export default function CanteenScreen() {
  const [mode, setMode] = useState<'canteen' | 'external'>('canteen');
  const [canteen, setCanteen] = useState<'main' | 'eagle'>('main');

  const [selectedCategory, setSelectedCategory] = useState<UiCategory>('All');
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useEffect(() => {
  Notifications.requestPermissionsAsync();
}, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(apiUrl('/api/food'));
      const data = await response.json();

      const mapped: FoodItem[] = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image || '',
        availability: item.availability,
        canteenId: item.canteenId || 'Main',
      }));

      setItems(mapped);

      const initialQty: Record<string, number> = {};
      mapped.forEach((item) => {
        initialQty[item.id] = 0;
      });
      setQuantities(initialQty);
    } catch (error) {
      console.log('Error fetching food items:', error);
      setMessage('Failed to load canteen items.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const mapBackendCategoryToUi = (category: FoodItem['category']): UiCategory => {
    if (category === 'Beverages') return 'Drinks';
    if (category === 'Snacks') return 'Snacks';
    return 'Meals';
  };

  const router = useRouter();

const [restaurantName, setRestaurantName] = useState('');
const [orderItems, setOrderItems] = useState<any[]>([]);

const quickItems = [
  { name: 'Burger', price: 500 },
  { name: 'Pizza', price: 1200 },
  { name: 'Fried Rice', price: 700 },
  { name: 'Kottu', price: 800 },
];

const addItem = (item: any) => {
  setOrderItems((prev) => {
    const existing = prev.find((i) => i.name === item.name);

    if (existing) {
      return prev.map((i) =>
        i.name === item.name
          ? { ...i, qty: i.qty + 1 }
          : i
      );
    }

    return [...prev, { ...item, qty: 1 }];
  });
};
 
const decreaseItem = (name: string) => {
  setOrderItems((prev) =>
    prev
      .map((item) =>
        item.name === name
          ? { ...item, qty: item.qty - 1 }
          : item
      )
      .filter((item) => item.qty > 0)
  );
};

const removeItem = (name: string) => {
  setOrderItems((prev) => prev.filter((item) => item.name !== name));
};

const externalTotal = orderItems.reduce(
  (sum, item) => sum + item.price * item.qty,
  0
);

 const filteredItems = useMemo(() => {
  const q = searchText.trim().toLowerCase();

  return items.filter((item) => {
    const itemCanteen = (item.canteenId || 'Main').toLowerCase();

    // ✅ FIX: allow MAIN to show items without breaking
    if (canteen === 'eagle') {
      if (itemCanteen !== 'eagle') return false;
    }

    // MAIN = show everything (like before)
    // (this restores your old working behavior)

    const uiCategory = mapBackendCategoryToUi(item.category);

    const matchesCategory =
      selectedCategory === 'All' || uiCategory === selectedCategory;

    const matchesSearch =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });
}, [items, searchText, selectedCategory, canteen]);

  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const total = items.reduce((sum, item) => {
    return sum + (quantities[item.id] || 0) * item.price;
  }, 0);

  const increaseQty = (id: string, availability: FoodItem['availability']) => {
    if (availability === 'Unavailable') return;

    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

const removeCartItem = (id: string) => {
  if (id.startsWith('external')) {
    const name = id.replace('external-', '');
    setOrderItems((prev) => prev.filter((i) => i.name !== name));
  } else {
    setQuantities((prev) => ({
      ...prev,
      [id]: 0,
    }));
  }
};

const increaseCartQty = (item: any) => {
  if (item.id.startsWith('external')) {
    setOrderItems((prev) =>
      prev.map((i) =>
        i.name === item.name ? { ...i, qty: i.qty + 1 } : i
      )
    );
  } else {
    increaseQty(item.id, 'Available');
  }
};

const decreaseCartQty = (item: any) => {
  if (item.id.startsWith('external')) {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.name === item.name ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );
  } else {
    decreaseQty(item.id);
  }
};  

const [eta, setEta] = useState(0);

const startTracking = () => {
  setOrderStatus('preparing');
  setEta(10); // 10 seconds demo

  const interval = setInterval(() => {
    setEta((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setOrderStatus('delivered');
        setShowQR(true);
        return 0;
      }

      if (prev === 7) setOrderStatus('onway');

      return prev - 1;
    });
  }, 1000);
};

const [orderStatus, setOrderStatus] = useState<'idle' | 'preparing' | 'onway' | 'delivered'>('idle');
const [showQR, setShowQR] = useState(false);

const handlePlaceOrder = async () => {
  if (totalItems === 0) {
    setMessage('Please add at least one item to the cart.');
    setMessageType('error');
    return;
  }

  try {
    // ✅ SEND TO BACKEND
    await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: mergedCartItems,   // 🔥 important
        totalAmount: total,       // your current total
        totalItems: totalItems,
      }),
    });

    // ✅ SUCCESS MESSAGE
    setMessage(`Order placed successfully! Total: LKR ${total}`);
    setMessageType('success');

    // 🚀 START TRACKING (YOUR LOGIC KEPT)
    setOrderStatus('preparing');
    setShowQR(false);

    setTimeout(() => {
      setOrderStatus('onway');
    }, 3000);

    setTimeout(() => {
      setOrderStatus('delivered');
      setShowQR(true);
    }, 6000);

    // 🔄 RESET ONLY CANTEEN ITEMS (KEEP EXTERNAL)
    const resetQty: Record<string, number> = {};
    items.forEach((item) => {
      resetQty[item.id] = 0;
    });
    setQuantities(resetQty);

  } catch (error) {
    setMessage('Failed to place order. Try again.');
    setMessageType('error');
  }
};
 const handleResetCart = () => {
  // Reset canteen items
  const resetQty: Record<string, number> = {};
  items.forEach((item) => {
    resetQty[item.id] = 0;
  });
  setQuantities(resetQty);

  setTimeout(async () => {
  setOrderStatus('delivered');
  setShowQR(true);

  // 🔔 PUSH NOTIFICATION
  if (Platform.OS !== 'web') {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍔 Order Ready!',
      body: 'Your food has been delivered 🎉',
    },
    trigger: null,
  });

}
 },6000);

// 🔥 Reset external items
  setOrderItems([]);

  // 🔥 Reset tracking system
  setOrderStatus('idle');
  setShowQR(false);

  // UX feedback
  setMessage('Cart cleared successfully');
  setMessageType('success');
};

    const getBadgeText = (item: FoodItem) => {
    if (item.category === 'Lunch') return 'Popular Item';
    if (item.category === 'Snacks') return 'Quick Snack';
    if (item.category === 'Beverages') return 'Fresh Drink';
    if (item.category === 'Breakfast') return 'Morning Pick';
    return 'Student Favorite';
  };

  const getFoodImage = (item: FoodItem) => {
    if (item.image && item.image.trim()) return item.image;

    const name = item.name.toLowerCase();

    if (name.includes('idly')) return fallbackImages.idly;
    if (name.includes('dosa')) return fallbackImages.dosa;
    if (name.includes('burger')) return fallbackImages.burger;
    if (name.includes('chicken')) return fallbackImages.chicken;
    if (name.includes('rice')) return fallbackImages.rice;
    if (name.includes('coffee')) return fallbackImages.coffee;
    if (name.includes('tea')) return fallbackImages.tea;
    if (name.includes('juice')) return fallbackImages.juice;
    if (item.category === 'Snacks') return fallbackImages.snack;

    return fallbackImages.default;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Canteen' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc', '#e0e7ff']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading canteen items...</Text>
        </LinearGradient>
      </>
    );
  }

  const mergedCartItems = [
  // 🏫 Canteen items
  ...items
    .filter((item) => (quantities[item.id] || 0) > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      qty: quantities[item.id],
      price: item.price,
      source: item.canteenId || 'Main',
    })),

  // 🍔 External items
  ...orderItems.map((item) => ({
    id: `external-${item.name}`,
    name: item.name,
    qty: item.qty,
    price: item.price,
    source: restaurantName || 'External',
  })),
];
const mergedTotal = mergedCartItems.reduce(
  (sum, item) => sum + item.price * item.qty,
  0
);

const mergedCount = mergedCartItems.reduce(
  (sum, item) => sum + item.qty,
  0
);

  return (
    <>
      <Stack.Screen options={{ title: 'Canteen' }} />

      <LinearGradient colors={['#eef2ff', '#f8fafc', '#e0e7ff']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#2563eb', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>🍔 Canteen Menu</Text>
                <Text style={styles.heroSubtitle}>
                  Fresh food, smart ordering, and a smooth campus dining experience.
                </Text>
              </View>

              <View style={styles.heroMiniCard}>
                <Text style={styles.heroMiniValue}>{mergedCount}</Text>
                <Text style={styles.heroMiniLabel}>Items</Text>
              </View>
              {/* 📜 HISTORY */}
  <TouchableOpacity
    onPress={() => router.push('/history')}
    activeOpacity={0.85}
  >
    <View style={styles.heroMiniCard}>
      <Text style={styles.heroMiniValue}>📜</Text>
      <Text style={styles.heroMiniLabel}>History</Text>
    </View>
  </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search food items..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setMode('canteen');
                  setCanteen('main');
                }}
                style={[
                  styles.switchBtn,
                  mode === 'canteen' && canteen === 'main' && styles.activeSwitch
                ]}
              >
                <Text style={[styles.switchText, mode === 'canteen' && canteen === 'main' && styles.activeSwitchText]}>🏫 Main</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode('canteen');
                  setCanteen('eagle');
                }}
                style={[
                  styles.switchBtn,
                  mode === 'canteen' && canteen === 'eagle' && styles.activeSwitch
                ]}
              >
                <Text style={[styles.switchText, mode === 'canteen' && canteen === 'eagle' && styles.activeSwitchText]}>🦅 Eagle</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <View style={styles.externalBox}>
  <TouchableOpacity
    onPress={() => setMode('external')}
    activeOpacity={0.7}
    style={{
      backgroundColor: '#111827',
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    }}
  >
    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>
      🍔 Order from External Restaurants →
    </Text>
    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
      Order from KFC, Pizza Hut, BBQ & more
    </Text>
  </TouchableOpacity>
</View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(['All', 'Meals', 'Snacks', 'Drinks'] as UiCategory[]).map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, selectedCategory === category && styles.activeChip]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.activeChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            
    

          {mode === 'canteen' ? (
  filteredItems.length > 0 ? (
    <View style={styles.grid}>
      {filteredItems.map((item) => {
        const qty = quantities[item.id] || 0;

        return (
          <View key={item.id} style={styles.gridCard}>
  <Image
    source={{ uri: getFoodImage(item) }}
    style={styles.foodImage}
    resizeMode="cover"
  />

  <View style={styles.cardContent}>
    <View style={styles.topRow}>
      <View style={styles.foodBadge}>
        <Text style={styles.foodBadgeText}>
          {getBadgeText(item)}
        </Text>
      </View>

      <Text
        style={
          item.availability === 'Available'
            ? styles.status
            : styles.unavailableStatus
        }
      >
        {item.availability}
      </Text>
    </View>

    <Text style={styles.foodName} numberOfLines={1}>
      {item.name}
    </Text>

    <Text style={styles.foodDetails} numberOfLines={2}>
      {item.description}
    </Text>

    <Text style={styles.price}>LKR {item.price}</Text>

    <View style={styles.qtyRow}>
      <TouchableOpacity
        onPress={() => decreaseQty(item.id)}
        style={styles.qtyButton}
      >
        <Text style={styles.qtyButtonText}>-</Text>
      </TouchableOpacity>

      <Text style={styles.qtyText}>
        {quantities[item.id] || 0}
      </Text>

      <TouchableOpacity
        onPress={() => increaseQty(item.id, item.availability)}
        style={
          item.availability === 'Available'
            ? styles.qtyButton
            : styles.disabledQtyButton
        }
      >
        <Text style={styles.qtyButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
</View>
        );
      })}
    </View>
  ) : (
    <Text style={styles.noResults}>No matching food items found.</Text>
  )
) : (
  <View style={styles.customBox}>

    {/* 🔙 Back */}
    <TouchableOpacity
      onPress={() => setMode('canteen')}
      style={styles.backBtn}
    >
      <Text style={styles.backText}>← Back to Canteen</Text>
    </TouchableOpacity>

    {/* 🍔 Restaurant */}
    <Text style={styles.customTitle}>🍔 Select Restaurant</Text>

    <View style={styles.chipWrap}>
      {['KFC', 'Pizza Hut', 'BBQ', 'Juice Bar', 'Jaffna Special'].map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => setRestaurantName(r)}
          style={[
            styles.restaurantChip,
            restaurantName === r && styles.activeRestaurantChip
          ]}
        >
          <Text
            style={[
              styles.restaurantText,
              restaurantName === r && { color: '#fff' }
            ]}
          >
            {r}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.selectedText}>
      Selected: {restaurantName || 'None'}
    </Text>

    {/* 🧾 Quick Items */}
    <Text style={[styles.customTitle, { marginTop: 16 }]}>
      🧾 Quick Add Items
    </Text>

    <View style={styles.chipWrap}>
      {quickItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          onPress={() => addItem(item)}
          style={styles.quickChip}
        >
          <Text style={{ color: '#fff' }}>
            {item.name} - LKR {item.price}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* 🛒 Selected Items */}
    <View style={{ marginTop: 16 }}>
      {orderItems.length === 0 ? (
        <Text style={{ color: '#6b7280' }}>No items selected</Text>
      ) : (
        orderItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            
            <Text style={styles.itemName}>
              {item.name}
            </Text>

            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => decreaseItem(item.name)}>
                <Text style={styles.qtyBtn}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyText}>{item.qty}</Text>

              <TouchableOpacity onPress={() => addItem(item)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.priceText}>
              LKR {item.price * item.qty}
            </Text>

            <TouchableOpacity onPress={() => removeItem(item.name)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
    
    {/* 🚚 ORDER TRACKING */}
{orderStatus !== 'idle' && (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontWeight: '700', marginBottom: 6 }}>
      📦 Order Status:
    </Text>

      <Text style={{ color: '#6b7280', marginTop: 4 }}>
    ⏱ ETA: {eta}s
  </Text> 

    <Text style={{ color: '#1e3a8a', fontWeight: '700' }}>
      {orderStatus === 'preparing' && '👨‍🍳 Preparing your food...'}
      {orderStatus === 'onway' && '🚚 On the way...'}
      {orderStatus === 'delivered' && '✅ Delivered'}
    </Text>
  </View>
)}
     
     {/* 🔳 QR ACTION AFTER DELIVERY */}
{showQR && (
  <View style={{
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center'
  }}>
    <Text style={{ fontWeight: '700', marginBottom: 8 }}>
      📱 Scan QR to Confirm Delivery
    </Text>

    <TouchableOpacity
      onPress={() => router.push('/qr')}
      style={{
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
        Open Scanner
      </Text>
    </TouchableOpacity>

    <Text style={{ fontSize: 12, marginTop: 6, color: '#6b7280' }}>
      Delivery staff will scan this
    </Text>
  </View>
)}
    {/* 💰 Total */}
    <Text style={styles.totalText}>
      Total: LKR {externalTotal}
    </Text>

    {/* 🚀 Add to Cart */}
    <TouchableOpacity
      style={styles.orderButton}
      onPress={() => {
  if (orderItems.length === 0) return;

  // ✅ DO NOTHING with quantities
  // External items already stored in orderItems

  setMode('canteen'); // just go back
}}
    >
      <Text style={styles.orderButtonText}>
        Add to Cart
      </Text>
    </TouchableOpacity>

  </View>
)}
{/* 🛒 CART SUMMARY */}
{mode === 'canteen' && (
  <View style={styles.cartCard}>
  <Text style={styles.cartTitle}>🛒 Cart Summary</Text>

  {message ? (
    <View
      style={[
        styles.cartMessageBox,
        messageType === 'success'
          ? styles.successMessageBox
          : styles.errorMessageBox,
      ]}
    >
      <Text style={styles.cartMessageText}>
        {messageType === 'success' ? '✅ ' : '⚠️ '}
        {message}
      </Text>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => setMessage('')}
      >
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  ) : null}

 {mergedCartItems.length === 0 ? (
  <Text style={styles.emptyCart}>Your cart is empty.</Text>
) : (
  mergedCartItems.map((item) => (
  <View
    key={item.id}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    }}
  >
    {/* LEFT SIDE */}
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '700', fontSize: 15 }}>
        {item.name}
      </Text>

      <Text style={{ fontSize: 12, color: '#6b7280' }}>
        {item.source}
      </Text>
    </View>

    {/* QTY CONTROL */}
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
      }}
    >
      <TouchableOpacity onPress={() => decreaseCartQty(item)}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>-</Text>
      </TouchableOpacity>

      <Text style={{ marginHorizontal: 8, fontWeight: 'bold' }}>
        {item.qty}
      </Text>

      <TouchableOpacity onPress={() => increaseCartQty(item)}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </View>

    {/* PRICE */}
    <Text
      style={{
        width: 90,
        textAlign: 'right',
        fontWeight: '700',
        color: '#1e3a8a',
      }}
    >
      LKR {item.price * item.qty}
    </Text>

    {/* REMOVE */}
    <TouchableOpacity onPress={() => removeCartItem(item.id)}>
      <Text style={{ color: 'red', marginLeft: 8, fontSize: 16 }}>✕</Text>
    </TouchableOpacity>
  </View>
))
)}

  <View style={styles.cartFooter}>
    <Text style={styles.cartText}>Total Items: {mergedCount}</Text>
    <Text style={styles.cartTotal}>Total Amount: LKR {mergedTotal}</Text>
  </View>

  <TouchableOpacity
    style={styles.resetButton}
    onPress={handleResetCart}
  >
    <Text style={styles.resetButtonText}>Reset Cart</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.orderButton}
    onPress={handlePlaceOrder}
  >
    <Text style={styles.orderButtonText}>Place Order</Text>
  </TouchableOpacity>
  {/* 💳 PAYMENT QR */}
{mergedTotal > 0 && (
  <View style={{
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center'
  }}>
    <Text style={{ fontWeight: '700', marginBottom: 8 }}>
      💳 Scan to Pay
    </Text>

    <Image
      source={{
        uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAY-LKR-${mergedTotal}`
      }}
      style={{ width: 120, height: 120 }}
    />

    <Text style={{ fontSize: 12, marginTop: 6, color: '#6b7280' }}>
      Pay before order is processed
    </Text>
  </View>
)}
  </View>
)}
</ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  heroCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroGlowOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -30,
    right: -20,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -70,
    left: -40,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
  },
  heroMiniCard: {
    minWidth: 72,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroMiniValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroMiniLabel: {
    fontSize: 12,
    color: '#dbeafe',
    marginTop: 2,
  },

  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },

  filterRow: {
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  filterText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
  },
  activeChipText: {
    color: '#ffffff',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: CARD_GAP,
    marginBottom: 18,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  foodImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#dbeafe',
  },
  cardContent: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  foodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  foodBadgeText: {
    color: '#1e3a8a',
    fontSize: 11,
    fontWeight: '700',
  },
  foodName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  foodDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  status: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
  },
  unavailableStatus: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '700',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 14,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyButton: {
    backgroundColor: '#1e3a8a',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQtyButton: {
    backgroundColor: '#9ca3af',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },

  noResults: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginVertical: 22,
  },

  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  cartMessageBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  successMessageBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  errorMessageBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  cartMessageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dismissButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  cartItem: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 15,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  emptyCart: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  cartFooter: {
    marginTop: 6,
    marginBottom: 16,
  },
  cartText: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 8,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  resetButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  orderButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  switchBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeSwitch: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  switchText: {
    color: '#dbeafe',
    fontWeight: '700',
    fontSize: 15,
  },
  activeSwitchText: {
    color: '#1e3a8a',
  },

  externalBox: {
    marginTop: 6,
    marginBottom: 16,
  },
  externalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1e3a8a',
  },
  externalChip: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  externalChipText: {
    color: '#fff',
    fontWeight: '700',
  },

  customBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  customTitle: {
    fontWeight: '800',
    marginBottom: 12,
    fontSize: 18,
    color: '#1e3a8a',
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  externalOrderBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 16,
  }, 

  backBtn: {
  backgroundColor: '#1e3a8a',
  padding: 10,
  borderRadius: 10,
  marginBottom: 12,
  alignSelf: 'flex-start'
},
backText: {
  color: '#fff',
  fontWeight: 'bold'
},

chipWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
},

restaurantChip: {
  backgroundColor: '#111827',
  padding: 10,
  borderRadius: 20,
},

activeRestaurantChip: {
  backgroundColor: '#2563eb',
},

restaurantText: {
  color: '#fff',
},

quickChip: {
  backgroundColor: '#2563eb',
  padding: 10,
  borderRadius: 15,
},

selectedText: {
  marginTop: 8,
  fontWeight: '600',
},

itemRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
},

itemName: {
  flex: 1,
  fontWeight: '600',
},

qtyBox: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

qtyBtn: {
  fontSize: 18,
  fontWeight: 'bold',
  paddingHorizontal: 8,
},

qtyText: {
  fontWeight: 'bold',
},

priceText: {
  width: 90,
  textAlign: 'right',
},

removeText: {
  color: 'red',
  marginLeft: 10,
},

totalText: {
  marginTop: 12,
  fontWeight: 'bold',
  fontSize: 16,
},
});