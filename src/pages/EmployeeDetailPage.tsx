import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppStore';
import { selectEmployeeById } from '../features/employees/employeesSlice';
import { selectEmployeeAttendance } from '../features/attendance/attendanceSlice';
import { selectEmployeeLeaves, selectPTOBalance } from '../features/leaves/leavesSlice';
import { selectEmployeeGoals, selectEmployeeReviews } from '../features/performance/performanceSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Target, FileText } from 'lucide-react';
import { formatDate } from '../utils/dates';
import { useState } from 'react';

type Tab = 'overview' | 'documents' | 'history';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const employee = useAppSelector(selectEmployeeById(id || ''));
  const attendance = useAppSelector(selectEmployeeAttendance(id || ''));
  const leaves = useAppSelector(selectEmployeeLeaves(id || ''));
  const ptoBalance = useAppSelector(selectPTOBalance(id || ''));
  const goals = useAppSelector(selectEmployeeGoals(id || ''));
  const reviews = useAppSelector(selectEmployeeReviews(id || ''));

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-500">Employee not found</p>
        <Button variant="secondary" onClick={() => navigate('/employees')} className="mt-4">
          Back to Employees
        </Button>
      </div>
    );
  }

  const recentAttendance = attendance.slice(0, 10);
  const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'wfh').length;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/employees')} className="mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Employees
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-xl font-bold text-surface-900 mt-4">{employee.name}</h2>
            <p className="text-surface-500">{employee.designation}</p>
            <Badge variant={employee.status === 'active' ? 'success' : 'default'} size="md" className="mt-2">
              {employee.status}
            </Badge>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-surface-600">
              <Mail className="w-5 h-5 text-surface-400" />
              <span className="text-sm">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-3 text-surface-600">
                <Phone className="w-5 h-5 text-surface-400" />
                <span className="text-sm">{employee.phone}</span>
              </div>
            )}
            {employee.address && (
              <div className="flex items-center gap-3 text-surface-600">
                <MapPin className="w-5 h-5 text-surface-400" />
                <span className="text-sm">{employee.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-surface-600">
              <Briefcase className="w-5 h-5 text-surface-400" />
              <span className="text-sm">{employee.department}</span>
            </div>
            <div className="flex items-center gap-3 text-surface-600">
              <Calendar className="w-5 h-5 text-surface-400" />
              <span className="text-sm">Joined {formatDate(employee.joinDate)}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-surface-200">
            <h4 className="font-medium text-surface-900 mb-3">PTO Balance</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-surface-50 rounded-lg">
                <p className="text-lg font-bold text-primary-600">{ptoBalance.accrued}</p>
                <p className="text-xs text-surface-500">Accrued</p>
              </div>
              <div className="p-2 bg-surface-50 rounded-lg">
                <p className="text-lg font-bold text-amber-600">{ptoBalance.used}</p>
                <p className="text-xs text-surface-500">Used</p>
              </div>
              <div className="p-2 bg-surface-50 rounded-lg">
                <p className="text-lg font-bold text-emerald-600">{ptoBalance.available}</p>
                <p className="text-xs text-surface-500">Available</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" padding="none">
          <div className="border-b border-surface-200">
            <nav className="flex gap-6 px-6">
              {(['overview', 'documents', 'history'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Active Goals
                  </h4>
                  {goals.length > 0 ? (
                    <div className="space-y-3">
                      {goals.map(goal => (
                        <div key={goal.id} className="p-4 bg-surface-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-surface-900">{goal.title}</p>
                            <Badge variant={goal.status === 'completed' ? 'success' : goal.status === 'overdue' ? 'danger' : 'info'}>
                              {goal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-surface-500 mt-2">Due: {formatDate(goal.dueDate)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-surface-500 py-4">No goals assigned</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-surface-900 mb-3">Recent Attendance</h4>
                  <div className="grid grid-cols-10 gap-1">
                    {recentAttendance.map(att => (
                      <div
                        key={att.id}
                        className={`h-8 rounded ${
                          att.status === 'present' ? 'bg-emerald-500' :
                          att.status === 'wfh' ? 'bg-blue-500' :
                          'bg-red-400'
                        }`}
                        title={`${att.date}: ${att.status}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-surface-500 mt-2">
                    Present: {presentDays} / {attendance.length} days
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {['Offer Letter', 'ID Proof', 'Address Proof', 'Contracts'].map(doc => (
                  <div key={doc} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-surface-400" />
                      <span className="font-medium text-surface-900">{doc}</span>
                    </div>
                    <Badge variant="success">Uploaded</Badge>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-medium text-surface-900">Performance Reviews</h4>
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="p-4 bg-surface-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-surface-900">{review.period}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={star <= review.rating ? 'text-amber-400' : 'text-surface-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-surface-600">{review.feedback}</p>
                      <p className="text-xs text-surface-400 mt-2">Reviewed on {formatDate(review.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-surface-500 py-4">No reviews yet</p>
                )}

                <h4 className="font-medium text-surface-900 mt-6">Leave History</h4>
                {leaves.length > 0 ? (
                  leaves.slice(0, 5).map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                      <div>
                        <p className="font-medium text-surface-900 capitalize">{leave.type} Leave</p>
                        <p className="text-sm text-surface-500">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          leave.status === 'approved' ? 'success' :
                          leave.status === 'rejected' ? 'danger' :
                          'warning'
                        }
                      >
                        {leave.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-surface-500 py-4">No leave history</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
