import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import {
  selectAllPolicies,
  selectEmployeeAcknowledgements,
  acknowledgePolicy,
  addPolicy,
} from '../features/policies/policiesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, FileText, Check, Eye } from 'lucide-react';
import type { Policy, Acknowledgement } from '../types';
import { generateId, formatDate } from '../utils/dates';

const categories = [
  { value: 'HR', label: 'Human Resources' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'IT', label: 'IT & Security' },
  { value: 'Finance', label: 'Finance' },
];

export function PoliciesPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentUserId, hasPermission } = useRoleAccess();

  const policies = useAppSelector(selectAllPolicies);
  const myAcknowledgements = useAppSelector(selectEmployeeAcknowledgements(currentUserId));

  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    content: '',
    category: 'HR',
    version: '1.0',
  });

  const canEdit = hasPermission('edit_policies');

  const isAcknowledged = (policyId: string) => {
    return myAcknowledgements.some(a => a.policyId === policyId);
  };

  const handleAcknowledge = (policyId: string) => {
    const ack: Acknowledgement = {
      id: generateId(),
      policyId,
      employeeId: currentUserId,
      acknowledgedAt: new Date().toISOString().split('T')[0],
    };
    dispatch(acknowledgePolicy(ack));
    showToast('Policy acknowledged', 'success');
  };

  const handleAddPolicy = () => {
    if (!newPolicy.title || !newPolicy.content) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const policy: Policy = {
      id: generateId(),
      title: newPolicy.title,
      description: newPolicy.description,
      content: newPolicy.content,
      category: newPolicy.category,
      effectiveDate: new Date().toISOString().split('T')[0],
      version: newPolicy.version,
    };

    dispatch(addPolicy(policy));
    showToast('Policy added', 'success');
    setAddModalOpen(false);
    setNewPolicy({ title: '', description: '', content: '', category: 'HR', version: '1.0' });
  };

  const pendingCount = policies.filter(p => !isAcknowledged(p.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Policies</h2>
          <p className="text-surface-500 mt-1">Company policies and documents</p>
        </div>
        {canEdit && (
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-primary-600">{policies.length}</p>
          <p className="text-sm text-surface-500">Total Policies</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{myAcknowledgements.length}</p>
          <p className="text-sm text-surface-500">Acknowledged</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-surface-500">Pending</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map(policy => {
          const acknowledged = isAcknowledged(policy.id);
          return (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-surface-900">{policy.title}</h3>
                    <Badge variant={acknowledged ? 'success' : 'warning'} size="sm">
                      {acknowledged ? 'Acknowledged' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-500 mt-1 line-clamp-2">{policy.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-surface-400">
                    <span>{policy.category}</span>
                    <span>•</span>
                    <span>v{policy.version}</span>
                    <span>•</span>
                    <span>{formatDate(policy.effectiveDate)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setViewPolicy(policy)}>
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                {!acknowledged && (
                  <Button size="sm" className="flex-1" onClick={() => handleAcknowledge(policy.id)}>
                    <Check className="w-4 h-4" />
                    Acknowledge
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {policies.length === 0 && (
        <Card>
          <div className="text-center py-12 text-surface-500">
            No policies found
          </div>
        </Card>
      )}

      <Modal isOpen={!!viewPolicy} onClose={() => setViewPolicy(null)} title={viewPolicy?.title || ''} size="xl">
        {viewPolicy && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <Badge variant="info">{viewPolicy.category}</Badge>
              <span>Version {viewPolicy.version}</span>
              <span>•</span>
              <span>Effective: {formatDate(viewPolicy.effectiveDate)}</span>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-surface-700 bg-surface-50 p-4 rounded-lg">
                {viewPolicy.content}
              </pre>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setViewPolicy(null)}>Close</Button>
              {!isAcknowledged(viewPolicy.id) && (
                <Button onClick={() => { handleAcknowledge(viewPolicy.id); setViewPolicy(null); }}>
                  <Check className="w-4 h-4" />
                  Acknowledge Policy
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Policy" size="lg">
        <div className="space-y-4">
          <Input
            label="Policy Title"
            value={newPolicy.title}
            onChange={e => setNewPolicy({ ...newPolicy, title: e.target.value })}
            placeholder="Work From Home Policy"
          />
          <Input
            label="Description"
            value={newPolicy.description}
            onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
            placeholder="Brief description of the policy"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newPolicy.category}
              onChange={e => setNewPolicy({ ...newPolicy, category: e.target.value })}
              options={categories}
            />
            <Input
              label="Version"
              value={newPolicy.version}
              onChange={e => setNewPolicy({ ...newPolicy, version: e.target.value })}
              placeholder="1.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Policy Content</label>
            <textarea
              value={newPolicy.content}
              onChange={e => setNewPolicy({ ...newPolicy, content: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              rows={12}
              placeholder="# Policy Title&#10;&#10;## Section 1&#10;Policy content goes here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPolicy}>Add Policy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
