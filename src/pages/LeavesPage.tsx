import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import {
  selectAllLeaveRequests,
  selectEmployeeLeaves,
  selectHolidays,
  selectPTOBalance,
  selectPendingForManager,
  selectPendingForHR,
  addLeaveRequest,
  approveByManager,
  approveByHR,
  rejectLeave,
} from '../features/leaves/leavesSlice';
import { selectAllEmployees } from '../features/employees/employeesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import type { LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { generateId, formatDate, getHoursBetweenDates } from '../utils/dates';

const leaveTypes = [
  { value: 'pto', label: 'PTO (Paid Time Off)' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'festival', label: 'Festival Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'regional', label: 'Regional/Local Holiday' },
];

const statusVariants: Record<LeaveStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  manager_approved: 'info',
  approved: 'success',
  rejected: 'danger',
};

export function LeavesPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentRole, currentUserId } = useRoleAccess();

  const allLeaves = useAppSelector(selectAllLeaveRequests);
  const myLeaves = useAppSelector(selectEmployeeLeaves(currentUserId));
  const holidays = useAppSelector(selectHolidays);
  const ptoBalance = useAppSelector(selectPTOBalance(currentUserId));
  const pendingForManager = useAppSelector(selectPendingForManager(currentUserId));
  const pendingForHR = useAppSelector(selectPendingForHR);
  const employees = useAppSelector(selectAllEmployees);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'all' | 'holidays'>('my');
  const [newLeave, setNewLeave] = useState({
    type: 'pto' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const displayLeaves = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return myLeaves;
      case 'pending':
        if (currentRole === 'hr' || currentRole === 'admin') {
          return [...pendingForManager, ...pendingForHR];
        }
        return pendingForManager;
      case 'all':
        return allLeaves;
      default:
        return [];
    }
  }, [activeTab, myLeaves, pendingForManager, pendingForHR, allLeaves, currentRole]);

  const handleSubmitLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const hours = getHoursBetweenDates(newLeave.startDate, newLeave.endDate);

    if (newLeave.type === 'pto' && hours > ptoBalance.available) {
      showToast(`Insufficient PTO balance. Available: ${ptoBalance.available} hours`, 'error');
      return;
    }

    const request: LeaveRequest = {
      id: generateId(),
      employeeId: currentUserId,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      hours,
      reason: newLeave.reason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    dispatch(addLeaveRequest(request));
    showToast('Leave request submitted', 'success');
    setModalOpen(false);
    setNewLeave({ type: 'pto', startDate: '', endDate: '', reason: '' });
  };

  const handleManagerApprove = (id: string) => {
    dispatch(approveByManager({ id }));
    showToast('Leave approved by manager', 'success');
  };

  const handleHRApprove = (id: string) => {
    dispatch(approveByHR({ id }));
    showToast('Leave fully approved', 'success');
  };

  const handleReject = (id: string, byHR: boolean) => {
    dispatch(rejectLeave({ id, byHR }));
    showToast('Leave rejected', 'info');
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Unknown';
  };

  const canApproveAsManager = (leave: LeaveRequest) => {
    if (currentRole !== 'manager') return false;
    const employee = employees.find(e => e.id === leave.employeeId);
    return employee?.managerId === currentUserId && leave.status === 'pending';
  };

  const canApproveAsHR = (leave: LeaveRequest) => {
    if (currentRole !== 'hr' && currentRole !== 'admin') return false;
    return leave.status === 'pending' || leave.status === 'manager_approved';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Leave Management</h2>
          <p className="text-surface-500 mt-1">Request and manage leaves</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-2 bg-primary-100 rounded-lg w-fit mx-auto mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-primary-600">{ptoBalance.available}</p>
          <p className="text-sm text-surface-500">PTO Available (hrs)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-surface-700">{ptoBalance.accrued}</p>
          <p className="text-sm text-surface-500">Total Accrued (hrs)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">{ptoBalance.used}</p>
          <p className="text-sm text-surface-500">Used This Year (hrs)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-surface-600">12</p>
          <p className="text-sm text-surface-500">Monthly Accrual (hrs)</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="border-b border-surface-200">
          <nav className="flex gap-1 p-2">
            {[
              { key: 'my', label: 'My Leaves' },
              { key: 'pending', label: 'Pending Approval', hidden: currentRole === 'employee' },
              { key: 'all', label: 'All Leaves', hidden: currentRole === 'employee' },
              { key: 'holidays', label: 'Holidays' },
            ].filter(t => !t.hidden).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'holidays' ? (
          <div className="divide-y divide-surface-100">
            {holidays.map(holiday => (
              <div key={holiday.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-primary-600">
                      {new Date(holiday.observed || holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-primary-700">
                      {new Date(holiday.observed || holiday.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{holiday.name}</p>
                    <p className="text-sm text-surface-500">
                      {new Date(holiday.observed || holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {holiday.observed && holiday.observed !== holiday.date && (
                  <Badge variant="info">Observed</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {displayLeaves.length > 0 ? (
              displayLeaves.map(leave => (
                <div key={leave.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-surface-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-surface-900 capitalize">{leave.type.replace('_', ' ')} Leave</p>
                          <Badge variant={statusVariants[leave.status]}>
                            {leave.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {activeTab !== 'my' && (
                          <p className="text-sm text-primary-600 font-medium">{getEmployeeName(leave.employeeId)}</p>
                        )}
                        <p className="text-sm text-surface-500 mt-1">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.hours} hours)
                        </p>
                        <p className="text-sm text-surface-600 mt-2">{leave.reason}</p>
                        {leave.managerNote && (
                          <p className="text-sm text-surface-500 mt-1 italic">Manager: {leave.managerNote}</p>
                        )}
                        {leave.hrNote && (
                          <p className="text-sm text-surface-500 mt-1 italic">HR: {leave.hrNote}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canApproveAsManager(leave) && (
                        <>
                          <Button size="sm" onClick={() => handleManagerApprove(leave.id)}>
                            <Check className="w-4 h-4" /> Approve
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(leave.id, false)}>
                            <X className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}
                      {canApproveAsHR(leave) && (
                        <>
                          <Button size="sm" onClick={() => handleHRApprove(leave.id)}>
                            <Check className="w-4 h-4" /> {leave.status === 'manager_approved' ? 'Final Approve' : 'Approve'}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(leave.id, true)}>
                            <X className="w-4 h-4" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-surface-500">
                No leave requests found
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Request Leave" size="md">
        <div className="space-y-4">
          <Select
            label="Leave Type"
            value={newLeave.type}
            onChange={e => setNewLeave({ ...newLeave, type: e.target.value as LeaveType })}
            options={leaveTypes}
          />

          {newLeave.type === 'pto' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">PTO Balance: {ptoBalance.available} hours available</p>
                <p>You accrue 12 hours per month. PTO cannot be carried forward to next year.</p>
              </div>
            </div>
          )}

          {newLeave.type === 'regional' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Regional/Local Holiday</p>
                <p>Up to 3 days per year. Requires manager approval.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={newLeave.startDate}
              onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newLeave.endDate}
              onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })}
            />
          </div>

          {newLeave.startDate && newLeave.endDate && (
            <p className="text-sm text-surface-500">
              Duration: {getHoursBetweenDates(newLeave.startDate, newLeave.endDate)} hours
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Reason</label>
            <textarea
              value={newLeave.reason}
              onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitLeave}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
