import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Creates a new installment plan in Firestore
 * @param {Object} installmentData - The installment data to save
 * @param {string} installmentData.orderId - The associated order ID
 * @param {string} installmentData.customerId - The customer's ID
 * @param {string} installmentData.customerName - The customer's name
 * @param {string} installmentData.customerEmail - The customer's email
 * @param {number} installmentData.totalAmount - The total amount to be paid
 * @param {number} installmentData.monthlyAmount - The monthly installment amount
 * @param {number} installmentData.months - Number of months for installment
 * @param {number} installmentData.interest - Total interest amount
 * @param {Date} installmentData.startDate - Start date of installment
 * @param {string} installmentData.productId - ID of the product
 * @param {string} installmentData.productName - Name of the product
 * @returns {Promise<string>} The ID of the created installment document
 */
export const createInstallmentPlan = async (installmentData) => {
  try {
    const now = serverTimestamp();
    const dueDate = new Date(installmentData.startDate);
    dueDate.setMonth(dueDate.getMonth() + 1); // First payment due in 1 month

    const installmentPlan = {
      orderId: installmentData.orderId,
      customerId: installmentData.customerId,
      customerName: installmentData.customerName,
      customerEmail: installmentData.customerEmail,
      productId: installmentData.productId,
      productName: installmentData.productName,
      totalAmount: installmentData.totalAmount,
      monthlyAmount: installmentData.monthlyAmount,
      remainingAmount: installmentData.totalAmount,
      months: installmentData.months,
      interest: installmentData.interest,
      status: 'pending',
      startDate: installmentData.startDate,
      dueDate: dueDate,
      paymentHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'installments'), installmentPlan);
    return docRef.id;
  } catch (error) {
    console.error('Error creating installment plan:', error);
    throw new Error('Failed to create installment plan');
  }
};

/**
 * Creates multiple installments for a payment plan
 * @param {string} planId - The ID of the installment plan
 * @param {Object} installmentData - The installment data
 * @param {number} installmentData.months - Number of installments
 * @param {number} installmentData.monthlyAmount - Monthly amount
 * @param {Date} startDate - Start date of the installments
 */
export const createInstallments = async (planId, installmentData, startDate) => {
  try {
    const batch = [];
    const dueDate = new Date(startDate);
    
    for (let i = 1; i <= installmentData.months; i++) {
      const installmentDueDate = new Date(dueDate);
      installmentDueDate.setMonth(installmentDueDate.getMonth() + i);
      
      const installment = {
        planId,
        orderId: installmentData.orderId,
        customerId: installmentData.customerId,
        customerName: installmentData.customerName,
        customerEmail: installmentData.customerEmail,
        amount: installmentData.monthlyAmount,
        dueDate: installmentDueDate,
        status: i === 1 ? 'pending' : 'upcoming',
        installmentNumber: i,
        totalInstallments: installmentData.months,
        createdAt: serverTimestamp(),
      };
      
      batch.push(installment);
    }
    
    // Add all installments to Firestore
    const installmentsRef = collection(db, 'installments');
    const batchWrites = batch.map(installment => addDoc(installmentsRef, installment));
    
    await Promise.all(batchWrites);
    return true;
  } catch (error) {
    console.error('Error creating installments:', error);
    throw new Error('Failed to create installments');
  }
};
