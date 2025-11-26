'use client';

import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import Select from '../shared/Select';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface AuditLog {
  _id: string;
  userId: {
    email: string;
    role: string;
  };
  module: string;
  action: string;
  details: string;
  createdAt: string;
  propertyId?: {
    name: string;
  };
}

export default function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (moduleFilter !== 'all') params.module = moduleFilter;

      const response = await axios.get('/api/superadmin/audit-logs', { params });

      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Fetch audit logs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create')) return 'success';
    if (action.includes('update')) return 'info';
    if (action.includes('delete')) return 'danger';
    return 'default';
  };

  if (loading) {
    return <LoadingSpinner text="Loading audit logs..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600 mt-1">Track all system activities</p>
        </div>
        <Select
          options={[
            { value: 'all', label: 'All Modules' },
            { value: 'user', label: 'User Management' },
            { value: 'visitor', label: 'Visitor Management' },
            { value: 'property', label: 'Property Management' },
            { value: 'auth', label: 'Authentication' },
          ]}
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.userId.email}</div>
                      <div className="text-xs text-gray-500">{log.userId.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" size="sm">
                        {log.module.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {log.details}
                      {log.propertyId && (
                        <span className="ml-2 text-xs text-gray-500">
                          @ {log.propertyId.name}
                        </span>
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