import { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { Camera } from 'expo-camera';

export default function QRScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = ({ data }: any) => {
    setScanned(true);

    Alert.alert(
      'Delivery Confirmed',
      data,
      [
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  if (hasPermission === null) return <Text>Requesting camera...</Text>;
  if (hasPermission === false) return <Text>No access</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        onBarCodeScanned={scanned ? undefined : handleScan}
        barCodeScannerSettings={{
          barCodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
          ],
        }}
      />

      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}
    </View>
  );
}