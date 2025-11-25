'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllVehicles, deleteVehicle, addVehicle, updateVehicle } from '@/lib/adminHelper';
import { Plus, Edit, Trash2, Search, X, Upload } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const getInitialFormData = () => ({
  name: '',
  price: '',
  type: 'E-Scooter',
  description: '',
  colors: '',
  stock: 0,
  images: [],
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState(() => getInitialFormData());
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputId = useMemo(
    () => `vehicle-upload-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const resetFormState = () => {
    setFormData(getInitialFormData());
    setEditingVehicle(null);
    setUploadingImages(false);
    setDragActive(false);
  };

  const closeModal = () => {
    resetFormState();
    setShowModal(false);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        loadVehicles();
      } catch (error) {
        alert('Error deleting vehicle');
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      price: vehicle.price || '',
      type: vehicle.type || 'E-Scooter',
      description: vehicle.description || '',
      colors: Array.isArray(vehicle.colors)
        ? vehicle.colors.join(', ')
        : vehicle.colors || '',
      stock: vehicle.stock || 0,
      images: Array.isArray(vehicle.images) ? vehicle.images : [],
    });
    setShowModal(true);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_IMAGE_SIZE);

    if (oversizedFiles.length > 0) {
      alert('Some files were larger than 10MB and were skipped.');
    }

    const validFiles = selectedFiles.filter(file => file.size <= MAX_IMAGE_SIZE);
    if (validFiles.length === 0) {
      setDragActive(false);
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        try {
          const url = await uploadImageToCloudinary(file);
          return url;
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          throw error; // Re-throw to be caught by the outer catch
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error?.message || 'Error uploading images. Please try again.');
    } finally {
      setUploadingImages(false);
      setDragActive(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileInputChange = (event) => {
    const { files } = event.target;
    handleImageUpload(files);
    event.target.value = '';
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploadingImages) {
      setDragActive(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!uploadingImages) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Only reset if leaving the drop zone (not entering children)
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (uploadingImages) {
      setDragActive(false);
      return;
    }
    const { files } = event.dataTransfer || {};
    if (!files || files.length === 0) {
      setDragActive(false);
      return;
    }
    handleImageUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicleData = {
        ...formData,
        colors: (formData.colors || '')
          .split(',')
          .map(c => c.trim())
          .filter(Boolean),
      };

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await addVehicle(vehicleData);
      }

      closeModal();
      loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error saving vehicle');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">Manage your vehicle inventory</p>
        </div>
        <button
          onClick={() => {
            resetFormState();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
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
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Colors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="font-medium">{vehicle.name}</td>
                <td>
                  <span className="badge badge-info">{vehicle.type}</span>
                </td>
                <td>{vehicle.price}</td>
                <td>
                  <span className={`badge ${vehicle.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {vehicle.stock || 0} units
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {Array.isArray(vehicle.colors) && vehicle.colors.slice(0, 3).map((color, idx) => (
                      <span
                        key={idx}
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
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
                    <option value="E-Scooter">E-Scooter</option>
                    <option value="Rikshaw">Rikshaw</option>
                    <option value="Battery">Battery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="PKR 169,000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="input-field"
                    placeholder="blue, black, red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Images
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'} ${uploadingImages ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  aria-busy={uploadingImages}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id={fileInputId}
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor={fileInputId}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">
                      {uploadingImages ? 'Uploading images...' : 'Click to browse or drag & drop vehicle images'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB per file
                    </span>
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                      {formData.images.map((imageUrl, index) => (
                        <div key={imageUrl} className="relative flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={`Vehicle ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.images.length} image{formData.images.length > 1 ? 's' : ''} uploaded. They will appear as a scrollable gallery for customers.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
