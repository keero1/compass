import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';

const ProximityAlertModal = ({
  modalVisible,
  setModalVisible,
  handleMarkerPlacement,
  selectedRadius,
}) => {
  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Select the radius for proximity alerts:
          </Text>

          <TouchableOpacity
            onPress={async () => {
              await handleMarkerPlacement(selectedRadius, 1000);
              setModalVisible(false);
            }}
            style={styles.radiusButton}>
            <Text style={styles.buttonText}>1 km</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await handleMarkerPlacement(selectedRadius, 3000);
              setModalVisible(false);
            }}
            style={styles.radiusButton}>
            <Text style={styles.buttonText}>3 km</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await handleMarkerPlacement(selectedRadius, 5000);
              setModalVisible(false);
            }}
            style={styles.radiusButton}>
            <Text style={styles.buttonText}>5 km</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 320,
    paddingVertical: 20,
    paddingHorizontal: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  radiusButton: {
    width: '100%',
    backgroundColor: '#176B87', // Main button color
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#FF4C4C', // Red color for cancel
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProximityAlertModal;
