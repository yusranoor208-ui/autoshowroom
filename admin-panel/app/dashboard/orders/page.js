'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/adminHelper';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, X } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
                      {order.items?.some(item => item.isInstallment) && (
                        <span className="text-xs badge badge-info">Installment</span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">{paymentMethod}</td>
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
                    <div className="flex gap-2">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
