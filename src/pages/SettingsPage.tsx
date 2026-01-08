import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useToast } from '../hooks/useToast';
import { selectSettings, updatePTOAccrual } from '../features/settings/settingsSlice';
import { seedData } from '../data/seedData';
import { setEmployees } from '../features/employees/employeesSlice';
import { setAttendance } from '../features/attendance/attendanceSlice';
import { setLeaves } from '../features/leaves/leavesSlice';
import { setPerformance } from '../features/performance/performanceSlice';
import { setRecruitment } from '../features/recruitment/recruitmentSlice';
import { setPolicies } from '../features/policies/policiesSlice';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Building2, Clock, RefreshCw, Database, Shield, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/Modal';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const settings = useAppSelector(selectSettings);

  const [ptoAccrual, setPtoAccrual] = useState(settings.ptoMonthlyAccrual);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSavePTO = () => {
    if (ptoAccrual < 1 || ptoAccrual > 40) {
      showToast('PTO accrual must be between 1 and 40 hours', 'error');
      return;
    }
    dispatch(updatePTOAccrual(ptoAccrual));
    showToast('PTO accrual updated', 'success');
  };

  const handleResetData = () => {
    const fresh = seedData();
    dispatch(setEmployees(fresh.employees.list));
    dispatch(setAttendance(fresh.attendance.records));
    dispatch(setLeaves(fresh.leaves));
    dispatch(setPerformance(fresh.performance));
    dispatch(setRecruitment(fresh.recruitment));
    dispatch(setPolicies(fresh.policies));
    dispatch(updatePTOAccrual(fresh.settings.ptoMonthlyAccrual));
    setPtoAccrual(fresh.settings.ptoMonthlyAccrual);
    setResetModalOpen(false);
    showToast('Demo data reset successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900">Settings</h2>
        <p className="text-surface-500 mt-1">System configuration (Admin only)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader 
            title="Company Information" 
            description="Basic company details"
          />
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-surface-500">Company Name</p>
                <p className="text-lg font-semibold text-surface-900">{settings.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-surface-500">Current Mode</p>
                <p className="text-lg font-semibold text-surface-900">Demo Application</p>
              </div>
              <Badge variant="info" size="md" className="ml-auto">Mock Data</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader 
            title="PTO Configuration" 
            description="Paid Time Off accrual settings"
          />
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-surface-500">Monthly PTO Accrual (hours)</p>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="number"
                    value={ptoAccrual}
                    onChange={e => setPtoAccrual(parseInt(e.target.value) || 0)}
                    min={1}
                    max={40}
                    className="w-24"
                  />
                  <span className="text-sm text-surface-500">hours per month</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Current Setting:</strong> Employees accrue {settings.ptoMonthlyAccrual} hours of PTO per month.
                This equals {settings.ptoMonthlyAccrual * 12} hours ({Math.round(settings.ptoMonthlyAccrual * 12 / 8)} days) per year.
              </p>
            </div>
            <Button onClick={handleSavePTO} disabled={ptoAccrual === settings.ptoMonthlyAccrual}>
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader 
            title="Demo Data Management" 
            description="Reset application to initial demo state"
          />
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-800">Reset Demo Data</h4>
              <p className="text-sm text-amber-700 mt-1">
                This will reset all data to the initial demo state. All changes you've made will be lost.
                This is useful for demoing the application from a fresh state.
              </p>
              <Button 
                variant="danger" 
                className="mt-4"
                onClick={() => setResetModalOpen(true)}
              >
                <RefreshCw className="w-4 h-4" />
                Reset All Data
              </Button>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader 
            title="About This Application" 
            description="INTELEBEE HRMS Demo"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600">React 18</p>
              <p className="text-sm text-surface-500">Frontend Framework</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600">Redux Toolkit</p>
              <p className="text-sm text-surface-500">State Management</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600">Tailwind CSS</p>
              <p className="text-sm text-surface-500">Styling</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-surface-50 rounded-lg">
            <p className="text-sm text-surface-600">
              This is a frontend-only HRMS mock application built for demos and UX validation.
              All data is stored locally in your browser using localStorage.
              No backend server or API calls are made.
            </p>
          </div>
        </Card>
      </div>

      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Confirm Reset" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              This action will permanently delete all your changes and reset the application to its initial demo state.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleResetData}>
              <RefreshCw className="w-4 h-4" />
              Reset Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
