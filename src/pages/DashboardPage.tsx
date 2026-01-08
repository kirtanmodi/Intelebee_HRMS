import { useAppSelector } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { selectActiveEmployees, selectTeamMembers } from '../features/employees/employeesSlice';
import { selectAttendancePercentage } from '../features/attendance/attendanceSlice';
import { selectPendingRequests, selectUpcomingHolidays } from '../features/leaves/leavesSlice';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Users, CalendarCheck, Clock, CalendarDays, TrendingUp, Briefcase } from 'lucide-react';
import { formatDateShort } from '../utils/dates';

export function DashboardPage() {
  const { currentRole, currentUserId } = useRoleAccess();
  
  const allEmployees = useAppSelector(selectActiveEmployees);
  const teamMembers = useAppSelector(selectTeamMembers(currentUserId));
  const attendancePercentage = useAppSelector(selectAttendancePercentage);
  const pendingLeaves = useAppSelector(selectPendingRequests);
  const upcomingHolidays = useAppSelector(selectUpcomingHolidays(2));
  const openJobs = useAppSelector(state => state.recruitment.jobs.filter(j => j.status === 'open'));
  const goals = useAppSelector(state => state.performance.goals);

  const employeeCount = currentRole === 'employee' 
    ? 1 
    : currentRole === 'manager' 
      ? teamMembers.length 
      : allEmployees.length;

  const scopeLabel = currentRole === 'employee' 
    ? 'Your Profile' 
    : currentRole === 'manager' 
      ? 'Your Team' 
      : 'Company Wide';

  const pendingCount = currentRole === 'employee'
    ? pendingLeaves.filter(l => l.employeeId === currentUserId).length
    : pendingLeaves.length;

  const activeGoals = currentRole === 'employee'
    ? goals.filter(g => g.employeeId === currentUserId && g.status === 'in_progress').length
    : goals.filter(g => g.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Welcome back!</h2>
          <p className="text-surface-500 mt-1">Here's what's happening today • {scopeLabel}</p>
        </div>
        <Badge variant="info" size="md">{currentRole.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-100 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-surface-500">
                {currentRole === 'manager' ? 'Team Members' : 'Total Employees'}
              </span>
            </div>
            <p className="text-3xl font-bold text-surface-900">{employeeCount}</p>
            <p className="text-sm text-surface-500 mt-1">Active members</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-surface-500">Today's Attendance</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">{attendancePercentage}%</p>
            <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Present rate
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-surface-500">Pending Leaves</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">{pendingCount}</p>
            <p className="text-sm text-surface-500 mt-1">Awaiting approval</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-100 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-surface-500">Active Goals</span>
            </div>
            <p className="text-3xl font-bold text-surface-900">{activeGoals}</p>
            <p className="text-sm text-surface-500 mt-1">In progress</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Upcoming Holidays</h3>
            <CalendarDays className="w-5 h-5 text-surface-400" />
          </div>
          {upcomingHolidays.length > 0 ? (
            <div className="space-y-4">
              {upcomingHolidays.map(holiday => (
                <div key={holiday.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
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
                        {new Date(holiday.observed || holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        {holiday.observed && holiday.observed !== holiday.date && (
                          <span className="text-primary-600"> (Observed)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Holiday</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-center py-8">No upcoming holidays</p>
          )}
        </Card>

        {(currentRole === 'admin' || currentRole === 'hr') && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Open Positions</h3>
              <Briefcase className="w-5 h-5 text-surface-400" />
            </div>
            {openJobs.length > 0 ? (
              <div className="space-y-3">
                {openJobs.slice(0, 4).map(job => (
                  <div key={job.id} className="p-3 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors">
                    <p className="font-medium text-surface-900">{job.title}</p>
                    <p className="text-sm text-surface-500">{job.department}</p>
                    <p className="text-xs text-surface-400 mt-1">Posted {formatDateShort(job.postedDate)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No open positions</p>
            )}
          </Card>
        )}

        {currentRole === 'manager' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Team Overview</h3>
              <Users className="w-5 h-5 text-surface-400" />
            </div>
            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.slice(0, 5).map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 truncate">{member.name}</p>
                      <p className="text-xs text-surface-500">{member.designation}</p>
                    </div>
                    <Badge variant={member.status === 'active' ? 'success' : 'default'} size="sm">
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No team members</p>
            )}
          </Card>
        )}

        {currentRole === 'employee' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-surface-900">Your Goals</h3>
              <Target className="w-5 h-5 text-surface-400" />
            </div>
            {goals.filter(g => g.employeeId === currentUserId).length > 0 ? (
              <div className="space-y-4">
                {goals
                  .filter(g => g.employeeId === currentUserId)
                  .slice(0, 3)
                  .map(goal => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-surface-900 text-sm">{goal.title}</p>
                        <span className="text-xs text-surface-500">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-surface-500 text-center py-8">No goals assigned</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
