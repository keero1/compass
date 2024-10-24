import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';

// Custom Text Component
const CustomText = ({style, children, ...props}) => {
  return (
    <Text style={[styles.textColor, style]} {...props}>
      {children}
    </Text>
  );
};

const TermsModal = ({visible, onClose}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <CustomText style={styles.modalTitle}>
              Terms and Conditions
            </CustomText>
            <CustomText style={styles.lastUpdated}>
              Last Updated: October 24, 2024
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              1. Definition
            </CustomText>
            <CustomText>
              1.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>
            <CustomText>
              1.2 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              2. Eligibility
            </CustomText>
            <CustomText>
              2.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>
            <CustomText>
              2.2 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              3. User Accounts
            </CustomText>
            <CustomText>
              3.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>
            <CustomText>
              3.2 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              4. Use of the App
            </CustomText>
            <CustomText>
              4.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>
            <CustomText>
              4.2 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>5. Payment</CustomText>
            <CustomText>
              5.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              6. Cancellation and Refund Policy
            </CustomText>
            <CustomText>
              6.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              7. User Conduct
            </CustomText>
            <CustomText>
              7.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>8. Privacy</CustomText>
            <CustomText>
              8.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              9. Intellectual Property
            </CustomText>
            <CustomText>
              9.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              10. Limitation of Liability
            </CustomText>
            <CustomText>
              10.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              11. Indemnification
            </CustomText>
            <CustomText>
              11.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              12. Modification of Terms
            </CustomText>
            <CustomText>
              12.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              13. Termination
            </CustomText>
            <CustomText>
              13.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              14. Governing Law
            </CustomText>
            <CustomText>
              14.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            <CustomText style={styles.modalSectionTitle}>
              15. Contact Us
            </CustomText>
            <CustomText>
              15.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </CustomText>

            {/* Acknowledgment Text */}
            <CustomText style={styles.acknowledgmentText}>
              By using ComPass, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
            </CustomText>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CustomText style={styles.closeButtonText}>Close</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lastUpdated: {
    fontStyle: 'italic',
    marginBottom: 20, // Space between last updated and content
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  acknowledgmentText: {
    marginTop: 20,
    marginBottom: 30,
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#176B87',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textColor: {
    color: 'black', // Set the desired text color
  },
});

export default TermsModal;
