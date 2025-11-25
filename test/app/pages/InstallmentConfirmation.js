import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../Helper/firebaseHelper';

export default function InstallmentConfirmation() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  
  const { orderData, installmentPlan, product } = route.params || {};

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const banksRef = collection(db, 'banks');
      const q = query(banksRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      const banksData = [];
      
      querySnapshot.forEach((doc) => {
        banksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setBanks(banksData);
      // Select first bank by default
      if (banksData.length > 0) {
        setSelectedBank(banksData[0]);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photos to upload payment screenshot.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentScreenshot(result.assets[0].uri);
        // Upload to Cloudinary
        await uploadScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your camera to take payment screenshot.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPaymentScreenshot(result.assets[0].uri);
        // Upload to Cloudinary
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

  if (!installmentPlan || !orderData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Installment Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No installment plan data found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { months, monthlyAmount, totalAmount, interest, total, formatted, totalFormatted, interestFormatted } = installmentPlan;

  // Save order to Firestore
  const handleSaveOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      navigation.navigate("Login");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Bank Required", "Please select a bank for payment.");
      return;
    }

    setLoading(true);
    try {
      // Generate installment schedule with dates
      const startDate = new Date();
      const installmentsSchedule = [];
      
      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installmentsSchedule.push({
          installmentNumber: i,
          dueDate: dueDate.toISOString(),
          amount: monthlyAmount,
          status: i === 1 ? 'pending' : 'upcoming', // First payment is pending, others are upcoming
          paidAmount: 0,
          paymentScreenshot: null,
          paidAt: null
        });
      }

      // Add order to Firestore orders collection with bank and payment info
      const orderToSave = {
        ...orderData,
        userId: user.uid,
        bankDetails: {
          bankId: selectedBank.id,
          bankName: selectedBank.name,
          accountNumber: selectedBank.accountNumber,
          accountName: selectedBank.accountName,
          iban: selectedBank.iban,
          branch: selectedBank.branch,
          swiftCode: selectedBank.swiftCode,
          phone: selectedBank.phone,
          email: selectedBank.email
        },
        paymentScreenshot: screenshotUrl || null,
        installmentsSchedule: installmentsSchedule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderToSave);
      
      Alert.alert(
        "Order Confirmed!",
        `Your installment plan has been saved successfully!\nOrder ID: ${docRef.id}\n\nPlease make your first payment to the selected bank account.`,
        [
          {
            text: "View Orders",
            onPress: () => navigation.navigate("MyOrders")
          },
          {
            text: "OK",
            onPress: () => navigation.navigate("Home")
          }
        ]
      );
    } catch (error) {
      console.error("Error saving order:", error);
      Alert.alert("Error", "Failed to save order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Installment Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Product Info */}
        {product && (
          <View style={styles.productCard}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.productRow}>
              {product.image && (
                <Image 
                  source={product.image} 
                  style={styles.productImage}
                  resizeMode="contain"
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
                <Text style={styles.productDetails}>
                  Color: {product.color} • Qty: {product.quantity}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Installment Plan Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Installment Plan Summary</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Original Price:</Text>
            <Text style={styles.detailValue}>PKR {total.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Monthly Installment:</Text>
            <Text style={[styles.detailValue, { color: '#8e44ad', fontWeight: 'bold' }]}>
              {formatted}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{months} months</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Amount:</Text>
            <Text style={styles.detailValue}>{interestFormatted}</Text>
          </View>
          
          <View style={[styles.detailRow, { marginTop: 15, paddingTop: 15, borderTopWidth: 2, borderTopColor: '#8e44ad' }]}>
            <Text style={[styles.detailLabel, { fontWeight: 'bold', fontSize: 18 }]}>Total Amount:</Text>
            <Text style={[styles.detailValue, { fontWeight: 'bold', fontSize: 18, color: '#8e44ad' }]}>
              {totalFormatted}
            </Text>
          </View>
        </View>
        
        {/* Bank Details */}
        {banks.length > 0 && (
          <View style={styles.bankCard}>
            <Text style={styles.sectionTitle}>Payment Bank Details</Text>
            <Text style={styles.bankSubtitle}>Select a bank to make your installment payments</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankScroll}>
              {banks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankOption,
                    selectedBank?.id === bank.id && styles.selectedBankOption
                  ]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <Text style={[
                    styles.bankName,
                    selectedBank?.id === bank.id && styles.selectedBankName
                  ]}>
                    {bank.name}
                  </Text>
                  {selectedBank?.id === bank.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#8e44ad" style={{ marginTop: 5 }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedBank && (
              <View style={styles.bankDetails}>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Account Name:</Text>
                  <Text style={styles.bankDetailValue}>{selectedBank.accountName}</Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Account Number:</Text>
                  <Text style={styles.bankDetailValue}>{selectedBank.accountNumber}</Text>
                </View>
                {selectedBank.iban && selectedBank.iban !== 'N/A' && (
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>IBAN:</Text>
                    <Text style={styles.bankDetailValue}>{selectedBank.iban}</Text>
                  </View>
                )}
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Branch:</Text>
                  <Text style={styles.bankDetailValue}>{selectedBank.branch}</Text>
                </View>
                {selectedBank.swiftCode && selectedBank.swiftCode !== 'N/A' && (
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>SWIFT Code:</Text>
                    <Text style={styles.bankDetailValue}>{selectedBank.swiftCode}</Text>
                  </View>
                )}
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Contact:</Text>
                  <Text style={styles.bankDetailValue}>{selectedBank.phone}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Payment Screenshot Upload */}
        <View style={styles.screenshotCard}>
          <Text style={styles.sectionTitle}>Payment Screenshot (Optional)</Text>
          <Text style={styles.screenshotSubtitle}>
            Upload a screenshot of your payment transaction receipt
          </Text>
          
          {paymentScreenshot ? (
            <View style={styles.screenshotPreview}>
              <Image source={{ uri: paymentScreenshot }} style={styles.screenshotImage} />
              <View style={styles.screenshotActions}>
                <TouchableOpacity
                  style={styles.screenshotButton}
                  onPress={showImageOptions}
                  disabled={uploadingImage}
                >
                  <Ionicons name="refresh" size={20} color="#8e44ad" />
                  <Text style={styles.screenshotButtonText}>Change</Text>
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
              <Ionicons name="camera-outline" size={30} color="#8e44ad" />
              <Text style={styles.uploadButtonText}>
                {uploadingImage ? 'Uploading...' : 'Upload Payment Screenshot'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.noteBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#f39c12" />
          <Text style={styles.noteText}>
            Your first installment will be due on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
            Please make your payment to the selected bank account and upload the payment screenshot.
            You'll receive payment reminders via email.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSaveOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Confirm & Save Order</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  content: {
    flex: 1,
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  orderNumber: {
    color: '#7f8c8d',
    marginBottom: 30,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  detailValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#fef9e7',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  noteText: {
    color: '#9c7c0c',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#8e44ad',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#8e44ad',
    fontSize: 16,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginBottom: 5,
  },
  productDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#8e44ad',
    fontSize: 16,
    fontWeight: '600',
  },
  bankCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bankSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  bankScroll: {
    marginBottom: 15,
  },
  bankOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  selectedBankOption: {
    borderColor: '#8e44ad',
    backgroundColor: '#f8f0fc',
  },
  bankName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  selectedBankName: {
    color: '#8e44ad',
    fontWeight: '600',
  },
  bankDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
  },
  bankDetailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  bankDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  screenshotCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    padding: 20,
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
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  screenshotActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenshotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8e44ad',
  },
  screenshotButtonText: {
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
});
