import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import { selectAllAttendance, updateAttendance } from '../features/attendance/attendanceSlice';
import { selectAllEmployees, selectTeamMembers } from '../features/employees/employeesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Select } from '../components/Select';
import { ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import type { AttendanceRecord, AttendanceStatus } from '../types';
import { getTodayString } from '../utils/dates';

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'wfh', label: 'Work From Home' },
  { value: 'absent', label: 'Absent' },
];

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  wfh: 'bg-blue-100 text-blue-700 border-blue-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
};

export function AttendancePage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentRole, currentUserId, isReadOnly } = useRoleAccess();

  const allAttendance = useAppSelector(selectAllAttendance);
  const allEmployees = useAppSelector(selectAllEmployees);
  const teamMembers = useAppSelector(selectTeamMembers(currentUserId));

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [editing, setEditing] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');

  const employees = useMemo(() => {
    if (currentRole === 'employee') {
      return allEmployees.filter(e => e.id === currentUserId);
    } else if (currentRole === 'manager') {
      return teamMembers;
    }
    return allEmployees;
  }, [currentRole, currentUserId, allEmployees, teamMembers]);

  const attendanceByDate = useMemo(() => {
    return allAttendance.filter(a => a.date === selectedDate);
  }, [allAttendance, selectedDate]);

  const getAttendance = (employeeId: string): AttendanceRecord | undefined => {
    return attendanceByDate.find(a => a.employeeId === employeeId);
  };

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditing(record.id);
    setEditStatus(record.status);
  };

  const handleSave = (record: AttendanceRecord) => {
    dispatch(updateAttendance({ ...record, status: editStatus }));
    showToast('Attendance updated', 'success');
    setEditing(null);
  };

  const stats = useMemo(() => {
    const present = attendanceByDate.filter(a => a.status === 'present').length;
    const wfh = attendanceByDate.filter(a => a.status === 'wfh').length;
    const absent = attendanceByDate.filter(a => a.status === 'absent').length;
    return { present, wfh, absent, total: employees.length };
  }, [attendanceByDate, employees.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Attendance</h2>
          <p className="text-surface-500 mt-1">
            {currentRole === 'employee' ? 'Your attendance record' : 
             currentRole === 'manager' ? 'Team attendance' : 'Company-wide attendance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.present}</p>
          <p className="text-sm text-surface-500">Present</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.wfh}</p>
          <p className="text-sm text-surface-500">Work From Home</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-surface-500">Absent</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-surface-700">{stats.total}</p>
          <p className="text-sm text-surface-500">Total Employees</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => handleDateChange(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button variant="ghost" size="sm" onClick={() => handleDateChange(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSelectedDate(getTodayString())}>
            Today
          </Button>
        </div>

        <div className="divide-y divide-surface-100">
          {employees.map(emp => {
            const attendance = getAttendance(emp.id);
            const isEditing = editing === attendance?.id;

            return (
              <div key={emp.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{emp.name}</p>
                    <p className="text-sm text-surface-500">{emp.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as AttendanceStatus)}
                        options={statusOptions}
                        className="w-40"
                      />
                      <Button variant="ghost" size="sm" onClick={() => attendance && handleSave(attendance)}>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {attendance ? (
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColors[attendance.status]}`}>
                          {attendance.status === 'wfh' ? 'WFH' : attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </span>
                      ) : (
                        <Badge variant="default">No Record</Badge>
                      )}
                      {!isReadOnly('attendance') && attendance && (
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(attendance)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {employees.length === 0 && (
          <div className="py-12 text-center text-surface-500">
            No employees to display
          </div>
        )}
      </Card>
    </div>
  );
}
