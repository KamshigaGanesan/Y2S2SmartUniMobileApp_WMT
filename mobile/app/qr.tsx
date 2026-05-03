import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function QRScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleScan = ({ data }) => {
    setScanned(true);
    alert(`Delivery Confirmed: ${data}`);
  };

  if (hasPermission === null) return <Text>Requesting camera...</Text>;
  if (hasPermission === false) return <Text>No access</Text>;

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleScan}
        style={{ flex: 1 }}
      />

      {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}