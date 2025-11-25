'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  getDashboardStats,
  getRecentActivity,
  getAllOrders,
  getAllVehicles,
  getAllFeedback,
} from '@/lib/adminHelper';
import {
  Users,
  ShoppingCart,
  Car,
  DollarSign,
  TrendingUp,
  Package,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secondaryLoading, setSecondaryLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [inventoryInsights, setInventoryInsights] = useState({
    lowStock: [],
    types: {},
    totalStock: 0,
  });
  const [feedbackSummary, setFeedbackSummary] = useState({
    total: 0,
    average: 0,
    pending: 0,
    resolved: 0,
    recent: [],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const auth = getAuth();
      
      // Check if we just signed up (from localStorage)
      const justSignedUp = localStorage.getItem('justSignedUp') === 'true';
      if (justSignedUp) {
        // Clear the flag
        localStorage.removeItem('justSignedUp');
        
        // Force refresh the token
        const user = auth.currentUser;
        if (user) {
          try {
            await user.getIdToken(true);
            console.log('User signed up successfully, token refreshed');
          } catch (error) {
            console.error('Error refreshing token:', error);
          }
        }
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log('No user found, redirecting to login');
          router.push('/login');
        } else {
          console.log('User authenticated, checking database...');
          
          // Ensure user exists in Firestore with admin role
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (!userDoc.exists()) {
              // Create admin user in Firestore if doesn't exist
              console.log('User not found in database, creating admin user...');
              const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'Admin',
                role: 'admin',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                emailVerified: user.emailVerified || false
              };
              await setDoc(doc(db, 'users', user.uid), userData);
              console.log('Admin user created in database');
            } else {
              const userData = userDoc.data();
              // Update role to admin if not already admin
              if (userData.role !== 'admin') {
                console.log('Updating user role to admin...');
                await updateDoc(doc(db, 'users', user.uid), {
                  role: 'admin',
                  updatedAt: serverTimestamp()
                });
                console.log('User role updated to admin');
              }
            }
          } catch (error) {
            console.error('Error checking/creating user in database:', error);
          }
          
          console.log('Loading dashboard data...');
          loadStats();
          loadActivity();
          loadSupplementaryData();
        }
      });

      return () => unsubscribe();
    };

    checkAuth();
  }, [router]);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const activities = await getRecentActivity();
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const loadSupplementaryData = async () => {
    try {
      const [orders, vehicles, feedback] = await Promise.all([
        getAllOrders().catch(() => []),
        getAllVehicles().catch(() => []),
        getAllFeedback().catch(() => []),
      ]);

      if (orders) {
        const statusCounts = orders.reduce(
          (acc, order) => {
            const key = (order.status || 'pending').toLowerCase();
            if (acc[key] !== undefined) {
              acc[key] += 1;
            }
            return acc;
          },
          { pending: 0, processing: 0, completed: 0, cancelled: 0 }
        );

        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setOrderStats(statusCounts);
        setRecentOrders(sortedOrders.slice(0, 5));
      }

      if (vehicles) {
        const lowStock = vehicles
          .filter((vehicle) => (vehicle.stock ?? 0) <= 5)
          .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
          .slice(0, 5);

        const typeBreakdown = vehicles.reduce((acc, vehicle) => {
          const type = vehicle.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const totalStock = vehicles.reduce((sum, vehicle) => sum + (vehicle.stock || 0), 0);

        setInventoryInsights({
          lowStock,
          types: typeBreakdown,
          totalStock,
        });
      }

      if (feedback) {
        const total = feedback.length;
        const average =
          total > 0
            ? (feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / total).toFixed(1)
            : 0;
        const pending = feedback.filter((item) => item.status === 'pending').length;
        const resolved = feedback.filter((item) => item.status === 'resolved').length;
        const recent = feedback
          .sort((a, b) => {
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 3);

        setFeedbackSummary({
          total,
          average,
          pending,
          resolved,
          recent,
        });
      }
    } catch (error) {
      console.error('Error loading supplementary dashboard data:', error);
    } finally {
      setSecondaryLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const activityTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'order':
        router.push('/dashboard/orders');
        break;
      case 'user':
        router.push('/dashboard/users');
        break;
      case 'vehicle':
        router.push('/dashboard/vehicles');
        break;
      case 'payment':
        router.push('/dashboard/transactions');
        break;
      default:
        break;
    }
  };

  const formatDate = (value, fallback = 'N/A') => {
    if (!value) return fallback;
    try {
      const date = value.toDate ? value.toDate() : new Date(value);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return fallback;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || Number.isNaN(amount)) return 'PKR 0';
    return `PKR ${Number(amount).toLocaleString()}`;
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Car,
      color: 'bg-purple-500',
      change: '+3%',
    },
    {
      title: 'Total Revenue',
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Package,
      color: 'bg-orange-500',
      change: '-5%',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: TrendingUp,
      color: 'bg-teal-500',
      change: '+20%',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Overview of your vehicle management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-3">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-3 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-4 rounded-2xl shadow-md`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id || index}
                  onClick={() => handleActivityClick(activity)}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl hover:shadow-md transition-all border border-gray-100 cursor-pointer hover:border-purple-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                  <span
                    className={`badge ${
                      activity.type === 'order'
                        ? 'badge-success'
                        : activity.type === 'user'
                        ? 'badge-info'
                        : activity.type === 'vehicle'
                        ? 'badge-warning'
                        : 'badge-gray'
                    }`}
                  >
                    {activity.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/vehicles')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-xl flex flex-col items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
            >
              <Car className="w-6 h-6" />
              <span className="font-semibold">Add Vehicle</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/users')}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-5 rounded-xl flex flex-col items-center gap-2 hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all shadow-md"
            >
              <Users className="w-6 h-6" />
              <span className="font-semibold">View Users</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-5 rounded-xl flex flex-col items-center gap-2 hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all shadow-md"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="font-semibold">View Orders</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/vehicles')}
              className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-5 rounded-xl flex flex-col items-center gap-2 hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all shadow-md"
            >
              <Package className="w-6 h-6" />
              <span className="font-semibold">Manage Stock</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Orders Snapshot</h3>
              <p className="text-gray-500 text-sm">Live view of the latest orders</p>
            </div>
            {secondaryLoading ? (
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            ) : (
              <span className="text-sm text-gray-500">
                {recentOrders.length > 0 ? `${recentOrders.length} orders shown` : 'No orders'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending', value: orderStats.pending, color: 'bg-orange-100 text-orange-700' },
              { label: 'Processing', value: orderStats.processing, color: 'bg-blue-100 text-blue-700' },
              { label: 'Completed', value: orderStats.completed, color: 'bg-green-100 text-green-700' },
              { label: 'Cancelled', value: orderStats.cancelled, color: 'bg-red-100 text-red-700' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-xl p-3 ${stat.color}`}>
                <p className="text-xs uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {secondaryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                No orders yet.
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{order.customerName || 'Unknown customer'}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)} · {order.orderNumber || order.id?.slice(0, 6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{formatCurrency(order.totalAmount || order.total)}</p>
                    <span
                      className={`badge ${
                        (order.status || 'pending') === 'completed'
                          ? 'badge-success'
                          : (order.status || '').toLowerCase() === 'processing'
                          ? 'badge-info'
                          : (order.status || '').toLowerCase() === 'cancelled'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {(order.status || 'pending').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Inventory Health</h3>
              <p className="text-gray-500 text-sm">Monitor stock levels across vehicle types</p>
            </div>
            {secondaryLoading ? (
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            ) : (
              <span className="text-sm text-gray-500">
                {Object.keys(inventoryInsights.types).length} categories
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Total Stock</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {inventoryInsights.totalStock.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
              <p className="text-xs uppercase text-gray-500 font-semibold">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {inventoryInsights.lowStock.length}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Type Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(inventoryInsights.types).map(([type, count]) => (
                <span key={type} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                  {type}: {count}
                </span>
              ))}
              {Object.keys(inventoryInsights.types).length === 0 && !secondaryLoading && (
                <span className="text-sm text-gray-500">No vehicles yet.</span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-600 mb-3">Critical Stock</p>
            {secondaryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : inventoryInsights.lowStock.length === 0 ? (
              <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4">
                All vehicles have healthy stock.
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryInsights.lowStock.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{vehicle.name}</p>
                      <p className="text-xs text-gray-500">{vehicle.type}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                      {vehicle.stock || 0} units
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Customer Feedback</h3>
            <p className="text-gray-500 text-sm">Keep an eye on satisfaction trends</p>
          </div>
          {secondaryLoading ? (
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          ) : (
            <span className="text-sm text-gray-600">
              {feedbackSummary.total} feedback entries
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Average Rating</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{feedbackSummary.average}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Pending Review</p>
            <p className="text-4xl font-bold text-orange-500 mt-2">{feedbackSummary.pending}</p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs uppercase text-gray-500 font-semibold">Resolved</p>
            <p className="text-4xl font-bold text-green-500 mt-2">{feedbackSummary.resolved}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {secondaryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : feedbackSummary.recent.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-xl">
              No feedback yet.
            </div>
          ) : (
            feedbackSummary.recent.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{feedback.customerName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {'⭐'.repeat(Math.round(feedback.rating || 0))}
                    <span className="text-sm text-gray-500 ml-2">
                      {(feedback.status || 'pending').toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{feedback.message || 'No message provided.'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
