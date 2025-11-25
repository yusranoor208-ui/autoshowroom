'use client';

import { useState } from 'react';
import { calculateInstallment, INSTALLMENT_OPTIONS } from '@/utils/financial';

export default function InstallmentOptions({ price, onSelectInstallment, selectedMonths }) {
  const [selectedOption, setSelectedOption] = useState(selectedMonths || null);

  const handleSelect = (months) => {
    setSelectedOption(months);
    const installment = calculateInstallment(price, months);
    onSelectInstallment({
      months,
      monthlyPayment: installment.monthly,
      totalAmount: installment.total,
      interest: installment.interest
    });
  };

  if (!price) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Installment Options</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {INSTALLMENT_OPTIONS.map((months) => {
          const installment = calculateInstallment(price, months);
          const isSelected = selectedOption === months;
          
          return (
            <button
              key={months}
              onClick={() => handleSelect(months)}
              className={`p-4 border rounded-lg text-center transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{months} Months</div>
              <div className="text-sm text-gray-600">
                ${installment.monthly.toFixed(2)}/mo
              </div>
              {installment.interest > 0 && (
                <div className="text-xs text-gray-500">
                  ${installment.total.toFixed(2)} total
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedOption && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800">Selected Plan</h4>
          <p className="text-sm text-green-700">
            {selectedOption} monthly payments of ${calculateInstallment(price, selectedOption).monthly.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
