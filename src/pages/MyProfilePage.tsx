import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { selectEmployeeById, updateEmployee } from '../features/employees/employeesSlice';
import { selectEmployeePayslips } from '../features/payslips/payslipsSlice';
import { selectEmployeeLeaves, selectPTOBalance } from '../features/leaves/leavesSlice';
import { selectEmployeeReviews } from '../features/performance/performanceSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useToast } from '../hooks/useToast';
import { 
  User, FileText, Calendar, Target, Download, Phone, MapPin, Mail, Edit2, Save, X 
} from 'lucide-react';
import { formatDate } from '../utils/dates';

type Tab = 'profile' | 'payslips' | 'leaves' | 'performance' | 'documents';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MyProfilePage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const currentUserId = useAppSelector(state => state.auth.currentUserId);
  const employee = useAppSelector(selectEmployeeById(currentUserId));
  const payslips = useAppSelector(selectEmployeePayslips(currentUserId));
  const leaves = useAppSelector(selectEmployeeLeaves(currentUserId));
  const ptoBalance = useAppSelector(selectPTOBalance(currentUserId));
  const reviews = useAppSelector(selectEmployeeReviews(currentUserId));
  
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: employee?.phone || '',
    address: employee?.address || '',
  });

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">Employee profile not found</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    dispatch(updateEmployee({
      ...employee,
      phone: editForm.phone,
      address: editForm.address,
    }));
    setIsEditing(false);
    showToast('Profile updated successfully', 'success');
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'payslips' as Tab, label: 'Payslips', icon: FileText },
    { id: 'leaves' as Tab, label: 'Leaves', icon: Calendar },
    { id: 'performance' as Tab, label: 'Performance', icon: Target },
    { id: 'documents' as Tab, label: 'Documents', icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
          <p className="text-surface-500 mt-1">View and manage your information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-lg font-bold text-surface-900 mt-4">{employee.name}</h2>
            <p className="text-surface-500 text-sm">{employee.designation}</p>
            <Badge variant="success" className="mt-2">{employee.status}</Badge>
          </div>

          <nav className="mt-6 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-surface-900">Personal Information</h3>
                {!isEditing ? (
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Full Name</label>
                  <p className="font-medium text-surface-900">{employee.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-surface-400" />
                    <p className="font-medium text-surface-900">{employee.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Phone</label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-surface-400" />
                      <p className="font-medium text-surface-900">{employee.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Address</label>
                  {isEditing ? (
                    <Input
                      value={editForm.address}
                      onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-surface-400" />
                      <p className="font-medium text-surface-900">{employee.address || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Department</label>
                  <p className="font-medium text-surface-900">{employee.department}</p>
                </div>
                <div>
                  <label className="block text-sm text-surface-500 mb-1">Join Date</label>
                  <p className="font-medium text-surface-900">{formatDate(employee.joinDate)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-200">
                <h4 className="font-semibold text-surface-900 mb-4">PTO Balance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary-600">{ptoBalance.accrued}</p>
                    <p className="text-sm text-surface-500">Accrued</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-amber-600">{ptoBalance.used}</p>
                    <p className="text-sm text-surface-500">Used</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-emerald-600">{ptoBalance.available}</p>
                    <p className="text-sm text-surface-500">Available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payslips' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-surface-900">My Payslips</h3>
              {payslips.length > 0 ? (
                <div className="space-y-3">
                  {payslips.map(payslip => (
                    <div key={payslip.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                      <div>
                        <p className="font-medium text-surface-900">
                          {MONTHS[payslip.month - 1]} {payslip.year}
                        </p>
                        <p className="text-sm text-surface-500">
                          Generated {new Date(payslip.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-emerald-600">
                          ${payslip.netPay.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 py-8 text-center">No payslips available</p>
              )}
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-surface-900">Leave History</h3>
                <Button variant="secondary" size="sm" onClick={() => window.location.href = '/leaves'}>
                  Apply for Leave
                </Button>
              </div>
              {leaves.length > 0 ? (
                <div className="space-y-3">
                  {leaves.map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                      <div>
                        <p className="font-medium text-surface-900 capitalize">{leave.type} Leave</p>
                        <p className="text-sm text-surface-500">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-sm text-surface-400 mt-1">{leave.reason}</p>
                      </div>
                      <Badge
                        variant={
                          leave.status === 'approved' ? 'success' :
                          leave.status === 'rejected' ? 'danger' : 'warning'
                        }
                      >
                        {leave.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 py-8 text-center">No leave requests found</p>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-surface-900">Performance Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 bg-surface-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-surface-900">{review.period}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={`text-lg ${star <= review.rating ? 'text-amber-400' : 'text-surface-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-surface-600">{review.feedback}</p>
                      <p className="text-sm text-surface-400 mt-2">
                        Reviewed on {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 py-8 text-center">No performance reviews yet</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-surface-900">My Documents</h3>
              <div className="space-y-3">
                {['Offer Letter', 'ID Proof', 'Address Proof', 'Contracts'].map(doc => (
                  <div key={doc} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-surface-400" />
                      <span className="font-medium text-surface-900">{doc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Uploaded</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
