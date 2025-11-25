'use client';

import { useEffect, useState } from 'react';
import { getAllTransactions } from '@/lib/adminHelper';
import { Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const successfulTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  const filteredTransactions = transactions.filter(transaction =>
    transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Transaction Management</h1>
        <p className="text-gray-600 mt-1">Track all financial transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: 'Total Revenue', 
            value: `PKR ${totalRevenue.toLocaleString()}`, 
            color: 'bg-green-500',
            icon: DollarSign,
            trend: '+15%'
          },
          { 
            label: 'Successful', 
            value: successfulTransactions, 
            color: 'bg-blue-500',
            icon: TrendingUp,
            trend: '+8%'
          },
          { 
            label: 'Pending', 
            value: pendingTransactions, 
            color: 'bg-yellow-500',
            icon: TrendingDown,
            trend: '-3%'
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="font-mono text-sm">{transaction.id.slice(0, 8)}</td>
                <td className="font-mono text-sm">{transaction.orderId?.slice(0, 8) || 'N/A'}</td>
                <td>
                  <div>
                    <p className="font-medium">{transaction.customerName || 'N/A'}</p>
                    <p className="text-xs text-gray-600">{transaction.customerEmail || 'N/A'}</p>
                  </div>
                </td>
                <td className="font-semibold text-green-600">
                  PKR {(transaction.amount || 0).toLocaleString()}
                </td>
                <td>
                  <span className="badge badge-info">
                    {transaction.paymentMethod || 'Cash'}
                  </span>
                </td>
                <td className="text-sm">
                  {transaction.createdAt 
                    ? format(transaction.createdAt.toDate(), 'MMM dd, yyyy HH:mm')
                    : 'N/A'}
                </td>
                <td>
                  <span className={`badge ${
                    transaction.status === 'completed' ? 'badge-success' :
                    transaction.status === 'pending' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {transaction.status || 'pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
