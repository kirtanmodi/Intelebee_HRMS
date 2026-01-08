import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { useToast } from '../hooks/useToast';
import {
  selectAllJobs,
  selectAllCandidates,
  selectPipelineStats,
  addJob,
  updateJob,
  addCandidate,
  moveCandidateStage,
} from '../features/recruitment/recruitmentSlice';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Briefcase, Users, ChevronRight, User, FileText, Printer, ClipboardList } from 'lucide-react';
import type { Job, Candidate, CandidateStage } from '../types';
import { generateId, formatDate } from '../utils/dates';

const defaultOnboardingChecklist = [
  { id: 'doc-collection', label: 'Collect required documents', completed: false },
  { id: 'background-check', label: 'Complete background check', completed: false },
  { id: 'equipment', label: 'Setup laptop and equipment', completed: false },
  { id: 'accounts', label: 'Create email and system accounts', completed: false },
  { id: 'orientation', label: 'Schedule orientation session', completed: false },
  { id: 'team-intro', label: 'Team introduction meeting', completed: false },
  { id: 'policies', label: 'Review company policies', completed: false },
  { id: 'training', label: 'Complete onboarding training', completed: false },
];

const stages: { key: CandidateStage; label: string; color: string }[] = [
  { key: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { key: 'interview', label: 'Interview', color: 'bg-amber-100 text-amber-700' },
  { key: 'offer', label: 'Offer', color: 'bg-purple-100 text-purple-700' },
  { key: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const departments = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
];

export function RecruitmentPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const jobs = useAppSelector(selectAllJobs);
  const candidates = useAppSelector(selectAllCandidates);
  const pipelineStats = useAppSelector(selectPipelineStats);

  const [activeTab, setActiveTab] = useState<'jobs' | 'pipeline' | 'onboarding'>('jobs');
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [offerLetterModalOpen, setOfferLetterModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [onboardingChecklists, setOnboardingChecklists] = useState<Record<string, typeof defaultOnboardingChecklist>>({});
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    description: '',
    requirements: '',
  });
  const [newCandidate, setNewCandidate] = useState({
    jobId: '',
    name: '',
    email: '',
    phone: '',
  });
  const [offerDetails, setOfferDetails] = useState({
    salary: '',
    startDate: '',
    benefits: 'Health Insurance, 401k, PTO',
  });
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleAddJob = () => {
    if (!newJob.title || !newJob.description) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const job: Job = {
      id: generateId(),
      title: newJob.title,
      department: newJob.department,
      description: newJob.description,
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      status: 'open',
      postedDate: new Date().toISOString().split('T')[0],
    };

    dispatch(addJob(job));
    showToast('Job posted successfully', 'success');
    setJobModalOpen(false);
    setNewJob({ title: '', department: 'Engineering', description: '', requirements: '' });
  };

  const handleAddCandidate = () => {
    if (!newCandidate.jobId || !newCandidate.name || !newCandidate.email) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const candidate: Candidate = {
      id: generateId(),
      jobId: newCandidate.jobId,
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      stage: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    dispatch(addCandidate(candidate));
    showToast('Candidate added', 'success');
    setCandidateModalOpen(false);
    setNewCandidate({ jobId: '', name: '', email: '', phone: '' });
  };

  const handleMoveStage = (candidateId: string, newStage: CandidateStage) => {
    dispatch(moveCandidateStage({ id: candidateId, stage: newStage }));
    showToast(`Candidate moved to ${newStage}`, 'success');
  };

  const handleToggleJobStatus = (job: Job) => {
    dispatch(updateJob({ ...job, status: job.status === 'open' ? 'closed' : 'open' }));
    showToast(`Job ${job.status === 'open' ? 'closed' : 'reopened'}`, 'success');
  };

  const getCandidatesByStage = (stage: CandidateStage) =>
    candidates.filter(c => c.stage === stage);

  const getNextStages = (current: CandidateStage): CandidateStage[] => {
    const order: CandidateStage[] = ['applied', 'interview', 'offer', 'hired'];
    const currentIndex = order.indexOf(current);
    if (current === 'rejected') return order;
    return [...order.slice(currentIndex + 1), 'rejected'];
  };

  const handleGenerateOffer = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setOfferLetterModalOpen(true);
  };

  const handlePrintOffer = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Offer Letter - ${selectedCandidate?.name}</title>
              <style>
                body { font-family: Georgia, serif; padding: 60px; max-width: 800px; margin: 0 auto; line-height: 1.8; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .logo { font-size: 28px; font-weight: bold; color: #0066cc; }
                .date { text-align: right; margin-bottom: 30px; }
                h2 { text-align: center; }
                .signature { margin-top: 60px; }
                .signature-line { border-top: 1px solid #333; width: 200px; margin-top: 60px; }
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

  const toggleOnboardingItem = (candidateId: string, itemId: string) => {
    setOnboardingChecklists(prev => {
      const current = prev[candidateId] || [...defaultOnboardingChecklist];
      return {
        ...prev,
        [candidateId]: current.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      };
    });
  };

  const getOnboardingProgress = (candidateId: string) => {
    const checklist = onboardingChecklists[candidateId] || defaultOnboardingChecklist;
    const completed = checklist.filter(item => item.completed).length;
    return { completed, total: checklist.length, percentage: Math.round((completed / checklist.length) * 100) };
  };

  const hiredCandidates = getCandidatesByStage('hired');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900">Recruitment</h2>
          <p className="text-surface-500 mt-1">Manage job postings and candidates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCandidateModalOpen(true)}>
            <User className="w-4 h-4" />
            Add Candidate
          </Button>
          <Button onClick={() => setJobModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Post Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map(stage => (
          <Card key={stage.key} className="text-center">
            <p className="text-2xl font-bold text-surface-900">{pipelineStats[stage.key]}</p>
            <p className="text-sm text-surface-500">{stage.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="none">
        <div className="border-b border-surface-200">
          <nav className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'jobs' ? 'bg-primary-100 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pipeline' ? 'bg-primary-100 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              Candidate Pipeline
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'onboarding' ? 'bg-primary-100 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              Onboarding
              {hiredCandidates.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                  {hiredCandidates.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {activeTab === 'jobs' ? (
          <div className="divide-y divide-surface-100">
            {jobs.length > 0 ? jobs.map(job => (
              <div
                key={job.id}
                className="p-6 hover:bg-surface-50 cursor-pointer transition-colors"
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <Briefcase className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900">{job.title}</h3>
                        <Badge variant={job.status === 'open' ? 'success' : 'default'}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-500">{job.department}</p>
                      <p className="text-xs text-surface-400 mt-1">Posted {formatDate(job.postedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-surface-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{candidates.filter(c => c.jobId === job.id).length}</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleToggleJobStatus(job); }}>
                      {job.status === 'open' ? 'Close' : 'Reopen'}
                    </Button>
                  </div>
                </div>

                {selectedJob?.id === job.id && (
                  <div className="mt-4 pt-4 border-t border-surface-200">
                    <p className="text-sm text-surface-600 mb-3">{job.description}</p>
                    <div>
                      <p className="text-sm font-medium text-surface-700 mb-2">Requirements:</p>
                      <ul className="list-disc list-inside text-sm text-surface-600 space-y-1">
                        {job.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="py-12 text-center text-surface-500">No job postings</div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {stages.filter(s => s.key !== 'rejected').map(stage => (
                <div key={stage.key}>
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center mb-4 ${stage.color}`}>
                    {stage.label} ({getCandidatesByStage(stage.key).length})
                  </div>
                  <div className="space-y-3">
                    {getCandidatesByStage(stage.key).map(candidate => {
                      const job = jobs.find(j => j.id === candidate.jobId);
                      return (
                        <div key={candidate.id} className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                          <p className="font-medium text-surface-900 text-sm">{candidate.name}</p>
                          <p className="text-xs text-surface-500">{job?.title}</p>
                          <p className="text-xs text-surface-400 mt-1">{candidate.email}</p>
                          {candidate.notes && (
                            <p className="text-xs text-surface-600 mt-2 italic">{candidate.notes}</p>
                          )}
                          {stage.key === 'offer' && (
                            <button
                              onClick={() => handleGenerateOffer(candidate)}
                              className="mt-2 text-xs px-2 py-1 rounded flex items-center gap-1 bg-purple-50 text-purple-600 hover:bg-purple-100 w-full justify-center"
                            >
                              <FileText className="w-3 h-3" />
                              Generate Offer Letter
                            </button>
                          )}
                          {stage.key !== 'hired' && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {getNextStages(stage.key).map(nextStage => (
                                <button
                                  key={nextStage}
                                  onClick={() => handleMoveStage(candidate.id, nextStage)}
                                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                    nextStage === 'rejected' 
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                  }`}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                  {nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {getCandidatesByStage('rejected').length > 0 && (
              <div className="mt-6 pt-6 border-t border-surface-200">
                <p className="text-sm font-medium text-surface-700 mb-3">Rejected Candidates</p>
                <div className="flex flex-wrap gap-3">
                  {getCandidatesByStage('rejected').map(candidate => (
                    <div key={candidate.id} className="px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-700">{candidate.name}</p>
                      <p className="text-xs text-red-500">{jobs.find(j => j.id === candidate.jobId)?.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'onboarding' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-surface-900">New Hire Onboarding</h3>
            </div>
            
            {hiredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hiredCandidates.map(candidate => {
                  const job = jobs.find(j => j.id === candidate.jobId);
                  const progress = getOnboardingProgress(candidate.id);
                  const checklist = onboardingChecklists[candidate.id] || defaultOnboardingChecklist;
                  
                  return (
                    <div key={candidate.id} className="border border-surface-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-surface-900">{candidate.name}</p>
                          <p className="text-sm text-surface-500">{job?.title}</p>
                        </div>
                        <Badge variant={progress.percentage === 100 ? 'success' : 'warning'}>
                          {progress.percentage}% Complete
                        </Badge>
                      </div>
                      
                      <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-4">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        {checklist.map(item => (
                          <label 
                            key={item.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleOnboardingItem(candidate.id, item.id)}
                              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className={`text-sm ${item.completed ? 'text-surface-400 line-through' : 'text-surface-700'}`}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-surface-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-surface-300" />
                <p>No hired candidates to onboard</p>
                <p className="text-sm mt-1">Move candidates to "Hired" stage to start onboarding</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={jobModalOpen} onClose={() => setJobModalOpen(false)} title="Post New Job" size="lg">
        <div className="space-y-4">
          <Input
            label="Job Title"
            value={newJob.title}
            onChange={e => setNewJob({ ...newJob, title: e.target.value })}
            placeholder="Senior React Developer"
          />
          <Select
            label="Department"
            value={newJob.department}
            onChange={e => setNewJob({ ...newJob, department: e.target.value })}
            options={departments}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
            <textarea
              value={newJob.description}
              onChange={e => setNewJob({ ...newJob, description: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="We are looking for..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Requirements (one per line)</label>
            <textarea
              value={newJob.requirements}
              onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="5+ years experience&#10;TypeScript proficiency&#10;..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setJobModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddJob}>Post Job</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={candidateModalOpen} onClose={() => setCandidateModalOpen(false)} title="Add Candidate" size="md">
        <div className="space-y-4">
          <Select
            label="Job Position"
            value={newCandidate.jobId}
            onChange={e => setNewCandidate({ ...newCandidate, jobId: e.target.value })}
            options={[{ value: '', label: 'Select job' }, ...jobs.filter(j => j.status === 'open').map(j => ({ value: j.id, label: j.title }))]}
          />
          <Input
            label="Full Name"
            value={newCandidate.name}
            onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={newCandidate.email}
            onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            value={newCandidate.phone}
            onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setCandidateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCandidate}>Add Candidate</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={offerLetterModalOpen} onClose={() => setOfferLetterModalOpen(false)} title="Generate Offer Letter" size="lg">
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Annual Salary"
                value={offerDetails.salary}
                onChange={e => setOfferDetails({ ...offerDetails, salary: e.target.value })}
                placeholder="$80,000"
              />
              <Input
                label="Start Date"
                type="date"
                value={offerDetails.startDate}
                onChange={e => setOfferDetails({ ...offerDetails, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Benefits</label>
              <textarea
                value={offerDetails.benefits}
                onChange={e => setOfferDetails({ ...offerDetails, benefits: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
            
            <div className="border-t border-surface-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-surface-900">Preview</h4>
                <Button variant="secondary" size="sm" onClick={handlePrintOffer}>
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </Button>
              </div>
              
              <div ref={printRef} className="p-6 bg-surface-50 rounded-lg text-sm border border-surface-200">
                <div className="text-center mb-8 border-b pb-4">
                  <p className="text-2xl font-bold text-primary-600">INTELEBEE LLC</p>
                  <p className="text-surface-500">San Francisco, CA</p>
                </div>
                
                <p className="text-right mb-6">{new Date().toLocaleDateString()}</p>
                
                <p className="mb-4">Dear {selectedCandidate.name},</p>
                
                <p className="mb-4">
                  We are pleased to extend an offer of employment for the position of{' '}
                  <strong>{jobs.find(j => j.id === selectedCandidate.jobId)?.title}</strong> at INTELEBEE LLC.
                </p>
                
                <p className="mb-4">
                  <strong>Compensation:</strong> Your annual salary will be {offerDetails.salary || '[SALARY]'}, 
                  paid on a bi-weekly basis.
                </p>
                
                <p className="mb-4">
                  <strong>Start Date:</strong> {offerDetails.startDate ? new Date(offerDetails.startDate).toLocaleDateString() : '[START DATE]'}
                </p>
                
                <p className="mb-4">
                  <strong>Benefits:</strong> {offerDetails.benefits}
                </p>
                
                <p className="mb-4">
                  This offer is contingent upon successful completion of background verification and 
                  submission of required documents.
                </p>
                
                <p className="mb-8">
                  We are excited about the possibility of you joining our team and look forward to 
                  your positive response.
                </p>
                
                <p>Sincerely,</p>
                <div className="mt-12 border-t border-surface-400 w-48 pt-2">
                  <p className="font-medium">HR Department</p>
                  <p className="text-surface-500">INTELEBEE LLC</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setOfferLetterModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
