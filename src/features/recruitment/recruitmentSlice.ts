import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Job, Candidate, CandidateStage } from '../../types';
import type { RootState } from '../../store';

interface RecruitmentState {
  jobs: Job[];
  candidates: Candidate[];
}

const initialState: RecruitmentState = {
  jobs: [],
  candidates: [],
};

const recruitmentSlice = createSlice({
  name: 'recruitment',
  initialState,
  reducers: {
    setRecruitment(state, action: PayloadAction<RecruitmentState>) {
      state.jobs = action.payload.jobs;
      state.candidates = action.payload.candidates;
    },
    addJob(state, action: PayloadAction<Job>) {
      state.jobs.push(action.payload);
    },
    updateJob(state, action: PayloadAction<Job>) {
      const index = state.jobs.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
    deleteJob(state, action: PayloadAction<string>) {
      state.jobs = state.jobs.filter(j => j.id !== action.payload);
    },
    addCandidate(state, action: PayloadAction<Candidate>) {
      state.candidates.push(action.payload);
    },
    updateCandidate(state, action: PayloadAction<Candidate>) {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = action.payload;
      }
    },
    deleteCandidate(state, action: PayloadAction<string>) {
      state.candidates = state.candidates.filter(c => c.id !== action.payload);
    },
    moveCandidateStage(state, action: PayloadAction<{ id: string; stage: CandidateStage }>) {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.stage = action.payload.stage;
      }
    },
  },
});

export const {
  setRecruitment,
  addJob,
  updateJob,
  deleteJob,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  moveCandidateStage,
} = recruitmentSlice.actions;

export const selectAllJobs = (state: RootState) => state.recruitment.jobs;

export const selectOpenJobs = (state: RootState) =>
  state.recruitment.jobs.filter(j => j.status === 'open');

export const selectJobById = (id: string) => (state: RootState) =>
  state.recruitment.jobs.find(j => j.id === id);

export const selectAllCandidates = (state: RootState) => state.recruitment.candidates;

export const selectCandidatesByJob = (jobId: string) => (state: RootState) =>
  state.recruitment.candidates.filter(c => c.jobId === jobId);

export const selectCandidatesByStage = (stage: CandidateStage) => (state: RootState) =>
  state.recruitment.candidates.filter(c => c.stage === stage);

export const selectPipelineStats = (state: RootState) => {
  const candidates = state.recruitment.candidates;
  return {
    applied: candidates.filter(c => c.stage === 'applied').length,
    interview: candidates.filter(c => c.stage === 'interview').length,
    offer: candidates.filter(c => c.stage === 'offer').length,
    hired: candidates.filter(c => c.stage === 'hired').length,
    rejected: candidates.filter(c => c.stage === 'rejected').length,
  };
};

export default recruitmentSlice.reducer;
