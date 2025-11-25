'use client';

import { useEffect, useState } from 'react';
import { getAllNotifications, sendNotification, sendBulkNotification, getAllUsers } from '@/lib/adminHelper';
import { Bell, Send, Users, X } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    sendTo: 'all',
    selectedUsers: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notifData, userData] = await Promise.all([
        getAllNotifications(),
        getAllUsers(),
      ]);
      setNotifications(notifData);
      setUsers(userData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (formData.sendTo === 'all') {
        const allUserIds = users.map(u => u.id);
        await sendBulkNotification(allUserIds, notificationData);
      } else if (formData.sendTo === 'selected') {
        await sendBulkNotification(formData.selectedUsers, notificationData);
      } else {
        await sendNotification({
          ...notificationData,
          userId: formData.sendTo,
        });
      }

      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        sendTo: 'all',
        selectedUsers: [],
      });
      loadData();
      alert('Notification sent successfully!');
    } catch (error) {
      alert('Error sending notification');
    }
  };

  const getNotificationIcon = (type) => {
    const colors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    return colors[type] || colors.info;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notification Management</h1>
          <p className="text-gray-600 mt-1">Send notifications to users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: notifications.length, color: 'bg-blue-500' },
          { label: 'Today', value: notifications.filter(n => {
            const notifDate = n.createdAt?.toDate();
            const today = new Date();
            return notifDate && notifDate.toDateString() === today.toDateString();
          }).length, color: 'bg-green-500' },
          { label: 'This Week', value: notifications.filter(n => {
            const notifDate = n.createdAt?.toDate();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return notifDate && notifDate > weekAgo;
          }).length, color: 'bg-purple-500' },
          { label: 'Active Users', value: users.length, color: 'bg-orange-500' },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <Bell className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notifications</h3>
        <div className="space-y-3">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className={`${getNotificationIcon(notification.type)} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`badge ${
                    notification.type === 'success' ? 'badge-success' :
                    notification.type === 'warning' ? 'badge-warning' :
                    notification.type === 'error' ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {notification.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notification.createdAt 
                      ? format(notification.createdAt.toDate(), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications sent yet</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Send Notification</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Enter notification message"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send To
                  </label>
                  <select
                    value={formData.sendTo}
                    onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                    className="input-field"
                  >
                    <option value="all">All Users</option>
                    <option value="selected">Selected Users</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.sendTo === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {users.map(user => (
                      <label key={user.id} className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedUsers: [...formData.selectedUsers, user.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedUsers: formData.selectedUsers.filter(id => id !== user.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{user.name || user.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Notification
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
