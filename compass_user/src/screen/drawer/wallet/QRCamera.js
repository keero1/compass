import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {Svg, Defs, Rect, Mask, Line} from 'react-native-svg';

const QRCamera = () => {
  const device = useCameraDevice('back');
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState('not-determined');

  // Get device dimensions
  const {width, height} = Dimensions.get('window');

  // torch
  const [torch, setTorch] = useState(false);

  const [scanningEnabled, setScanningEnabled] = useState(true);

  // Calculate dynamic rectangle size
  const rectSize = Math.min(width, height) * 0.9;
  const lineLength = 30;
  const strokeWidth = 4;
  const cornerOffsetX = width * 0.05;
  const cornerOffsetY = height * 0.25;

  // qr code

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
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

        const isInScanArea =
          xMin >= scanArea.x &&
          xMax <= scanArea.x + scanArea.width &&
          yMin >= scanArea.y &&
          yMax <= scanArea.y + scanArea.height;

        return isInScanArea;
      });

      if (codeInScanArea) {
        console.log('QR code detected inside the scan area');
        // Process the QR code
        ToastAndroid.show('QR Code detected:', ToastAndroid.SHORT);
        setScanningEnabled(false);
      } else {
        console.log('QR code detected outside the scan area');
      }
    },
  });

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

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.root}>
        {cameraPermissionStatus === 'granted' && (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            codeScanner={codeScanner}
            enableZoomGesture={true}
            torch={torch ? 'on' : 'off'}
          />
        )}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Scan the QR Code from Bus App
          </Text>
        </View>
        <View
          style={[
            styles.scanArea,
            {
              width: rectSize,
              height: rectSize,
              left: cornerOffsetX,
              top: cornerOffsetY,
            },
          ]}
        />
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

            <Rect
              height="100%"
              width="100%"
              fill="rgba(0, 0, 0, 0.8)"
              mask="url(#mask)"
            />

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
    backgroundColor: '#007BFF',
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
});

export default QRCamera;
