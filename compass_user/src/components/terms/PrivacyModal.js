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

const PrivacyModal = ({visible, onClose}) => {
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
              Privacy Policy
            </CustomText>
            <CustomText style={styles.lastUpdated}>
              Last Updated: October 24, 2024
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              1. Introduction
            </CustomText>
            <CustomText>
              ComPass respects your privacy and is committed to protecting your
              personal data. This Privacy Policy explains how we collect, use,
              and disclose your personal information when you use the ComPass
              mobile application and related services. By using our App, you
              consent to the collection and use of your information as outlined
              in this Privacy Policy. This policy complies with the Data Privacy
              Act of 2012 (RA 10173) of the Philippines.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              2. Information We Collect
            </CustomText>
            <CustomText>
              We collect the following types of information to provide you with
              a seamless experience on ComPass:
            </CustomText>
            <CustomText style={styles.modalSubTitle}>Personal Information</CustomText>
            <CustomText>
              Account Information: When you sign up for ComPass, we collect
              personal data such as name and email address.
            </CustomText>
            <CustomText>
              Location Data: To offer ride-hailing services, we collect and
              process your real-time location through GPS technology. This
              allows us to match you with nearby buses.
            </CustomText>
            <CustomText style={styles.modalSubTitle}>Driver Information</CustomText>
            <CustomText>
              Driver Profile: For drivers, we collect information like name,
              license plate, and phone number.
            </CustomText>
            <CustomText style={styles.modalSubTitle}>Usage Data</CustomText>
            <CustomText>
              App Usage: We may collect data about your interactions within the
              app.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              3. How We Use Your Information
            </CustomText>
            <CustomText>
              To provide and improve our services, we use your information to:
            </CustomText>
            <CustomText>
              - Connect passengers with buses and process ride payments.
            </CustomText>
            <CustomText>
              - Analyze usage data for functionality improvements.
            </CustomText>
            <CustomText>
              - Ensure safety by verifying bus driver identities and tracking
              buses in real time.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              4. Data Sharing and Disclosure
            </CustomText>
            <CustomText>
              We may share your information with trusted partners and in the
              following situations:
            </CustomText>
            <CustomText>
              - Third-Party Service Providers: For GPS, routing, and payment
              processing.
            </CustomText>
            <CustomText>
              - Legal Obligations: If required by law or to protect user safety.
            </CustomText>
            <CustomText>
              - Business Transactions: In cases of merger, acquisition, or asset
              sale.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              5. Data Storage and Security
            </CustomText>
            <CustomText>
              While we strive to protect your data, no method of transmission
              over the Internet or mobile networks is 100% secure. We are
              committed to promptly addressing any breaches in data security.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              6. Data Retention
            </CustomText>
            <CustomText>
              We retain your data as necessary to provide our services and meet
              legal requirements. Ride and payment information is kept for legal
              and business purposes.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              7. Your Rights
            </CustomText>
            <CustomText>
              Under the Data Privacy Act of 2012, you have rights concerning
              your personal data:
            </CustomText>
            <CustomText>- Access: Request access to your data.</CustomText>
            <CustomText>
              - Rectification: Correct inaccurate data.
            </CustomText>
            <CustomText>- Erasure: Request deletion of data under certain conditions.</CustomText>
            <CustomText>- Objection: Object to data processing not related to services.</CustomText>
            <CustomText>- Portability: Request a copy of your data.</CustomText>
            <CustomText style={styles.modalSectionTitle}>
              8. Third-Party Links
            </CustomText>
            <CustomText>
              Our App may contain links to third-party websites or services. We
              are not responsible for the privacy practices or content of
              third-party services.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              9. Updates to this Privacy Policy
            </CustomText>
            <CustomText>
              We may update this Privacy Policy from time to time. Changes will
              be posted in the app, and your continued use of the app after such
              changes will constitute acknowledgment of the updated policy.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              10. Contact Information
            </CustomText>
            <CustomText>
              For questions, please contact us at keero.dev@gmail.com or at (+63)
              9565109939.
            </CustomText>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    marginBottom: 3,
  },
  closeButton: {
    marginTop: 10,
    padding: 13,
    backgroundColor: '#176B87',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textColor: {
    color: 'black',
    marginBottom: 5,
  },
});

export default PrivacyModal;
