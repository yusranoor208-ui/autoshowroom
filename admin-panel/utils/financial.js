// Calculate monthly installment amount
// price: total price of the item
// months: number of months for installment
// interestRate: annual interest rate (e.g., 0.1 for 10%)
export const calculateInstallment = (price, months, interestRate = 0.1) => {
  if (months <= 0) return { monthly: 0, total: 0, interest: 0 };
  
  const monthlyRate = interestRate / 12; // Monthly interest rate
  const total = price * Math.pow(1 + monthlyRate, months);
  const monthlyPayment = total / months;
  
  return {
    monthly: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places
    total: Math.round(total * 100) / 100,
    interest: Math.round((total - price) * 100) / 100
  };
};

// Common installment options
export const INSTALLMENT_OPTIONS = [3, 6, 12, 18, 24]; // Common installment periods in months
