import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import { selectAllEmployees, selectTeamMembers, addEmployee, updateEmployee, deleteEmployee } from '../features/employees/employeesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import type { Employee } from '../types';
import { generateId } from '../utils/dates';

const departments = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
];

const defaultEmployee: Partial<Employee> = {
  name: '',
  email: '',
  department: 'Engineering',
  designation: '',
  joinDate: new Date().toISOString().split('T')[0],
  status: 'active',
  phone: '',
  address: '',
};

export function EmployeesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentRole, currentUserId, isReadOnly } = useRoleAccess();

  const allEmployees = useAppSelector(selectAllEmployees);
  const teamMembers = useAppSelector(selectTeamMembers(currentUserId));

  const employees = currentRole === 'manager' ? teamMembers : allEmployees;

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!editingEmployee?.name || !editingEmployee?.email) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    if (editingEmployee.id) {
      dispatch(updateEmployee(editingEmployee as Employee));
      showToast('Employee updated successfully', 'success');
    } else {
      const newEmployee: Employee = {
        ...editingEmployee,
        id: generateId(),
        status: 'active',
      } as Employee;
      dispatch(addEmployee(newEmployee));
      showToast('Employee added successfully', 'success');
    }
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteEmployee(id));
    showToast('Employee removed', 'success');
    setDeleteConfirm(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (emp: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium">
            {emp.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-surface-900">{emp.name}</p>
            <p className="text-sm text-surface-500">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (emp: Employee) => (
        <div>
          <p className="text-surface-900">{emp.department}</p>
          <p className="text-sm text-surface-500">{emp.designation}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (emp: Employee) => (
        <Badge variant={emp.status === 'active' ? 'success' : 'default'}>
          {emp.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (emp: Employee) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/employees/${emp.id}`);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!isReadOnly('employees') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEmployee(emp);
                  setModalOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(emp.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Employees</h2>
          <p className="text-surface-500 mt-1">
            {currentRole === 'manager' ? 'Manage your team members' : 'Manage all employees'}
          </p>
        </div>
        {!isReadOnly('employees') && (
          <Button onClick={() => { setEditingEmployee(defaultEmployee); setModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        )}
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-surface-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={filteredEmployees}
          keyExtractor={emp => emp.id}
          onRowClick={emp => navigate(`/employees/${emp.id}`)}
          emptyMessage="No employees found"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
        title={editingEmployee?.id ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        {editingEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={editingEmployee.name || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Email *"
                type="email"
                value={editingEmployee.email || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                placeholder="john@intelebee.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Department"
                value={editingEmployee.department || 'Engineering'}
                onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                options={departments}
              />
              <Input
                label="Designation"
                value={editingEmployee.designation || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Join Date"
                type="date"
                value={editingEmployee.joinDate || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })}
              />
              <Input
                label="Phone"
                value={editingEmployee.phone || ''}
                onChange={e => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <Input
              label="Address"
              value={editingEmployee.address || ''}
              onChange={e => setEditingEmployee({ ...editingEmployee, address: e.target.value })}
              placeholder="City, State"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => { setModalOpen(false); setEditingEmployee(null); }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingEmployee.id ? 'Update' : 'Add'} Employee
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-surface-600 mb-6">
          Are you sure you want to remove this employee? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
