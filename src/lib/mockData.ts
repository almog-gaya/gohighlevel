import { Opportunity, Pipeline, PipelineStage } from './api';

export const mockPipelines: Pipeline[] = [
  {
    id: 'pipeline-1',
    name: 'Sales Pipeline',
    stages: [
      { id: 'stage-1', name: 'New Lead', order: 1 },
      { id: 'stage-2', name: 'Contact Made', order: 2 },
      { id: 'stage-3', name: 'Proposal Sent', order: 3 },
      { id: 'stage-4', name: 'Negotiation', order: 4 },
      { id: 'stage-5', name: 'Closed Won', order: 5 }
    ]
  },
  {
    id: 'pipeline-2',
    name: 'Customer Success',
    stages: [
      { id: 'stage-6', name: 'Onboarding', order: 1 },
      { id: 'stage-7', name: 'In Progress', order: 2 },
      { id: 'stage-8', name: 'Review', order: 3 },
      { id: 'stage-9', name: 'Complete', order: 4 }
    ]
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Enterprise Deal - Acme Corp',
    value: 50000,
    pipelineId: 'pipeline-1',
    stageId: 'stage-1',
    status: 'active',
    contact: {
      id: 'contact-1',
      name: 'John Smith',
      email: 'john@acme.com'
    },
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'opp-2',
    title: 'SMB Package - TechStart',
    value: 15000,
    pipelineId: 'pipeline-1',
    stageId: 'stage-2',
    status: 'active',
    contact: {
      id: 'contact-2',
      name: 'Sarah Johnson',
      email: 'sarah@techstart.io'
    },
    createdAt: '2024-02-19T15:30:00Z',
    updatedAt: '2024-02-20T09:15:00Z'
  },
  {
    id: 'opp-3',
    title: 'Consulting Project - BigCo',
    value: 75000,
    pipelineId: 'pipeline-1',
    stageId: 'stage-3',
    status: 'active',
    contact: {
      id: 'contact-3',
      name: 'Mike Wilson',
      email: 'mike@bigco.com'
    },
    createdAt: '2024-02-18T08:45:00Z',
    updatedAt: '2024-02-20T11:30:00Z'
  },
  {
    id: 'opp-4',
    title: 'Training Program - EduTech',
    value: 25000,
    pipelineId: 'pipeline-2',
    stageId: 'stage-6',
    status: 'active',
    contact: {
      id: 'contact-4',
      name: 'Lisa Brown',
      email: 'lisa@edutech.org'
    },
    createdAt: '2024-02-17T14:20:00Z',
    updatedAt: '2024-02-20T13:45:00Z'
  }
]; 