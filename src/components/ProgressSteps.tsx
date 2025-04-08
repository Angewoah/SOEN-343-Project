import React from 'react';

interface ProgressStepProps {
  currentStep: number;
  totalSteps: number;
  steps: {
    name: string;
    description: string;
  }[];
  showInitialNode?: boolean;
  showEndNode?: boolean;
}

export const ProgressSteps: React.FC<ProgressStepProps> = ({ 
  currentStep, 
  totalSteps, 
  steps,
  showInitialNode = true,
  showEndNode = true
}) => {
  // Calculate width based on number of elements
  const stepWidth = `${100 / ((showInitialNode ? 1 : 0) + steps.length + (showEndNode ? 1 : 0))}%`;
  
  return (
    <div className="py-4 px-6 bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto"> 
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center gap-0">
            
            {/* Initial node */}
            {showInitialNode && (
              <li className="relative flex flex-col items-center" style={{ width: stepWidth, maxWidth: '150px' }}>
                <div className="flex flex-col items-center w-full">
                  <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 z-10
                    ${currentStep > 0 ? 'border-purple-600 bg-purple-600' : 'border-gray-300 bg-white'}`}>
                    {currentStep > 0 ? (
                      <span className="text-white font-medium">✓</span>
                    ) : (
                      <span className="text-gray-500">1</span>
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <span className="text-sm font-medium text-gray-500">
                      Start
                    </span>
                    <p className="text-xs text-center text-gray-500">Begin event creation</p>
                  </div>
                </div>
                
                {/* Connector line */}
                <div className="hidden md:block absolute h-0.5 bg-purple-600 z-0" 
                     style={{ 
                       width: "50%", 
                       top: "1rem", 
                       left: "50%"
                     }} 
                />
              </li>
            )}

            {/* Existing steps */}
            {steps.map((step, index) => {
              const isCurrentStep = index === currentStep - 1;
              const isCompleted = index < currentStep - 1;
              const displayNumber = index + 2;
              
              return (
                <li key={step.name} className="relative flex flex-col items-center" style={{ width: stepWidth, maxWidth: '150px' }}>
                  <div className="flex flex-col items-center w-full">
                    <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 z-10
                      ${isCompleted ? 'border-purple-600 bg-purple-600' : 
                        isCurrentStep ? 'border-purple-600 bg-white shadow-md' : 
                        'border-gray-300 bg-white'}
                      ${isCurrentStep ? 'ring-2 ring-purple-200' : ''}`}>
                      {isCompleted ? (
                        <span className="text-white font-medium">✓</span>
                      ) : (
                        <span className={`${isCurrentStep ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                          {displayNumber}
                        </span>
                      )}
                    </div>
                    <div className={`mt-2 text-center px-1 ${isCurrentStep ? 'scale-105 transform' : ''}`}>
                      <span className={`text-sm font-medium ${isCurrentStep ? 'text-purple-600' : 
                        'text-gray-500'}`}>
                        {step.name}
                      </span>
                      <p className={`text-xs text-center ${isCurrentStep ? 'text-purple-500' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Left connector line */}
                  <div className={`hidden md:block absolute h-0.5 z-0 ${isCurrentStep ? 'bg-gradient-to-r from-purple-500 to-gray-200' : 
                      isCompleted ? 'bg-purple-500' : 'bg-gray-200'}`} 
                      style={{ 
                        width: "50%", 
                        top: "1rem",
                        left: "0"
                      }} 
                  />
                  
                  {/* Right connector line */}
                  {(index < steps.length - 1 || showEndNode) && (
                    <div className={`hidden md:block absolute h-0.5 z-0 ${isCompleted ? 'bg-purple-500' : 'bg-gray-200'}`} 
                        style={{ 
                          width: "50%", 
                          top: "1rem",
                          left: "50%"
                        }} 
                    />
                  )}
                </li>
              );
            })}
            
            {/* End node */}
            {showEndNode && (
              <li className="relative flex flex-col items-center" style={{ width: stepWidth, maxWidth: '150px' }}>
                <div className="flex flex-col items-center w-full">
                  <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border-2 z-10
                    ${currentStep > totalSteps ? 'border-purple-600 bg-purple-600' : 'border-gray-300 bg-white'}`}>
                    {currentStep > totalSteps ? (
                      <span className="text-white font-medium">✓</span>
                    ) : (
                      <span className="text-gray-500">4</span>
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <span className="text-sm font-medium text-gray-500">
                      Complete
                    </span>
                    <p className="text-xs text-center text-gray-500">Event is ready</p>
                  </div>
                </div>

                {/* Left connector line */}
                <div className={`hidden md:block absolute h-0.5 z-0 ${currentStep > totalSteps ? 'bg-purple-500' : 'bg-gray-200'}`} 
                    style={{ 
                      width: "50%", 
                      top: "1rem",
                      left: "0"
                    }} 
                />
              </li>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
};