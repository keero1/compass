import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  Modal,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {Svg, Defs, Rect, Mask, Line} from 'react-native-svg';

// messaging api
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import {ROUTES} from '../../../constants/';

const QRCamera = ({navigation}) => {
  const device = useCameraDevice('back');
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState('not-determined');
  const [torch, setTorch] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(true);

  //transaction stuff
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [token, setToken] = useState(null);

  // Get device dimensions
  const {width, height} = Dimensions.get('window');
  // Calculate dynamic rectangle size
  const rectSize = Math.min(width, height) * 0.9;
  const lineLength = 30;
  const strokeWidth = 4;
  const cornerOffsetX = width * 0.05;
  const cornerOffsetY = height * 0.25;

  //user
  const userId = auth().currentUser.uid;

  // qr code

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async codes => {
      if (!scanningEnabled) return;

      const scanArea = {
        x: cornerOffsetX,
        y: cornerOffsetY,
        width: rectSize,
        height: rectSize,
      };

      const codeInScanArea = codes.some(code => {
        const xMin = Math.min(...code.corners.map(c => c.x));
        const xMax = Math.max(...code.corners.map(c => c.x));
        const yMin = Math.min(...code.corners.map(c => c.y));
        const yMax = Math.max(...code.corners.map(c => c.y));

        return (
          xMin >= scanArea.x &&
          xMax <= scanArea.x + scanArea.width &&
          yMin >= scanArea.y &&
          yMax <= scanArea.y + scanArea.height
        );
      });

      if (codeInScanArea) {
        console.log('QR code detected inside the scan area');
        ToastAndroid.show(
          'QR Code detected.. Generating Payment Details',
          ToastAndroid.SHORT,
        );
        setScanningEnabled(false);

        const scannedCode = codes[0];
        const qrDataString = scannedCode.value;

        // Assuming QR data is JSON formatted
        const qrData = JSON.parse(qrDataString);
        console.log(qrData);

        setToken(qrData.token);

        // Set payment details and show modal
        setPaymentDetails(qrData);
        await fetchUserBalance(); // Fetch user balance
        setModalVisible(true);
      } else {
        console.log('QR code detected outside the scan area');
      }
    },
  });

  const fetchUserBalance = async () => {
    const walletDoc = await firestore()
      .collection('users')
      .doc(userId)
      .collection('wallet')
      .doc('wallet')
      .get();

    if (walletDoc.exists) {
      const walletData = walletDoc.data();
      setUserBalance(walletData.balance);
    } else {
      console.log('Wallet not found!');
      setUserBalance(0);
    }
  };

  const processPayment = async () => {
    if (paymentDetails) {
      const {fare_amount, reference_number} = paymentDetails;

      if (userBalance < fare_amount) {
        ToastAndroid.show('Not enough balance!', ToastAndroid.SHORT);
        return;
      }

      try {
        // Update the document with the payment details
        await firestore().collection('tokens').doc(token).update({
          passenger_id: userId,
          fare_amount: fare_amount, // Update the fare amount
          reference_number: reference_number, // Update the reference number
        });
      } catch (error) {
        ToastAndroid.show('QRCode expired.', ToastAndroid.SHORT);
        setModalVisible(false);
        setScanningEnabled(true);

        return;
      }

      await firestore()
        .collection('users')
        .doc(userId)
        .collection('wallet')
        .doc('wallet')
        .update({
          balance: firestore.FieldValue.increment(-fare_amount),
          last_updated: firestore.FieldValue.serverTimestamp(),
        });

      ToastAndroid.show('Payment successful!', ToastAndroid.SHORT);
      setModalVisible(false);
      setScanningEnabled(true);

      navigation.navigate(ROUTES.WALLET);
    }
  };

  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === 'denied') await Linking.openSettings();
    setCameraPermissionStatus(permission);
  }, []);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const handleTorchPress = () => {
    setTorch(prev => !prev);
  };

  const formatNumber = number => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(number);
  };

  const onError = useCallback(error => {
    console.log(error);
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        {cameraPermissionStatus === 'granted' && (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            onError={onError}
            codeScanner={codeScanner}
            torch={torch ? 'on' : 'off'}
          />
        )}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Scan the QR Code from Bus App
          </Text>
        </View>
        {/* <View
          style={[
            styles.scanArea,
            {
              width: rectSize,
              height: rectSize,
              left: cornerOffsetX,
              top: cornerOffsetY,
            },
          ]}
        /> */}
        <View style={styles.svgContainer}>
          <Svg height="100%" width="100%">
            <Defs>
              <Mask id="mask" x="0" y="0" height="100%" width="100%">
                <Rect height="100%" width="100%" fill="#fff" />
                {/* Dynamic size for the mask */}
                <Rect
                  x={cornerOffsetX}
                  y={cornerOffsetY}
                  width={rectSize}
                  height={rectSize}
                  fill="black"
                />
              </Mask>
            </Defs>

            {/* BLACK */}

            {/* <Rect
              height="100%"
              width="100%"
              fill="rgba(0, 0, 0, 0.8)"
              mask="url(#mask)"
            /> */}

            {/* Top-left corner lines */}
            <Line
              x1={cornerOffsetX} // Start at the top-left corner
              y1={cornerOffsetY}
              x2={cornerOffsetX + lineLength} // Horizontal top-left line
              y2={cornerOffsetY}
              stroke="white"
              strokeWidth={strokeWidth}
            />
            <Line
              x1={cornerOffsetX} // Vertical top-left line
              y1={cornerOffsetY}
              x2={cornerOffsetX}
              y2={cornerOffsetY + lineLength}
              stroke="white"
              strokeWidth={strokeWidth}
            />

            {/* Top-right corner lines */}
            <Line
              x1={cornerOffsetX + rectSize - lineLength} // Horizontal top-right line
              y1={cornerOffsetY}
              x2={cornerOffsetX + rectSize}
              y2={cornerOffsetY}
              stroke="white"
              strokeWidth={strokeWidth}
            />
            <Line
              x1={cornerOffsetX + rectSize} // Vertical top-right line
              y1={cornerOffsetY}
              x2={cornerOffsetX + rectSize}
              y2={cornerOffsetY + lineLength}
              stroke="white"
              strokeWidth={strokeWidth}
            />

            {/* Bottom-left corner lines */}
            <Line
              x1={cornerOffsetX} // Horizontal bottom-left line
              y1={cornerOffsetY + rectSize}
              x2={cornerOffsetX + lineLength}
              y2={cornerOffsetY + rectSize}
              stroke="white"
              strokeWidth={strokeWidth}
            />
            <Line
              x1={cornerOffsetX} // Vertical bottom-left line
              y1={cornerOffsetY + rectSize - lineLength}
              x2={cornerOffsetX}
              y2={cornerOffsetY + rectSize}
              stroke="white"
              strokeWidth={strokeWidth}
            />

            {/* Bottom-right corner lines */}
            <Line
              x1={cornerOffsetX + rectSize - lineLength} // Horizontal bottom-right line
              y1={cornerOffsetY + rectSize}
              x2={cornerOffsetX + rectSize}
              y2={cornerOffsetY + rectSize}
              stroke="white"
              strokeWidth={strokeWidth}
            />
            <Line
              x1={cornerOffsetX + rectSize} // Vertical bottom-right line
              y1={cornerOffsetY + rectSize - lineLength}
              x2={cornerOffsetX + rectSize}
              y2={cornerOffsetY + rectSize}
              stroke="white"
              strokeWidth={strokeWidth}
            />
          </Svg>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleTorchPress}>
          <Text style={styles.buttonText}>Torch</Text>
        </TouchableOpacity>
      </View>
      {/* Modal for payment details */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            {paymentDetails && (
              <>
                <Text style={styles.modalText}>
                  Bus Driver Name: {paymentDetails.bus_driver_name}
                </Text>
                <Text style={styles.modalText}>
                  Fare Amount: {formatNumber(paymentDetails.fare_amount)}
                </Text>
                <Text style={styles.modalText}>
                  Reference: {paymentDetails.reference_number}
                </Text>
                <Text style={styles.modalText}>
                  Available Balance: {formatNumber(userBalance)}
                </Text>
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={processPayment}>
                <Text style={styles.modalButtonText}>Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  setScanningEnabled(true);
                }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanArea: {
    borderWidth: 2,
    borderColor: 'red',
    position: 'absolute',
  },
  instructionContainer: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#176B87',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#176B87',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default QRCamera;
