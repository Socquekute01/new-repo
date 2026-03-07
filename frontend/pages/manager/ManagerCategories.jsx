import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/context/AuthContext";
import { categoryAPI } from "../../src/services/api";
import { toast } from "sonner";

export default function ManagerCategories() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openAddModal = () => {
    setFormData({ name: "", description: "" });
    setErrors({});
    setShowAddModal(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be at most 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    try {
      await categoryAPI.create(formData);
      toast.success("Category added successfully");
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!validateForm()) return;

    try {
      await categoryAPI.update(selectedCategory._id, formData);
      toast.success("Category updated successfully");
      setShowEditModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await categoryAPI.delete(selectedCategory._id);
      toast.success("Category deleted successfully");
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-teal-800 text-white flex-shrink-0 flex-col ${
            isSidebarOpen ? "flex" : "hidden"
          } md:flex fixed md:relative h-full z-50`}
        >
          <div className="p-6 border-b border-teal-700 flex items-center justify-center">
            <img
              src="/picture/logo.png"
              alt="Logo"
              className="h-16 w-16 object-cover rounded-full"
            />
          </div>
          <nav className="flex-1 mt-4">
            <button
              onClick={() => navigate("/manager/dashboard")}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
            >
              <i className="fas fa-chart-line mr-3"></i> Dashboard
            </button>
            <button
              onClick={() => navigate("/manager/orders")}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
            >
              <i className="fas fa-shopping-cart mr-3"></i> Orders
            </button>
            <button
              onClick={() => navigate("/manager/products")}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
            >
              <i className="fas fa-box mr-3"></i> Products
            </button>
            <button
              onClick={() => navigate("/manager/categories")}
              className="w-full flex items-center px-6 py-3 bg-teal-700 border-l-4 border-teal-400 text-left"
            >
              <i className="fas fa-tags mr-3"></i> Categories
            </button>
            <button
              onClick={() => navigate("/manager/reports")}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
            >
              <i className="fas fa-chart-bar mr-3"></i> Reports
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
            >
              <i className="fas fa-home mr-3"></i> Home
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left mt-4 border-t border-teal-700"
            >
              <i className="fas fa-sign-out-alt mr-3"></i> Logout
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden text-gray-500"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Category Management
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-teal-600">
                <i className="fas fa-bell"></i>
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || "M"}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-gray-700">Category List</h3>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Category
                </button>
              </div>

              {/* Search Section */}
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Created Date
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCategories.map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {category.description || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(category.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openEditModal(category)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit Category"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => openDeleteModal(category)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Category"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Add New Category
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter category description (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter category description (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Category
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedCategory.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
