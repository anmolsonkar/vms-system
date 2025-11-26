"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Select from "../shared/Select";
import LoadingSpinner from "../shared/LoadingSpinner";
import { ChevronLeft, ChevronRight, Trash2, Users } from "lucide-react";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  propertyId?: {
    _id: string;
    name: string;
    type: string;
  } | null;
  residentDetails?: {
    _id: string;
    name: string;
    unitNumber: string;
    phone: string;
  };
}

interface UserTableProps {
  onRefresh: boolean;
}

export default function UserTable({ onRefresh }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, onRefresh]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = { page, limit: 10 };
      if (roleFilter !== "all") params.role = roleFilter;

      const response = await axios.get("/api/superadmin/users/list", {
        params,
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error("Fetch users error:", error);
      setError(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userEmail}?`)) return;

    try {
      await axios.delete(`/api/superadmin/users/delete?userId=${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      alert("Failed to deactivate user");
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

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          All Users ({users.length})
        </h3>
        <Select
          options={[
            { value: "all", label: "All Roles" },
            { value: "resident", label: "Residents" },
            { value: "guard", label: "Guards" },
          ]}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.residentDetails?.name || user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.residentDetails && (
                          <div className="text-sm text-gray-500">
                            Unit {user.residentDetails.unitNumber} •{" "}
                            {user.residentDetails.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.propertyId ? (
                        <div>
                          <div>{user.propertyId.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.propertyId.type}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          {user.role === "superadmin"
                            ? "All Properties"
                            : "No Property"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={user.isActive ? "success" : "danger"}
                        size="sm"
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {user.role !== "superadmin" && (
                        <button
                          onClick={() => handleDelete(user._id, user.email)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
    </div>
  );
}
