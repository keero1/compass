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

  // conductor
  const [modalVisible, setModalVisible] = useState(false);
  const [conductorDetails, setConductorDetails] = useState(null);

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
          'QR Code detected.. Verifying Conductor',
          ToastAndroid.SHORT,
        );
        setScanningEnabled(false);

        const scannedCode = codes[0];
        const qrDataString = scannedCode.value;

        // Assuming QR data is JSON formatted
        const qrData = JSON.parse(qrDataString);
        console.log(qrData);

        const {id, name, user_id} = qrData;

        const conductorDoc = await firestore()
          .collection('conductors')
          .doc(id)
          .get();

        if (conductorDoc.exists) {
          setConductorDetails({id, name, user_id});
          setModalVisible(true);
        } else {
          ToastAndroid.show('Conductor not found!', ToastAndroid.SHORT);
          setScanningEnabled(true);
        }

        setModalVisible(true);
      } else {
        console.log('QR code detected outside the scan area');
      }
    },
  });

  const bindConductorToBus = async () => {
    if (conductorDetails) {
      const {id, name} = conductorDetails;

      try {
        // Bind the conductor ID and name to the buses collection using the current user's bus ID
        await firestore().collection('buses').doc(userId).update({
          conductor_id: id,
          conductor_name: name,
        });

        ToastAndroid.show('Conductor assigned to bus!', ToastAndroid.SHORT);
        setModalVisible(false);
        setScanningEnabled(true);

        // Navigate back to the previous screen
        navigation.goBack();
      } catch (error) {
        ToastAndroid.show(
          'Error binding conductor to bus.',
          ToastAndroid.SHORT,
        );
        setModalVisible(false);
        setScanningEnabled(true);
      }
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
            Scan the QR Code from Conductor ID
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

      {/* Modal for conductor details */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conductor Details</Text>
            {conductorDetails && (
              <>
                <Text style={styles.modalText}>
                  Conductor Name: {conductorDetails.name}
                </Text>
                <Text style={styles.modalText}>
                  Conductor ID: {conductorDetails.id}
                </Text>
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={bindConductorToBus}>
                <Text style={styles.modalButtonText}>Bind to Bus</Text>
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
