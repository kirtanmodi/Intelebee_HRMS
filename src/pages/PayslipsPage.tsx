import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { selectPayslips, generatePayslip, selectEmployeePayslips } from '../features/payslips/payslipsSlice';
import { selectAllEmployees } from '../features/employees/employeesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import { FileText, Download, Printer } from 'lucide-react';
import type { Payslip, Employee } from '../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function PayslipsPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentRole, currentUserId, canEdit } = useRoleAccess();
  
  const allPayslips = useAppSelector(selectPayslips);
  const employees = useAppSelector(selectAllEmployees);
  const myPayslips = useAppSelector(selectEmployeePayslips(currentUserId));
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const canViewAll = currentRole === 'admin' || currentRole === 'hr';
  const displayPayslips = canViewAll ? allPayslips : myPayslips;

  const handleGenerate = () => {
    if (!selectedEmployee) {
      showToast('Please select an employee', 'error');
      return;
    }
    
    const employee = employees.find((e: Employee) => e.id === selectedEmployee);
    if (!employee) return;
    
    const baseSalary = employee.designation.includes('CEO') ? 25000 :
                       employee.designation.includes('Manager') ? 12000 :
                       employee.designation.includes('Lead') ? 10000 :
                       employee.designation.includes('Senior') ? 9000 : 7000;
    
    const payslip: Payslip = {
      id: `pay-${selectedEmployee}-${selectedYear}-${selectedMonth}`,
      employeeId: selectedEmployee,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: baseSalary,
      allowances: Math.round(baseSalary * 0.3),
      deductions: Math.round(baseSalary * 0.15),
      netPay: Math.round(baseSalary + baseSalary * 0.3 - baseSalary * 0.15),
      generatedAt: new Date().toISOString(),
    };
    
    dispatch(generatePayslip(payslip));
    showToast('Payslip generated successfully', 'success');
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Payslip - ${viewingPayslip ? MONTHS[viewingPayslip.month - 1] : ''} ${viewingPayslip?.year}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
                .title { font-size: 18px; color: #666; margin-top: 10px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .info-item { padding: 10px; background: #f5f5f5; border-radius: 4px; }
                .info-label { font-size: 12px; color: #666; }
                .info-value { font-size: 16px; font-weight: bold; margin-top: 4px; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                .table th { background: #f0f0f0; }
                .table .amount { text-align: right; }
                .total { font-size: 20px; font-weight: bold; text-align: right; padding: 20px; background: #e8f4ff; border-radius: 4px; }
                .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e: Employee) => e.id === id);
    return emp?.name || 'Unknown';
  };

  const employeeOptions = [
    { value: '', label: 'Select Employee' },
    ...employees.map((emp: Employee) => ({ value: emp.id, label: emp.name }))
  ];

  const monthOptions = MONTHS.map((month, idx) => ({ value: String(idx + 1), label: month }));
  const yearOptions = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Payslips</h1>
          <p className="text-surface-500 mt-1">
            {canViewAll ? 'Generate and manage employee payslips' : 'View your payslips'}
          </p>
        </div>
      </div>

      {canViewAll && canEdit('payslips') && (
        <Card>
          <h3 className="font-semibold text-surface-900 mb-4">Generate Payslip</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              options={employeeOptions}
            />
            
            <Select
              value={String(selectedMonth)}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              options={monthOptions}
            />
            
            <Select
              value={String(selectedYear)}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              options={yearOptions}
            />
            
            <Button onClick={handleGenerate}>
              <FileText className="w-4 h-4" />
              Generate
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-surface-900 mb-4">Payslip History</h3>
        {displayPayslips.length > 0 ? (
          <div className="space-y-3">
            {displayPayslips.map(payslip => (
              <div key={payslip.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                <div>
                  {canViewAll && (
                    <p className="font-medium text-surface-900">{getEmployeeName(payslip.employeeId)}</p>
                  )}
                  <p className="text-sm text-surface-600">
                    {MONTHS[payslip.month - 1]} {payslip.year}
                  </p>
                  <p className="text-xs text-surface-400">
                    Generated {new Date(payslip.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-emerald-600">
                    ${payslip.netPay.toLocaleString()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setViewingPayslip(payslip)}
                  >
                    <Download className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-surface-500">No payslips found</p>
        )}
      </Card>

      {viewingPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Payslip Details</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setViewingPayslip(null)}>
                    Close
                  </Button>
                </div>
              </div>
              
              <div ref={printRef}>
                <div className="header text-center border-b-2 border-surface-300 pb-4 mb-6">
                  <div className="logo text-2xl font-bold text-primary-600">INTELEBEE LLC</div>
                  <div className="title text-surface-500 mt-2">
                    Payslip for {MONTHS[viewingPayslip.month - 1]} {viewingPayslip.year}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-surface-50 rounded-lg">
                    <p className="text-xs text-surface-500">Employee Name</p>
                    <p className="font-semibold">{getEmployeeName(viewingPayslip.employeeId)}</p>
                  </div>
                  <div className="p-3 bg-surface-50 rounded-lg">
                    <p className="text-xs text-surface-500">Employee ID</p>
                    <p className="font-semibold">{viewingPayslip.employeeId.toUpperCase()}</p>
                  </div>
                </div>
                
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-3 text-surface-600">Description</th>
                      <th className="text-right py-3 text-surface-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-surface-100">
                      <td className="py-3">Basic Salary</td>
                      <td className="text-right py-3">${viewingPayslip.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-surface-100">
                      <td className="py-3 text-emerald-600">Allowances (HRA, Travel, etc.)</td>
                      <td className="text-right py-3 text-emerald-600">+${viewingPayslip.allowances.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-surface-100">
                      <td className="py-3 text-red-600">Deductions (Tax, Insurance)</td>
                      <td className="text-right py-3 text-red-600">-${viewingPayslip.deductions.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="p-4 bg-primary-50 rounded-lg flex items-center justify-between">
                  <span className="text-lg font-semibold text-surface-900">Net Pay</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ${viewingPayslip.netPay.toLocaleString()}
                  </span>
                </div>
                
                <div className="footer mt-6 text-center text-surface-400 text-sm">
                  <p>This is a computer-generated document. No signature required.</p>
                  <p className="mt-1">Generated on {new Date(viewingPayslip.generatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
