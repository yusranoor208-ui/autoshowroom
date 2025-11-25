import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../Helper/firebaseHelper';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

export default function InstallmentPayment() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const { orderId, installment, bankDetails } = route.params || {};

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to upload payment screenshot.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentScreenshot(result.assets[0].uri);
        await uploadScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your camera to take payment screenshot.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentScreenshot(result.assets[0].uri);
        await uploadScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadScreenshot = async (imageUri) => {
    setUploadingImage(true);
    try {
      const url = await uploadImageToCloudinary(imageUri);
      setScreenshotUrl(url);
      Alert.alert('Success', 'Payment screenshot uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Upload Payment Screenshot',
      'Choose an option to upload your payment screenshot',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSubmitPayment = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    if (!screenshotUrl) {
      Alert.alert('Screenshot Required', 'Please upload a payment screenshot before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Get current order
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        Alert.alert('Error', 'Order not found.');
        return;
      }

      const orderData = orderSnap.data();
      const installmentsSchedule = orderData.installmentsSchedule || [];
      
      // Update the specific installment
      const updatedInstallments = installmentsSchedule.map((inst) => {
        if (inst.installmentNumber === installment.installmentNumber) {
          return {
            ...inst,
            status: 'paid',
            paidAmount: inst.amount,
            paymentScreenshot: screenshotUrl,
            paidAt: new Date().toISOString()
          };
        }
        return inst;
      });

      // Calculate new paid amount and remaining amount
      const totalPaid = updatedInstallments
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.paidAmount || 0), 0);
      
      const remainingAmount = (orderData.payment?.totalAmount || 0) - totalPaid;

      // Update next pending installment to 'pending' status
      const nextPendingIndex = updatedInstallments.findIndex(
        i => i.status !== 'paid' && new Date(i.dueDate) <= new Date()
      );
      if (nextPendingIndex !== -1) {
        updatedInstallments[nextPendingIndex].status = 'pending';
      }

      // Update order document
      await updateDoc(orderRef, {
        'installmentsSchedule': updatedInstallments,
        'payment.paidAmount': totalPaid,
        'payment.remainingAmount': remainingAmount,
        'payment.nextPaymentDate': updatedInstallments.find(i => i.status === 'pending')?.dueDate || null,
        updatedAt: serverTimestamp()
      });

      Alert.alert(
        'Payment Submitted!',
        `Your payment for installment #${installment.installmentNumber} has been submitted successfully. It will be verified by our team.`,
        [
          {
            text: 'View Installments',
            onPress: () => {
              navigation.navigate('InstallmentsList', { orderId });
            }
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting payment:', error);
      Alert.alert('Error', 'Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!installment || !bankDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Payment information not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Installment Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Installment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Installment #:</Text>
            <Text style={styles.infoValue}>#{installment.installmentNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={styles.infoValue}>{formatDate(installment.dueDate)}</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }]}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={[styles.infoValue, { fontSize: 20, fontWeight: 'bold', color: '#8e44ad' }]}>
              PKR {installment.amount?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <MaterialCommunityIcons name="bank" size={24} color="#8e44ad" />
            <Text style={styles.cardTitle}>Bank Account Details</Text>
          </View>
          
          <View style={styles.bankDetails}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>{bankDetails.bankName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Name:</Text>
              <Text style={styles.bankValue}>{bankDetails.accountName}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Number:</Text>
              <Text style={[styles.bankValue, { fontFamily: 'monospace', fontWeight: 'bold' }]}>
                {bankDetails.accountNumber}
              </Text>
            </View>
            {bankDetails.iban && bankDetails.iban !== 'N/A' && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>IBAN:</Text>
                <Text style={[styles.bankValue, { fontFamily: 'monospace' }]}>
                  {bankDetails.iban}
                </Text>
              </View>
            )}
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>{bankDetails.branch}</Text>
            </View>
            {bankDetails.swiftCode && bankDetails.swiftCode !== 'N/A' && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>SWIFT Code:</Text>
                <Text style={styles.bankValue}>{bankDetails.swiftCode}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Screenshot */}
        <View style={styles.screenshotCard}>
          <Text style={styles.cardTitle}>Payment Screenshot</Text>
          <Text style={styles.screenshotSubtitle}>
            Please upload a screenshot of your payment transaction receipt
          </Text>

          {paymentScreenshot ? (
            <View style={styles.screenshotPreview}>
              <Image source={{ uri: paymentScreenshot }} style={styles.screenshotImage} />
              <View style={styles.screenshotActions}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={showImageOptions}
                  disabled={uploadingImage}
                >
                  <Ionicons name="refresh" size={20} color="#8e44ad" />
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
                {uploadingImage && (
                  <ActivityIndicator size="small" color="#8e44ad" style={{ marginLeft: 10 }} />
                )}
                {screenshotUrl && (
                  <View style={styles.uploadSuccess}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.uploadSuccessText}>Uploaded</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={showImageOptions}
              disabled={uploadingImage}
            >
              <Ionicons name="camera-outline" size={40} color="#8e44ad" />
              <Text style={styles.uploadButtonText}>
                {uploadingImage ? 'Uploading...' : 'Upload Payment Screenshot'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#f39c12" />
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>Payment Instructions</Text>
            <Text style={styles.instructionsText}>
              1. Transfer the payment amount to the bank account shown above{'\n'}
              2. Take a screenshot of the payment confirmation/receipt{'\n'}
              3. Upload the screenshot using the button above{'\n'}
              4. Click "Submit Payment" to complete{'\n'}
              5. Your payment will be verified by our team
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!screenshotUrl || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitPayment}
          disabled={!screenshotUrl || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Submit Payment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#8e44ad',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bankCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  bankDetails: {
    marginTop: 10,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 5,
  },
  bankLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  screenshotCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  screenshotSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#8e44ad',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#8e44ad',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  screenshotPreview: {
    marginTop: 10,
  },
  screenshotImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  screenshotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8e44ad',
  },
  changeButtonText: {
    color: '#8e44ad',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  uploadSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  uploadSuccessText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#fef9e7',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  instructionsContent: {
    flex: 1,
    marginLeft: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9c7c0c',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#9c7c0c',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#8e44ad',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

