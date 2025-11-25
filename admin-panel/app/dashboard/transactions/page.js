'use client';

import { useEffect, useState } from 'react';
import { getAllOrders } from '@/lib/adminHelper';
import { Search, DollarSign, TrendingUp, TrendingDown, Calendar, Banknote, Package } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, full, installment

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate revenue and statistics from orders
  const calculateRevenue = () => {
    let totalRevenue = 0;
    let fullPaymentRevenue = 0;
    let installmentRevenue = 0;
    let paidInstallmentRevenue = 0;
    let pendingInstallmentRevenue = 0;
    let totalOrders = orders.length;
    let fullPaymentOrders = 0;
    let installmentOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;

    orders.forEach(order => {
      const isInstallment = order.payment?.method === 'installment';
      const orderTotal = order.total || order.payment?.amount || order.payment?.totalAmount || 0;
      
      if (isInstallment) {
        installmentOrders++;
        installmentRevenue += orderTotal;
        // Calculate paid amount from installments
        const paidAmount = order.payment?.paidAmount || 0;
        paidInstallmentRevenue += paidAmount;
        pendingInstallmentRevenue += (orderTotal - paidAmount);
        totalRevenue += paidAmount; // Only count paid installments as revenue
      } else {
        fullPaymentOrders++;
        fullPaymentRevenue += orderTotal;
        totalRevenue += orderTotal;
      }

      if (order.status === 'delivered' || order.status === 'completed') {
        completedOrders++;
      } else if (order.status === 'pending') {
        pendingOrders++;
      }
    });

    return {
      totalRevenue,
      fullPaymentRevenue,
      installmentRevenue,
      paidInstallmentRevenue,
      pendingInstallmentRevenue,
      totalOrders,
      fullPaymentOrders,
      installmentOrders,
      completedOrders,
      pendingOrders
    };
  };

  const stats = calculateRevenue();

  // Create transaction-like records from orders
  const createTransactionRecords = () => {
    const records = [];

    orders.forEach(order => {
      const isInstallment = order.payment?.method === 'installment';
      const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim() || order.customerName || 'N/A';
      const customerEmail = order.email || order.customerEmail || 'N/A';

      if (isInstallment && order.installmentsSchedule) {
        // Create records for each paid installment
        order.installmentsSchedule.forEach((installment, index) => {
          if (installment.status === 'paid') {
            records.push({
              id: `${order.id}-inst-${installment.installmentNumber}`,
              orderId: order.id,
              orderNumber: order.orderId,
              customerName,
              customerEmail,
              amount: installment.amount || installment.paidAmount || 0,
              paymentMethod: 'Installment',
              installmentNumber: installment.installmentNumber,
              totalInstallments: order.installmentsSchedule.length,
              type: 'installment',
              status: 'completed',
              createdAt: installment.paidAt || installment.dueDate || order.createdAt,
              dueDate: installment.dueDate,
              paidDate: installment.paidAt,
              paymentScreenshot: installment.paymentScreenshot,
              bankDetails: order.bankDetails
            });
          } else if (installment.status === 'pending' && new Date(installment.dueDate) <= new Date()) {
            // Pending/overdue installments
            records.push({
              id: `${order.id}-inst-${installment.installmentNumber}`,
              orderId: order.id,
              orderNumber: order.orderId,
              customerName,
              customerEmail,
              amount: installment.amount || 0,
              paymentMethod: 'Installment',
              installmentNumber: installment.installmentNumber,
              totalInstallments: order.installmentsSchedule.length,
              type: 'installment',
              status: 'pending',
              createdAt: installment.dueDate || order.createdAt,
              dueDate: installment.dueDate,
              paidDate: null,
              paymentScreenshot: null,
              bankDetails: order.bankDetails
            });
          }
        });
      } else {
        // Full payment orders
        const orderTotal = order.total || order.payment?.amount || 0;
        records.push({
          id: order.id,
          orderId: order.id,
          orderNumber: order.orderId,
          customerName,
          customerEmail,
          amount: orderTotal,
          paymentMethod: order.paymentMethod || order.payment?.method || 'Cash on Delivery',
          type: 'full',
          status: order.status === 'delivered' || order.status === 'completed' ? 'completed' : order.status || 'pending',
          createdAt: order.createdAt,
          paymentScreenshot: order.paymentScreenshot
        });
      }
    });

    return records.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  };

  const transactionRecords = createTransactionRecords();

  const filteredTransactions = transactionRecords.filter(transaction => {
    const matchesSearch = 
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Revenue', 
            value: `PKR ${stats.totalRevenue.toLocaleString()}`, 
            color: 'bg-green-500',
            icon: DollarSign,
            description: 'Received payments'
          },
          { 
            label: 'Full Payment Revenue', 
            value: `PKR ${stats.fullPaymentRevenue.toLocaleString()}`, 
            color: 'bg-blue-500',
            icon: Package,
            description: `${stats.fullPaymentOrders} orders`
          },
          { 
            label: 'Installment Revenue', 
            value: `PKR ${stats.paidInstallmentRevenue.toLocaleString()}`, 
            color: 'bg-purple-500',
            icon: Calendar,
            description: `PKR ${stats.pendingInstallmentRevenue.toLocaleString()} pending`
          },
          { 
            label: 'Total Orders', 
            value: stats.totalOrders, 
            color: 'bg-yellow-500',
            icon: TrendingUp,
            description: `${stats.completedOrders} completed, ${stats.pendingOrders} pending`
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Payment Types</option>
            <option value="full">Full Payment</option>
            <option value="installment">Installment Payments</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => {
                const createdAt = transaction.createdAt?.toDate 
                  ? transaction.createdAt.toDate() 
                  : transaction.createdAt 
                    ? new Date(transaction.createdAt) 
                    : null;
                
                const dueDate = transaction.dueDate 
                  ? (typeof transaction.dueDate === 'string' ? new Date(transaction.dueDate) : transaction.dueDate.toDate?.() || new Date(transaction.dueDate))
                  : null;
                
                const paidDate = transaction.paidDate 
                  ? (typeof transaction.paidDate === 'string' ? new Date(transaction.paidDate) : transaction.paidDate.toDate?.() || new Date(transaction.paidDate))
                  : null;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <div>
                        <p className="font-mono text-sm font-semibold">{transaction.orderNumber || transaction.orderId?.slice(0, 8) || 'N/A'}</p>
                        {transaction.installmentNumber && (
                          <p className="text-xs text-gray-500">
                            Installment #{transaction.installmentNumber}/{transaction.totalInstallments}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{transaction.customerName || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{transaction.customerEmail || 'N/A'}</p>
                      </div>
                    </td>
                    <td>
                      {transaction.type === 'installment' ? (
                        <span className="badge badge-info flex items-center gap-1 w-fit">
                          <Calendar className="w-3 h-3" />
                          Installment
                        </span>
                      ) : (
                        <span className="badge badge-success flex items-center gap-1 w-fit">
                          <Package className="w-3 h-3" />
                          Full Payment
                        </span>
                      )}
                    </td>
                    <td className="font-semibold text-green-600">
                      PKR {(transaction.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <div>
                        <span className={`badge ${
                          transaction.type === 'installment' ? 'badge-info' : 'badge-success'
                        }`}>
                          {transaction.paymentMethod || 'N/A'}
                        </span>
                        {transaction.type === 'installment' && transaction.bankDetails && (
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.bankDetails.bankName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {paidDate ? (
                          <>
                            <p className="font-semibold text-green-600">
                              Paid: {format(paidDate, 'MMM dd, yyyy')}
                            </p>
                            {dueDate && (
                              <p className="text-xs text-gray-500">
                                Due: {format(dueDate, 'MMM dd, yyyy')}
                              </p>
                            )}
                          </>
                        ) : dueDate ? (
                          <p className={transaction.status === 'pending' && new Date(dueDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
                            Due: {format(dueDate, 'MMM dd, yyyy')}
                          </p>
                        ) : createdAt ? (
                          <p>{format(createdAt, 'MMM dd, yyyy HH:mm')}</p>
                        ) : (
                          'N/A'
                        )}
                      </div>
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
                    <td>
                      {transaction.paymentScreenshot && (
                        <a
                          href={transaction.paymentScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1"
                        >
                          <Banknote className="w-4 h-4" />
                          View Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
