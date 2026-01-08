import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { useToast } from '../hooks/useToast';
import {
  selectAllGoals,
  selectEmployeeGoals,
  selectAllReviews,
  selectEmployeeReviews,
  addGoal,
  updateGoal,
  addReview,
} from '../features/performance/performanceSlice';
import { selectAllEmployees, selectTeamMembers } from '../features/employees/employeesSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Target, Star, TrendingUp, Edit2 } from 'lucide-react';
import type { Goal, Review } from '../types';
import { generateId, formatDate } from '../utils/dates';

export function PerformancePage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { currentRole, currentUserId, hasPermission } = useRoleAccess();

  const allGoals = useAppSelector(selectAllGoals);
  const myGoals = useAppSelector(selectEmployeeGoals(currentUserId));
  const allReviews = useAppSelector(selectAllReviews);
  const myReviews = useAppSelector(selectEmployeeReviews(currentUserId));
  const allEmployees = useAppSelector(selectAllEmployees);
  const teamMembers = useAppSelector(selectTeamMembers(currentUserId));

  const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Partial<Goal> | null>(null);
  const [newReview, setNewReview] = useState({
    employeeId: '',
    period: 'H1 2026',
    rating: 3,
    feedback: '',
  });

  const displayGoals = currentRole === 'employee' ? myGoals : 
                       currentRole === 'manager' ? allGoals.filter(g => 
                         teamMembers.some(m => m.id === g.employeeId) || g.employeeId === currentUserId
                       ) : allGoals;

  const displayReviews = currentRole === 'employee' ? myReviews :
                         currentRole === 'manager' ? allReviews.filter(r =>
                           teamMembers.some(m => m.id === r.employeeId) || r.employeeId === currentUserId
                         ) : allReviews;

  const canEditGoals = hasPermission('edit_performance');
  const assignableEmployees = currentRole === 'manager' ? teamMembers :
                              currentRole === 'admin' || currentRole === 'hr' ? allEmployees : [];

  const handleSaveGoal = () => {
    if (!editingGoal?.title || !editingGoal?.employeeId || !editingGoal?.dueDate) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    if (editingGoal.id) {
      dispatch(updateGoal(editingGoal as Goal));
      showToast('Goal updated', 'success');
    } else {
      const goal: Goal = {
        id: generateId(),
        employeeId: editingGoal.employeeId,
        title: editingGoal.title,
        description: editingGoal.description || '',
        progress: editingGoal.progress || 0,
        dueDate: editingGoal.dueDate,
        status: 'in_progress',
        createdBy: currentUserId,
      };
      dispatch(addGoal(goal));
      showToast('Goal created', 'success');
    }
    setGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveReview = () => {
    if (!newReview.employeeId || !newReview.feedback) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const review: Review = {
      id: generateId(),
      employeeId: newReview.employeeId,
      reviewerId: currentUserId,
      period: newReview.period,
      rating: newReview.rating,
      feedback: newReview.feedback,
      createdAt: new Date().toISOString().split('T')[0],
    };

    dispatch(addReview(review));
    showToast('Review submitted', 'success');
    setReviewModalOpen(false);
    setNewReview({ employeeId: '', period: 'H1 2026', rating: 3, feedback: '' });
  };

  const getEmployeeName = (id: string) => allEmployees.find(e => e.id === id)?.name || 'Unknown';

  const updateProgress = (goal: Goal, progress: number) => {
    dispatch(updateGoal({ 
      ...goal, 
      progress,
      status: progress >= 100 ? 'completed' : goal.status 
    }));
    showToast('Progress updated', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Performance</h2>
          <p className="text-surface-500 mt-1">Goals and performance reviews</p>
        </div>
        {canEditGoals && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setReviewModalOpen(true)}>
              <Star className="w-4 h-4" />
              Add Review
            </Button>
            <Button onClick={() => { setEditingGoal({ progress: 0 }); setGoalModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Create Goal
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="p-2 bg-primary-100 rounded-lg w-fit mx-auto mb-2">
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-primary-600">
            {displayGoals.filter(g => g.status === 'in_progress').length}
          </p>
          <p className="text-sm text-surface-500">Active Goals</p>
        </Card>
        <Card className="text-center">
          <div className="p-2 bg-emerald-100 rounded-lg w-fit mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {displayGoals.filter(g => g.status === 'completed').length}
          </p>
          <p className="text-sm text-surface-500">Completed</p>
        </Card>
        <Card className="text-center">
          <div className="p-2 bg-amber-100 rounded-lg w-fit mx-auto mb-2">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{displayReviews.length}</p>
          <p className="text-sm text-surface-500">Reviews</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="border-b border-surface-200">
          <nav className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'goals' ? 'bg-primary-100 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reviews' ? 'bg-primary-100 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {activeTab === 'goals' ? (
          <div className="divide-y divide-surface-100">
            {displayGoals.length > 0 ? displayGoals.map(goal => (
              <div key={goal.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-surface-900">{goal.title}</p>
                      <Badge variant={
                        goal.status === 'completed' ? 'success' :
                        goal.status === 'overdue' ? 'danger' : 'info'
                      }>
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {currentRole !== 'employee' && (
                      <p className="text-sm text-primary-600 font-medium">{getEmployeeName(goal.employeeId)}</p>
                    )}
                    <p className="text-sm text-surface-500 mt-1">{goal.description}</p>
                    <p className="text-xs text-surface-400 mt-1">Due: {formatDate(goal.dueDate)}</p>
                  </div>
                  {canEditGoals && (
                    <Button variant="ghost" size="sm" onClick={() => { setEditingGoal(goal); setGoalModalOpen(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.progress >= 100 ? 'bg-emerald-500' :
                        goal.progress >= 50 ? 'bg-primary-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-surface-700 w-12">{goal.progress}%</span>
                  {canEditGoals && goal.status !== 'completed' && (
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(p => (
                        <button
                          key={p}
                          onClick={() => updateProgress(goal, p)}
                          className={`px-2 py-1 text-xs rounded ${
                            goal.progress >= p ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-500'
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-surface-500">No goals found</div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {displayReviews.length > 0 ? displayReviews.map(review => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-surface-900">{review.period}</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {currentRole !== 'employee' && (
                      <p className="text-sm text-primary-600 font-medium">{getEmployeeName(review.employeeId)}</p>
                    )}
                    <p className="text-sm text-surface-600 mt-2">{review.feedback}</p>
                    <p className="text-xs text-surface-400 mt-2">
                      Reviewed by {getEmployeeName(review.reviewerId)} on {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-surface-500">No reviews found</div>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={goalModalOpen} onClose={() => { setGoalModalOpen(false); setEditingGoal(null); }} title={editingGoal?.id ? 'Edit Goal' : 'Create Goal'} size="md">
        {editingGoal && (
          <div className="space-y-4">
            <Select
              label="Employee"
              value={editingGoal.employeeId || ''}
              onChange={e => setEditingGoal({ ...editingGoal, employeeId: e.target.value })}
              options={[{ value: '', label: 'Select employee' }, ...assignableEmployees.map(e => ({ value: e.id, label: e.name }))]}
            />
            <Input
              label="Goal Title"
              value={editingGoal.title || ''}
              onChange={e => setEditingGoal({ ...editingGoal, title: e.target.value })}
              placeholder="Complete API refactoring"
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
              <textarea
                value={editingGoal.description || ''}
                onChange={e => setEditingGoal({ ...editingGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={editingGoal.dueDate || ''}
                onChange={e => setEditingGoal({ ...editingGoal, dueDate: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Progress: {editingGoal.progress || 0}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingGoal.progress || 0}
                  onChange={e => setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => { setGoalModalOpen(false); setEditingGoal(null); }}>Cancel</Button>
              <Button onClick={handleSaveGoal}>{editingGoal.id ? 'Update' : 'Create'} Goal</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Add Performance Review" size="md">
        <div className="space-y-4">
          <Select
            label="Employee"
            value={newReview.employeeId}
            onChange={e => setNewReview({ ...newReview, employeeId: e.target.value })}
            options={[{ value: '', label: 'Select employee' }, ...assignableEmployees.map(e => ({ value: e.id, label: e.name }))]}
          />
          <Input
            label="Review Period"
            value={newReview.period}
            onChange={e => setNewReview({ ...newReview, period: e.target.value })}
            placeholder="H1 2026"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="p-2"
                >
                  <Star
                    className={`w-8 h-8 ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Feedback</label>
            <textarea
              value={newReview.feedback}
              onChange={e => setNewReview({ ...newReview, feedback: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Provide detailed feedback..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReview}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
