'use client';

import { useState } from 'react';
import { mockPipelines, mockOpportunities } from '@/lib/mockData';
import type { Opportunity } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd with no SSR
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

export default function Home() {
  const [selectedPipeline, setSelectedPipeline] = useState(mockPipelines[0]);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAuthClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the actual OAuth flow
      const response = await fetch('/api/auth');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.authorizationUrl) {
        // Redirect to GoHighLevel OAuth page
        window.location.href = data.authorizationUrl;
        return;
      }
      
      throw new Error('No authorization URL received');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedOpportunities = opportunities.map(opp => 
      opp.id === draggableId 
        ? { ...opp, stageId: destination.droppableId }
        : opp
    );

    setOpportunities(updatedOpportunities);
  };

  const renderDraggableContent = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    opportunity: Opportunity
  ) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-white p-4 rounded-md shadow-sm ${
        snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 ring-opacity-50' : ''
      }`}
    >
      <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
      <p className="text-sm text-gray-500 mt-1">
        ${opportunity.value.toLocaleString()}
      </p>
      {opportunity.contact && (
        <div className="mt-2 text-xs text-gray-500">
          <div>{opportunity.contact.name}</div>
          <div>{opportunity.contact.email}</div>
        </div>
      )}
    </div>
  );

  const renderDroppableContent = (
    provided: DroppableProvided,
    snapshot: DroppableStateSnapshot,
    stage: { id: string; name: string },
    opportunities: Opportunity[]
  ) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={`space-y-2 min-h-[200px] transition-colors duration-200 ${
        snapshot.isDraggingOver ? 'bg-blue-50' : ''
      }`}
    >
      {opportunities
        .filter(opp => opp.stageId === stage.id && opp.pipelineId === selectedPipeline.id)
        .map((opportunity: Opportunity, index: number) => (
          <Draggable
            key={opportunity.id}
            draggableId={opportunity.id}
            index={index}
            isDragDisabled={false}
          >
            {(provided, snapshot) => renderDraggableContent(provided, snapshot, opportunity)}
          </Draggable>
        ))}
      {provided.placeholder}
    </div>
  );

  // Show auth page if dashboard is not active
  if (!showDashboard) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              GoHighLevel Integration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              View your opportunities dashboard
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <button
              onClick={handleAuthClick}
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Loading...
                </div>
              ) : (
                'View Opportunities'
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Pipeline Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
              </div>
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Pipeline Dashboard</h1>
              <div className="mt-4 flex space-x-4">
                {mockPipelines.map(pipeline => (
                  <button
                    key={pipeline.id}
                    onClick={() => setSelectedPipeline(pipeline)}
                    className={`px-4 py-2 rounded-md ${
                      selectedPipeline.id === pipeline.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pipeline.name}
                  </button>
                ))}
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedPipeline.stages.map(stage => (
                  <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">{stage.name}</h3>
                    <Droppable
                      droppableId={stage.id}
                      type="opportunity"
                      isCombineEnabled={false}
                      direction="vertical"
                    >
                      {(provided, snapshot) => renderDroppableContent(provided, snapshot, stage, opportunities)}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>
    </main>
  );
}
