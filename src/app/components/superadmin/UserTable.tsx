"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Input from "../shared/Input";
import Select from "../shared/Select";
import Modal from "../shared/Modal";
import LoadingSpinner from "../shared/LoadingSpinner";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Users,
  Edit,
  Key,
  Shield,
  UserCheck,
  Search,
  X,
} from "lucide-react";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  propertyId?: {
    _id: string;
    name: string;
    type: string;
  } | null;
  unitNumber?: string;
  phoneNumber?: string;
  createdAt: string;
}

interface UserTableProps {
  onRefresh: boolean;
}

export default function UserTable({ onRefresh }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "resident" | "guard">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    unitNumber: "",
    phoneNumber: "",
    isActive: true,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, activeTab, onRefresh]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { page, limit: 20 };
      if (activeTab !== "all") params.role = activeTab;

      const response = await axios.get("/api/superadmin/users/list", {
        params,
      });

      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      setError(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email,
      unitNumber: user.unitNumber || "",
      phoneNumber: user.phoneNumber || "",
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await axios.put("/api/superadmin/users/update", {
        userId: selectedUser._id,
        ...editForm,
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update user");
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!selectedUser) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      await axios.put("/api/superadmin/users/update", {
        userId: selectedUser._id,
        password: passwordForm.newPassword,
      });
      setShowPasswordModal(false);
      alert("Password updated successfully");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update password");
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await axios.delete(`/api/superadmin/users/delete?userId=${userId}`);
      fetchUsers();
    } catch (error) {
      alert("Failed to deactivate user");
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedUser) return;

    try {
      await axios.delete(
        `/api/superadmin/users/delete?userId=${selectedUser._id}&permanent=true`
      );
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete user");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "danger";
      case "resident":
        return "success";
      case "guard":
        return "info";
      default:
        return "default";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.unitNumber?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (user.phoneNumber?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    return matchesSearch;
  });

  const tabs = [
    {
      id: "all" as const,
      label: "All Users",
      icon: Users,
      count: users.length,
    },
    {
      id: "resident" as const,
      label: "Residents",
      icon: UserCheck,
      count: users.filter((u) => u.role === "resident").length,
    },
    {
      id: "guard" as const,
      label: "Guards",
      icon: Shield,
      count: users.filter((u) => u.role === "guard").length,
    },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
                <span
                  className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs
                  ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }
                `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name, email, unit, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUsers}>Retry</Button>
          </div>
        </Card>
      )}

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  {activeTab !== "guard" && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {user.fullName || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    {activeTab !== "guard" && (
                      <>
                        <td className="px-4 py-3 text-gray-600">
                          {user.unitNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {user.phoneNumber || "-"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      {user.propertyId ? (
                        <div>
                          <div className="text-gray-900">
                            {user.propertyId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.propertyId.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          {user.role === "superadmin"
                            ? "All Properties"
                            : "No Property"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.isActive ? "success" : "danger"}
                        size="sm"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "superadmin" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleChangePassword(user)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Change password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Deactivate ${user.fullName || user.email}?`
                                  )
                                ) {
                                  handleDeactivate(user._id);
                                }
                              }}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Deactivate"
                            >
                              <Shield className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Permanent delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) =>
              setEditForm({ ...editForm, fullName: e.target.value })
            }
            placeholder="Enter full name"
          />

          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            placeholder="Enter email"
          />

          {selectedUser?.role === "resident" && (
            <>
              <Input
                label="Unit Number"
                value={editForm.unitNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, unitNumber: e.target.value })
                }
                placeholder="e.g., A-101"
              />

              <Input
                label="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, phoneNumber: e.target.value })
                }
                placeholder="10-digit number"
                maxLength={10}
              />
            </>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm({ ...editForm, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active User
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} fullWidth>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Change password for{" "}
            <strong>{selectedUser?.fullName || selectedUser?.email}</strong>
          </p>

          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            placeholder="Minimum 8 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            placeholder="Re-enter password"
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleSavePassword} fullWidth>
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Permanent Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Warning:</strong> This action cannot be undone!
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete{" "}
            <strong>{selectedUser?.fullName || selectedUser?.email}</strong>?
          </p>

          <p className="text-sm text-gray-500">
            All associated data including visitor history will be lost.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handlePermanentDelete} fullWidth>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
