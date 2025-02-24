import { useEffect, useState } from 'react';
import { Pipeline, PipelineStage, Opportunity } from '@/lib/api';
import { Installation } from '@/lib/firebase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface PipelineViewProps {
  installation: Installation;
  onOpportunityMove?: (opportunityId: string, fromStageId: string, toStageId: string) => void;
}

export default function PipelineView({ installation, onOpportunityMove }: PipelineViewProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPipelines();
  }, [installation]);

  useEffect(() => {
    if (selectedPipeline) {
      loadOpportunities(selectedPipeline.id);
    }
  }, [selectedPipeline]);

  const loadPipelines = async () => {
    try {
      const response = await fetch('/api/pipelines', {
        headers: {
          'locationId': installation.locationId,
          'companyId': installation.companyId
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load pipelines');
      }

      const data = await response.json();
      setPipelines(data);
      
      if (data.length > 0) {
        setSelectedPipeline(data[0]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOpportunities = async (pipelineId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pipelines/${pipelineId}/opportunities`, {
        headers: {
          'locationId': installation.locationId,
          'companyId': installation.companyId
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load opportunities');
      }

      const data = await response.json();
      setOpportunities(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !selectedPipeline) return;

    const opportunityId = result.draggableId;
    const fromStageId = result.source.droppableId;
    const toStageId = result.destination.droppableId;

    if (fromStageId === toStageId) return;

    try {
      // Optimistically update the UI
      const updatedOpportunities = opportunities.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, stageId: toStageId }
          : opp
      );
      setOpportunities(updatedOpportunities);

      // Notify parent component
      onOpportunityMove?.(opportunityId, fromStageId, toStageId);

      // Update in the backend
      await fetch(`/api/opportunities/${opportunityId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'locationId': installation.locationId,
          'companyId': installation.companyId
        },
        body: JSON.stringify({
          pipelineId: selectedPipeline.id,
          stageId: toStageId
        })
      });
    } catch (error) {
      // Revert on error
      loadOpportunities(selectedPipeline.id);
      setError('Failed to move opportunity');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Selector */}
      <div className="flex space-x-4">
        {pipelines.map(pipeline => (
          <button
            key={pipeline.id}
            onClick={() => setSelectedPipeline(pipeline)}
            className={`px-4 py-2 rounded-md ${
              selectedPipeline?.id === pipeline.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pipeline.name}
          </button>
        ))}
      </div>

      {/* Pipeline Board */}
      {selectedPipeline && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedPipeline.stages.map(stage => (
              <div key={stage.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">{stage.name}</h3>
                <Droppable droppableId={stage.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[200px]"
                    >
                      {opportunities
                        .filter(opp => opp.stageId === stage.id)
                        .map((opportunity, index) => (
                          <Draggable
                            key={opportunity.id}
                            draggableId={opportunity.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-4 rounded-md shadow-sm"
                              >
                                <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  ${opportunity.value.toLocaleString()}
                                </p>
                                {opportunity.contact && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    {opportunity.contact.name}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
} 