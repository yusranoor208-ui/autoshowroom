'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/adminHelper';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, X, Calendar, Banknote, Image as ImageIcon, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedInstallmentOrder, setSelectedInstallmentOrder] = useState(null);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Package,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim() || order.customerName;
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
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
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage customer orders</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, color: 'bg-blue-500' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-500' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-500' },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <Package className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim() || order.customerName || 'N/A';
              const customerEmail = order.email || order.customerEmail || 'N/A';
              const itemsCount = order.items?.length || 1;
              const totalAmount = order.total || order.amount || 'N/A';
              const paymentMethod = order.paymentMethod || 'N/A';
              
              return (
                <tr key={order.id}>
                  <td className="font-mono text-sm">{order.id.slice(0, 8)}</td>
                  <td>
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-xs text-gray-600">{customerEmail}</p>
                      <p className="text-xs text-gray-500">{order.phone || ''}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      {order.items ? (
                        <>
                          <p className="font-medium">{itemsCount} item(s)</p>
                          <p className="text-xs text-gray-600">
                            {order.items[0]?.name}
                            {itemsCount > 1 && ` +${itemsCount - 1} more`}
                          </p>
                        </>
                      ) : (
                        <p>{order.productName || order.product || 'N/A'}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold">PKR {typeof totalAmount === 'number' ? totalAmount.toLocaleString() : totalAmount}</p>
                      {(order.items?.some(item => item.isInstallment) || order.payment?.method === 'installment') && (
                        <span className="text-xs badge badge-info mt-1">Installment Plan</span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">
                    <div>
                      <span>{paymentMethod}</span>
                      {(order.items?.some(item => item.isInstallment) || order.payment?.method === 'installment') && order.payment?.paidAmount > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Paid: PKR {order.payment?.paidAmount?.toLocaleString() || '0'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">
                    {order.createdAt ? (
                      typeof order.createdAt.toDate === 'function' 
                        ? format(order.createdAt.toDate(), 'MMM dd, yyyy')
                        : new Date(order.createdAt).toLocaleDateString()
                    ) : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(order.status)}
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {(order.items?.some(item => item.isInstallment) || order.payment?.method === 'installment') && (
                        <button
                          onClick={() => {
                            setSelectedInstallmentOrder(order);
                            setShowInstallmentModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="View Installments"
                        >
                          <Calendar className="w-5 h-5" />
                        </button>
                      )}
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {selectedOrder.createdAt ? (
                      typeof selectedOrder.createdAt.toDate === 'function' 
                        ? format(selectedOrder.createdAt.toDate(), 'MMM dd, yyyy HH:mm')
                        : new Date(selectedOrder.createdAt).toLocaleString()
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{`${selectedOrder.firstName || ''} ${selectedOrder.lastName || ''}`.trim() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedOrder.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedOrder.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold">{selectedOrder.townCity || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{selectedOrder.streetAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">Type: {item.type}</p>
                          {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.isInstallment && (
                            <div className="mt-2">
                              <span className="badge badge-info text-xs">Installment Plan</span>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.months} months × PKR {item.monthlyAmount?.toLocaleString()}/month
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{item.price}</p>
                          <p className="text-sm text-gray-600">× {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold">{selectedOrder.product || selectedOrder.productName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Amount: {selectedOrder.amount || selectedOrder.price || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-bold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">PKR {selectedOrder.subtotal?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">PKR {selectedOrder.deliveryFee?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">PKR {selectedOrder.total?.toLocaleString() || selectedOrder.amount || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Installment Payment Info */}
              {selectedOrder.payment?.method === 'installment' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Installment Payment Details
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Amount</p>
                        <p className="font-semibold text-lg">PKR {selectedOrder.payment?.monthlyAmount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{selectedOrder.payment?.months || 0} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold">PKR {selectedOrder.payment?.totalAmount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest</p>
                        <p className="font-semibold">PKR {selectedOrder.payment?.interest?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Paid Amount</p>
                        <p className="font-semibold text-green-600">PKR {selectedOrder.payment?.paidAmount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="font-semibold text-red-600">PKR {selectedOrder.payment?.remainingAmount?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                    {selectedOrder.payment?.nextPaymentDate && (
                      <div className="pt-3 border-t border-blue-200">
                        <p className="text-sm text-gray-600">Next Payment Due</p>
                        <p className="font-semibold">
                          {typeof selectedOrder.payment.nextPaymentDate === 'string' 
                            ? format(new Date(selectedOrder.payment.nextPaymentDate), 'MMM dd, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {selectedOrder.bankDetails && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Bank Account Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <p className="font-semibold">{selectedOrder.bankDetails.bankName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Name</p>
                        <p className="font-semibold">{selectedOrder.bankDetails.accountName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-mono font-semibold">{selectedOrder.bankDetails.accountNumber || 'N/A'}</p>
                      </div>
                      {selectedOrder.bankDetails.iban && selectedOrder.bankDetails.iban !== 'N/A' && (
                        <div>
                          <p className="text-sm text-gray-600">IBAN</p>
                          <p className="font-mono font-semibold">{selectedOrder.bankDetails.iban}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Branch</p>
                        <p className="font-semibold">{selectedOrder.bankDetails.branch || 'N/A'}</p>
                      </div>
                      {selectedOrder.bankDetails.swiftCode && selectedOrder.bankDetails.swiftCode !== 'N/A' && (
                        <div>
                          <p className="text-sm text-gray-600">SWIFT Code</p>
                          <p className="font-semibold">{selectedOrder.bankDetails.swiftCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Installment Schedule */}
              {selectedOrder.installmentsSchedule && selectedOrder.installmentsSchedule.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Installment Schedule
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.installmentsSchedule.map((installment, index) => {
                      const dueDate = typeof installment.dueDate === 'string' 
                        ? new Date(installment.dueDate)
                        : installment.dueDate?.toDate ? installment.dueDate.toDate() : null;
                      
                      const paidDate = typeof installment.paidAt === 'string'
                        ? new Date(installment.paidAt)
                        : installment.paidAt?.toDate ? installment.paidAt.toDate() : null;

                      const isDue = dueDate && dueDate <= new Date();
                      const isOverdue = installment.status === 'pending' && isDue;
                      const isPaid = installment.status === 'paid';

                      const getStatusBadge = () => {
                        if (isPaid) return 'badge-success';
                        if (isOverdue) return 'badge-danger';
                        if (installment.status === 'pending') return 'badge-warning';
                        return 'badge-info';
                      };

                      const getStatusText = () => {
                        if (isPaid) return 'Paid';
                        if (isOverdue) return 'Overdue';
                        if (installment.status === 'pending') return 'Due';
                        return 'Upcoming';
                      };

                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            isPaid ? 'bg-green-50 border-green-500' :
                            isOverdue ? 'bg-red-50 border-red-500' :
                            installment.status === 'pending' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-white px-3 py-1 rounded-full">
                                <span className="font-bold text-gray-800">#{installment.installmentNumber}</span>
                              </div>
                              <span className={`badge ${getStatusBadge()}`}>
                                {getStatusText()}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">PKR {installment.amount?.toLocaleString() || '0'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Due Date</p>
                              <p className="font-semibold">
                                {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'N/A'}
                              </p>
                            </div>
                            {isPaid && paidDate && (
                              <div>
                                <p className="text-gray-600">Paid Date</p>
                                <p className="font-semibold text-green-600">
                                  {format(paidDate, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Payment Screenshot */}
                          {installment.paymentScreenshot && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-600">Payment Screenshot</span>
                                </div>
                                <a
                                  href={installment.paymentScreenshot}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                >
                                  <Download className="w-4 h-4" />
                                  View Image
                                </a>
                              </div>
                              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={installment.paymentScreenshot}
                                  alt={`Payment screenshot for installment #${installment.installmentNumber}`}
                                  className="w-full h-48 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(installment.paymentScreenshot, '_blank')}
                                />
                              </div>
                            </div>
                          )}

                          {/* Initial Payment Screenshot (if exists on order level) */}
                          {index === 0 && selectedOrder.paymentScreenshot && !installment.paymentScreenshot && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-600">Initial Payment Screenshot</span>
                                </div>
                                <a
                                  href={selectedOrder.paymentScreenshot}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                >
                                  <Download className="w-4 h-4" />
                                  View Image
                                </a>
                              </div>
                              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={selectedOrder.paymentScreenshot}
                                  alt="Initial payment screenshot"
                                  className="w-full h-48 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedOrder.paymentScreenshot, '_blank')}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Progress */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedOrder.installmentsSchedule.filter(i => i.status === 'paid').length} / {selectedOrder.installmentsSchedule.length} paid
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${(selectedOrder.installmentsSchedule.filter(i => i.status === 'paid').length / selectedOrder.installmentsSchedule.length) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Installment View Modal */}
      {showInstallmentModal && selectedInstallmentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  Installment Schedule
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Order ID: <span className="font-mono">{selectedInstallmentOrder.id}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInstallmentModal(false);
                  setSelectedInstallmentOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Installment Payment Summary */}
              {selectedInstallmentOrder.payment?.method === 'installment' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-purple-600" />
                    Payment Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Amount</p>
                      <p className="font-bold text-lg">PKR {selectedInstallmentOrder.payment?.monthlyAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-bold text-lg">{selectedInstallmentOrder.payment?.months || 0} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg">PKR {selectedInstallmentOrder.payment?.totalAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Interest</p>
                      <p className="font-bold">PKR {selectedInstallmentOrder.payment?.interest?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="font-bold text-lg text-green-600">PKR {selectedInstallmentOrder.payment?.paidAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="font-bold text-lg text-red-600">PKR {selectedInstallmentOrder.payment?.remainingAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                  {selectedInstallmentOrder.payment?.nextPaymentDate && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-sm text-gray-600">Next Payment Due</p>
                      <p className="font-bold text-lg">
                        {typeof selectedInstallmentOrder.payment.nextPaymentDate === 'string' 
                          ? format(new Date(selectedInstallmentOrder.payment.nextPaymentDate), 'MMMM dd, yyyy')
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Details */}
              {selectedInstallmentOrder.bankDetails && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Bank Account Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-semibold">{selectedInstallmentOrder.bankDetails.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-semibold">{selectedInstallmentOrder.bankDetails.accountName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-mono font-semibold">{selectedInstallmentOrder.bankDetails.accountNumber || 'N/A'}</p>
                    </div>
                    {selectedInstallmentOrder.bankDetails.iban && selectedInstallmentOrder.bankDetails.iban !== 'N/A' && (
                      <div>
                        <p className="text-sm text-gray-600">IBAN</p>
                        <p className="font-mono font-semibold">{selectedInstallmentOrder.bankDetails.iban}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-semibold">{selectedInstallmentOrder.bankDetails.branch || 'N/A'}</p>
                    </div>
                    {selectedInstallmentOrder.bankDetails.swiftCode && selectedInstallmentOrder.bankDetails.swiftCode !== 'N/A' && (
                      <div>
                        <p className="text-sm text-gray-600">SWIFT Code</p>
                        <p className="font-semibold">{selectedInstallmentOrder.bankDetails.swiftCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Installment Schedule */}
              {selectedInstallmentOrder.installmentsSchedule && selectedInstallmentOrder.installmentsSchedule.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Installment Schedule
                  </h3>
                  <div className="space-y-4">
                    {selectedInstallmentOrder.installmentsSchedule.map((installment, index) => {
                      const dueDate = typeof installment.dueDate === 'string' 
                        ? new Date(installment.dueDate)
                        : installment.dueDate?.toDate ? installment.dueDate.toDate() : null;
                      
                      const paidDate = typeof installment.paidAt === 'string'
                        ? new Date(installment.paidAt)
                        : installment.paidAt?.toDate ? installment.paidAt.toDate() : null;

                      const isDue = dueDate && dueDate <= new Date();
                      const isOverdue = installment.status === 'pending' && isDue;
                      const isPaid = installment.status === 'paid';

                      const getStatusBadge = () => {
                        if (isPaid) return 'badge-success';
                        if (isOverdue) return 'badge-danger';
                        if (installment.status === 'pending') return 'badge-warning';
                        return 'badge-info';
                      };

                      const getStatusText = () => {
                        if (isPaid) return 'Paid';
                        if (isOverdue) return 'Overdue';
                        if (installment.status === 'pending') return 'Due';
                        return 'Upcoming';
                      };

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-lg border-l-4 shadow-sm ${
                            isPaid ? 'bg-green-50 border-green-500' :
                            isOverdue ? 'bg-red-50 border-red-500' :
                            installment.status === 'pending' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-white px-4 py-2 rounded-full shadow-sm">
                                <span className="font-bold text-gray-800 text-lg">#{installment.installmentNumber}</span>
                              </div>
                              <span className={`badge ${getStatusBadge()} text-sm px-3 py-1`}>
                                {getStatusText()}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xl">PKR {installment.amount?.toLocaleString() || '0'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Due Date</p>
                              <p className="font-semibold">
                                {dueDate ? format(dueDate, 'MMMM dd, yyyy') : 'N/A'}
                              </p>
                            </div>
                            {isPaid && paidDate && (
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Paid Date</p>
                                <p className="font-semibold text-green-600">
                                  {format(paidDate, 'MMMM dd, yyyy')}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Payment Screenshot */}
                          {installment.paymentScreenshot && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-700">Payment Screenshot</span>
                                </div>
                                <a
                                  href={installment.paymentScreenshot}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              </div>
                              <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                <img
                                  src={installment.paymentScreenshot}
                                  alt={`Payment screenshot for installment #${installment.installmentNumber}`}
                                  className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(installment.paymentScreenshot, '_blank')}
                                />
                              </div>
                            </div>
                          )}

                          {/* Initial Payment Screenshot (if exists on order level) */}
                          {index === 0 && selectedInstallmentOrder.paymentScreenshot && !installment.paymentScreenshot && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-700">Initial Payment Screenshot</span>
                                </div>
                                <a
                                  href={selectedInstallmentOrder.paymentScreenshot}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              </div>
                              <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                <img
                                  src={selectedInstallmentOrder.paymentScreenshot}
                                  alt="Initial payment screenshot"
                                  className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(selectedInstallmentOrder.paymentScreenshot, '_blank')}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Progress */}
                  <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-bold text-gray-700">Payment Progress</span>
                      <span className="text-base font-bold text-gray-700">
                        {selectedInstallmentOrder.installmentsSchedule.filter(i => i.status === 'paid').length} / {selectedInstallmentOrder.installmentsSchedule.length} installments paid
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${(selectedInstallmentOrder.installmentsSchedule.filter(i => i.status === 'paid').length / selectedInstallmentOrder.installmentsSchedule.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="mt-3 flex justify-between text-sm text-gray-600">
                      <span>PKR {selectedInstallmentOrder.payment?.paidAmount?.toLocaleString() || '0'} paid</span>
                      <span>PKR {selectedInstallmentOrder.payment?.remainingAmount?.toLocaleString() || '0'} remaining</span>
                    </div>
                  </div>
                </div>
              )}

              {(!selectedInstallmentOrder.installmentsSchedule || selectedInstallmentOrder.installmentsSchedule.length === 0) && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No installment schedule found for this order</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
