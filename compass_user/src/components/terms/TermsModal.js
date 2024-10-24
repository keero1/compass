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
              1.1 "User" refers to any individual or entity that accesses or
              uses the App.
            </CustomText>
            <CustomText>
              1.2 "Service" refers to the bus tracking, payment, and other
              related services provided through the App.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              2. Eligibility
            </CustomText>
            <CustomText>
              2.1 Users must be at least 18 years old to use the App, you
              representand warrant that you are atleast 18 years old and have
              the legal capacity to enter into these Terms.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              3. User Accounts
            </CustomText>
            <CustomText>
              3.1 To use the App, you must register and create an account. You
              are responsible for maintaining the confidentiality of your
              account information, including your email and password.
            </CustomText>
            <CustomText>
              3.2 You agree to provide accurate, current, and complete
              information during the registration process and to update such
              information to keep it accurate, current, and complete.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              4. Use of the App
            </CustomText>
            <CustomText>
              4.1 To use the App, You agree to use the Service for lawful
              purposes only. The application is designed for real-time bus
              tracking and cashless payment.
            </CustomText>
            <CustomText>
              4.2 You agree to use the App only for lawful purposes and in
              accordance with these Terms.
            </CustomText>
            <CustomText>4.3 You agree not to:</CustomText>
            <CustomText>
              4.3.1 Violate any applicable laws or regulations.
            </CustomText>
            <CustomText>
              4.3.2 Use the Service for any fraudulent or unlawful purposes,
              including impersonating any person or entity.
            </CustomText>
            <CustomText>
              4.3.3 Interfere with or distrupt the operation of the App.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>5. Payment</CustomText>
            <CustomText>
              5.1 By using the Service, you agree to pay all applicable fees and
              charges. All payments are processed within the app, ensuring a
              seamless user experience. However, top-ups are processed by a
              third-party payment processor.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              6. Top-up and Refund Policy
            </CustomText>
            <CustomText>
              6.1 All funds added to your account through in-app top-ups are
              non-refundable and cannot be withdrawn. Once funds are added to
              your account, they may only be used to purchase services or
              products within the app.
            </CustomText>
            <CustomText>
              6.2 If you encounter a system error during the payment process
              that affects your ability to complete a transaction, please report
              the issue immediately.
            </CustomText>
            <CustomText>
              6.3 To report a payment error, contact our support team at
              support@compass.com with details of the transaction, including the
              date, amount, reference number and any error messages received.
              Our support team will investigate the issue, and if confirmed,
              will reverse the transaction and restore any affected funds to
              your account.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              7. User Conduct
            </CustomText>
            <CustomText>
              7.1 Users are expected to behave respectfully and responsibly
              while using the Service. Any inappropriate, illegal or harmful
              behavior may result in the termination of your account.
            </CustomText>
            <CustomText>
              7.2 Santrans and their Buses have the right to refuse service if
              they feel threatened or unsane
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>8. Privacy</CustomText>
            <CustomText>
              8.1 Our Privacy Policy outlines how we collect, use, and protect
              your personal information. By using the App, you consent to our
              collection and use of your personal information as described in
              the Privacy Policy
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              9. Intellectual Property
            </CustomText>
            <CustomText>
              9.1 All content and features of the Service of the app including
              but not limited to text, graphics, logos, and software, are the
              exclusive property of ComPass and are protected by intellectual
              property laws.
            </CustomText>
            <CustomText>
              9.2 You are granted a limited, non-exclusive, non-transferable,
              and revocable license to use the App for personal, non-commercial
              use.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              10. Limitation of Liability
            </CustomText>
            <CustomText>
              10.1 ComPass is not liable for any indirect, incidental, or
              consequential damages resulting from the use of the Service.
            </CustomText>
            <CustomText>
              10.2 ComPass does not guarantee the accuracy, completeness, or
              reliability of any information provided through the App.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              11. Indemnification
            </CustomText>
            <CustomText>
              11.1 You agree to indemnify and hold harmless ComPass, its
              affiliates, officers, directors, employees, and agents from any
              claims, liabilities, damages, losses, and expenses arising out of
              or related to your use of the App or the Service.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              12. Modification of Terms
            </CustomText>
            <CustomText>
              12.1 ComPass reserves the right to modify these Terms at any time.
              We will notify you of any changes by posting the revised Terms on
              the App. Your continued use of the App after the posting of the
              revised Terms constitutes your acceptance of the changes
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              13. Termination
            </CustomText>
            <CustomText>
              13.1 ComPass may terminate or suspend your account and access to
              the App at any time, with or without cause or notice.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              14. Governing Law
            </CustomText>
            <CustomText>
              14.1 These Terms are governed by the laws of the jurisdiction in
              which ComPass operates.
            </CustomText>
            <CustomText style={styles.modalSectionTitle}>
              15. Contact Us
            </CustomText>
            <CustomText>
              15.1 For any questions about these Terms, please contact us at
              support@compass.com.
            </CustomText>
            {/* Acknowledgment Text */}
            <CustomText style={styles.acknowledgmentText}>
              By using ComPass, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
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
    padding: 13,
    backgroundColor: '#176B87',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textColor: {
    color: 'black', // Set the desired text color
    marginBottom: 5,
  },
});

export default TermsModal;
