import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  X,
  Stethoscope,
  Microscope,
  Shield,
  User,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogFooter } from '../components/ui/dialog';
import { Select } from '../components/ui/select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { BulkActionToolbar } from '../components/common/BulkActionToolbar';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/ui/toast';
import { cn } from '../lib/utils';

export interface UserManagementItem {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN';
  status: 'Active' | 'Pending Verification' | 'Deactivated';
  registrationDate: string;
  lastLogin: string;
  phone?: string;
  organization?: string;
  activitySummary?: string;
}

const USER_DIRECTORY_DATA: UserManagementItem[] = [
  {
    id: 'USR-101',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@healthshare.org',
    role: 'PATIENT',
    status: 'Active',
    registrationDate: '2026-07-28',
    lastLogin: 'Today, 09:12 AM',
    phone: '+1 (555) 234-5678',
    organization: 'Patient Self-Managed',
    activitySummary: 'Uploaded 6 medical records; granted 2 active consent permissions.',
  },
  {
    id: 'USR-102',
    name: 'Dr. Marcus Brody',
    email: 'marcus.brody@stjude.org',
    role: 'DOCTOR',
    status: 'Active',
    registrationDate: '2026-07-27',
    lastLogin: 'Today, 08:30 AM',
    phone: '+1 (555) 876-5432',
    organization: 'St. Jude Cardiology Practice',
    activitySummary: 'Issued 14 e-prescriptions; conducted 18 telehealth consultations.',
  },
  {
    id: 'USR-103',
    name: 'Dr. Alex Rivera',
    email: 'alex.rivera@biogen.org',
    role: 'RESEARCHER',
    status: 'Active',
    registrationDate: '2026-07-26',
    lastLogin: 'Yesterday, 04:45 PM',
    phone: '+1 (555) 345-6789',
    organization: 'BioGen Epidemiological Institute',
    activitySummary: 'Executed 128 cohort queries; downloaded 1.4 TB Safe Harbor datasets.',
  },
  {
    id: 'USR-104',
    name: 'Arthur Pendelton',
    email: 'arthur.p@healthshare.org',
    role: 'ADMIN',
    status: 'Active',
    registrationDate: '2026-07-25',
    lastLogin: 'Today, 10:00 AM',
    phone: '+1 (555) 456-7890',
    organization: 'HealthShare Governance Core',
    activitySummary: 'Flushed Redis session cache; approved 4 doctor license verifications.',
  },
  {
    id: 'USR-105',
    name: 'Dr. Robert Langdon',
    email: 'robert.langdon@harvard.edu',
    role: 'DOCTOR',
    status: 'Pending Verification',
    registrationDate: '2026-07-28',
    lastLogin: 'Never',
    phone: '+1 (555) 567-8901',
    organization: 'Harvard Cardiology Department',
    activitySummary: 'Registration proposal submitted; awaiting License MD-90412-MA verification.',
  },
  {
    id: 'USR-106',
    name: 'Clara Oswald',
    email: 'clara.oswald@gmail.com',
    role: 'PATIENT',
    status: 'Deactivated',
    registrationDate: '2026-06-15',
    lastLogin: '2 weeks ago',
    phone: '+1 (555) 678-9012',
    organization: 'Patient Self-Managed',
    activitySummary: 'Account suspended per user request.',
  },
];

export const UserManagementPage: React.FC = () => {
  const { addToast } = useToast();

  const [users, setUsers] = useState<UserManagementItem[]>(USER_DIRECTORY_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>('ALL');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');

  // Multi-select Checkbox State for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected User Details Panel Modal State
  const [selectedUserModal, setSelectedUserModal] = useState<UserManagementItem | null>(null);

  // Edit Role Modal State
  const [editRoleUser, setEditRoleUser] = useState<UserManagementItem | null>(null);
  const [targetRole, setTargetRole] = useState<UserManagementItem['role']>('DOCTOR');

  // Delete User Confirmation Dialog State
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserManagementItem | null>(null);

  // Filter Categories
  const roleTabs = ['ALL', 'PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'];
  const statusTabs = ['ALL', 'Active', 'Pending Verification', 'Deactivated'];

  // Filtered Users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRoleTab === 'ALL' || item.role === selectedRoleTab;

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status.toUpperCase() === selectedStatusTab.toUpperCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRoleTab, selectedStatusTab]);

  // Paginated Users slice
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Handlers for Row Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(paginatedUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Single User Action Handlers
  const handleToggleUserStatus = (userItem: UserManagementItem) => {
    const newStatus: UserManagementItem['status'] = userItem.status === 'Active' ? 'Deactivated' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userItem.id ? { ...u, status: newStatus } : u))
    );
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Account status for ${userItem.name} set to ${newStatus}.`,
    });
  };

  const handleResetPassword = (userItem: UserManagementItem) => {
    addToast({
      type: 'success',
      title: 'Password Reset Sent',
      message: `Sent password reset recovery link to ${userItem.email}.`,
    });
  };

  const handleSaveRoleChange = () => {
    if (editRoleUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editRoleUser.id ? { ...u, role: targetRole } : u))
      );
      addToast({
        type: 'success',
        title: 'Role Updated',
        message: `Updated RBAC role for ${editRoleUser.name} to ${targetRole}.`,
      });
      setEditRoleUser(null);
    }
  };

  const handleConfirmDeleteUser = () => {
    if (deleteTargetUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      addToast({
        type: 'error',
        title: 'User Deleted',
        message: `Deleted user account ${deleteTargetUser.name} (${deleteTargetUser.id}).`,
      });
      setDeleteTargetUser(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" /> Identity & Access Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user accounts, RBAC role permissions, clearance statuses, and password reset workflows.
          </p>
        </div>
      </div>

      {/* 2. User Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono block">1,420</span>
          <span className="text-2xs text-slate-500">Platform Directory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Active Patients</span>
          <span className="text-1xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">1,150</span>
          <span className="text-2xs text-slate-500">Self-managed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">Licensed Doctors</span>
          <span className="text-1xl font-black text-sky-600 dark:text-sky-400 font-mono block">210</span>
          <span className="text-2xs text-slate-500">Clinical practice</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Researchers</span>
          <span className="text-1xl font-black text-indigo-600 dark:text-indigo-400 font-mono block">60</span>
          <span className="text-2xs text-slate-500">IRB cleared</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Administrators</span>
          <span className="text-1xl font-black text-rose-600 dark:text-rose-400 font-mono block">4</span>
          <span className="text-2xs text-slate-500">Root Governance</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search User ID, name, or email address..."
            className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {roleTabs.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRoleTab(role);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none',
                selectedRoleTab === role
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bulk Action Toolbar (Renders when rows are selected) */}
      <BulkActionToolbar
        selectedCount={selectedUserIds.length}
        onClearSelection={() => setSelectedUserIds([])}
        onActivateSelected={() => {
          setUsers((prev) => prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: 'Active' } : u)));
          setSelectedUserIds([]);
        }}
        onDeactivateSelected={() => {
          setUsers((prev) => prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: 'Deactivated' } : u)));
          setSelectedUserIds([]);
        }}
        onDeleteSelected={() => {
          setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
          setSelectedUserIds([]);
        }}
      />

      {/* 5. User Table */}
      {filteredUsers.length === 0 ? (
        /* Empty State UI */
        <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Users Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No platform user accounts match your current search query or role filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedRoleTab('ALL');
              setSelectedStatusTab('ALL');
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-3.5">User ID</th>
                  <th className="px-4 py-3.5">User Name & Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Clearance Status</th>
                  <th className="px-4 py-3.5">Registration Date</th>
                  <th className="px-4 py-3.5">Last Login</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(userItem.id)}
                        onChange={() => handleToggleSelectUser(userItem.id)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-500">{userItem.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {userItem.name}
                      </div>
                      <span className="text-2xs text-slate-400 font-mono block">{userItem.email}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={userItem.role === 'ADMIN' ? 'danger' : userItem.role === 'DOCTOR' ? 'primary' : userItem.role === 'RESEARCHER' ? 'info' : 'secondary'} size="sm">
                        {userItem.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={userItem.status === 'Active' ? 'success' : userItem.status === 'Pending Verification' ? 'warning' : 'secondary'} size="sm" dot>
                        {userItem.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-400 font-mono">{userItem.registrationDate}</td>
                    <td className="px-4 py-4 text-slate-400 font-mono">{userItem.lastLogin}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedUserModal(userItem)} title="View Profile">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => { setEditRoleUser(userItem); setTargetRole(userItem.role); }} title="Edit Role">
                          <Sliders className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleResetPassword(userItem)} title="Reset Password">
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => handleToggleUserStatus(userItem)} title={userItem.status === 'Active' ? 'Deactivate' : 'Activate'}>
                          {userItem.status === 'Active' ? <UserX className="w-3.5 h-3.5 text-amber-500" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setDeleteTargetUser(userItem)} title="Delete Account">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 6. Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
      />

      {/* 7. USER DETAILS PANEL MODAL */}
      {selectedUserModal && (
        <Dialog
          isOpen={!!selectedUserModal}
          onClose={() => setSelectedUserModal(null)}
          title={`User Profile Details: ${selectedUserModal.name}`}
          maxWidth="lg"
        >
          <div className="space-y-6 py-2 text-xs">
            {/* User Profile Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-black text-lg flex items-center justify-center">
                  {selectedUserModal.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{selectedUserModal.name}</h4>
                  <p className="text-slate-500 font-mono">{selectedUserModal.email} • ID: {selectedUserModal.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{selectedUserModal.role}</Badge>
                <Badge variant={selectedUserModal.status === 'Active' ? 'success' : 'warning'} size="sm">
                  {selectedUserModal.status}
                </Badge>
              </div>
            </div>

            {/* Account Info Grid */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-2 sm:grid-cols-3 gap-4 text-2xs text-slate-500">
              <div>
                <span className="block font-bold text-slate-400 uppercase">Organization / Affiliation</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedUserModal.organization || 'N/A'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Contact Phone</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedUserModal.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400 uppercase">Registration Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedUserModal.registrationDate}</span>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Account Activity Summary</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {selectedUserModal.activitySummary || 'No recent activity logged for this user.'}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedUserModal(null)}>
                Close
              </Button>
              <Button variant="soft" size="sm" onClick={() => handleResetPassword(selectedUserModal)} leftIcon={<KeyRound className="w-4 h-4" />}>
                Reset Password
              </Button>
              <Button size="sm" onClick={() => handleToggleUserStatus(selectedUserModal)} leftIcon={selectedUserModal.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}>
                {selectedUserModal.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 8. EDIT ROLE MODAL */}
      {editRoleUser && (
        <Dialog
          isOpen={!!editRoleUser}
          onClose={() => setEditRoleUser(null)}
          title={`Edit Role Assignment: ${editRoleUser.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-slate-500">
              Select the RBAC role clearance level for user <strong>{editRoleUser.name}</strong> ({editRoleUser.email}).
            </p>

            <div>
              <label className="block text-2xs font-bold text-slate-500 uppercase mb-1">Target RBAC Role</label>
              <Select value={targetRole} onChange={(e: any) => setTargetRole(e.target.value)}>
                <option value="PATIENT">Patient (Self-Managed EHR)</option>
                <option value="DOCTOR">Doctor (Clinical Workspace)</option>
                <option value="RESEARCHER">Researcher (De-identified Cohort Discovery)</option>
                <option value="ADMIN">System Administrator (Root Governance)</option>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setEditRoleUser(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRoleChange} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Role Assignment
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}

      {/* 9. DELETE USER CONFIRMATION DIALOG */}
      {deleteTargetUser && (
        <ConfirmDialog
          isOpen={!!deleteTargetUser}
          onClose={() => setDeleteTargetUser(null)}
          onConfirm={handleConfirmDeleteUser}
          title="Confirm User Account Deletion"
          description={`Are you sure you want to permanently delete user account "${deleteTargetUser.name}" (${deleteTargetUser.email})? This action cannot be undone.`}
          confirmText="Delete Account"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};

export default UserManagementPage;
