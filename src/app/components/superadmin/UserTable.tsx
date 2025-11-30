"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Input from "../shared/Input";
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
  MoreVertical,
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
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

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
    setShowActionsMenu(null);
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
    setShowActionsMenu(null);
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

  const handleDeactivate = async (user: User) => {
    if (confirm(`Deactivate ${user.fullName || user.email}?`)) {
      try {
        await axios.delete(`/api/superadmin/users/delete?userId=${user._id}`);
        fetchUsers();
        setShowActionsMenu(null);
      } catch (error) {
        alert("Failed to deactivate user");
      }
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
      label: "All",
      fullLabel: "All Users",
      icon: Users,
      count: users.length,
    },
    {
      id: "resident" as const,
      label: "Residents",
      fullLabel: "Residents",
      icon: UserCheck,
      count: users.filter((u) => u.role === "resident").length,
    },
    {
      id: "guard" as const,
      label: "Guards",
      fullLabel: "Guards",
      icon: Shield,
      count: users.filter((u) => u.role === "guard").length,
    },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 -mx-4 sm:mx-0">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 px-4 sm:px-0">
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
                    flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.label}</span>
                  <span
                    className={`
                    py-0.5 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-semibold
                    ${
                      activeTab === tab.id
                        ? "bg-purple-100 text-purple-600"
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
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {error && (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUsers}>Retry</Button>
          </div>
        </Card>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block">
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
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          size="sm"
                        >
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
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
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
                            {user.isActive && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                title="Deactivate"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
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
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user._id} hover>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {user.fullName || "N/A"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={user.isActive ? "success" : "danger"}
                        size="sm"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {user.role !== "superadmin" && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() =>
                          setShowActionsMenu(
                            showActionsMenu === user._id ? null : user._id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {showActionsMenu === user._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowActionsMenu(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => handleEdit(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit User
                            </button>
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"
                            >
                              <Key className="h-4 w-4" />
                              Change Password
                            </button>
                            {user.isActive && (
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
                              >
                                <Shield className="h-4 w-4" />
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                                setShowActionsMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[70px]">
                      Email:
                    </span>
                    <span className="text-gray-900 break-all">
                      {user.email}
                    </span>
                  </div>

                  {user.unitNumber && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-medium min-w-[70px]">
                        Unit:
                      </span>
                      <span className="text-gray-900">{user.unitNumber}</span>
                    </div>
                  )}

                  {user.phoneNumber && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-medium min-w-[70px]">
                        Phone:
                      </span>
                      <span className="text-gray-900">{user.phoneNumber}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-[70px]">
                      Property:
                    </span>
                    <span className="text-gray-900">
                      {user.propertyId ? (
                        <div>
                          <div>{user.propertyId.name}</div>
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
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2"
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
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active User
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-red-800">
              ⚠️ <strong>Warning:</strong> This action cannot be undone!
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete{" "}
            <strong>{selectedUser?.fullName || selectedUser?.email}</strong>?
          </p>

          <p className="text-xs sm:text-sm text-gray-500">
            All associated data including visitor history will be lost.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
