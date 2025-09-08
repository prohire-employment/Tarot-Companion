import React from 'react';

const ShimmerBar: React.FC<{className?: string}> = ({ className }) => (
    <div className={`relative bg-surface/70 overflow-hidden rounded-md ${className}`}>
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent animate-shimmer-fast" style={{ backgroundSize: '200% 100%' }} />
    </div>
);

const JournalEntrySkeleton: React.FC = () => {
    return (
        <article className="bg-surface rounded-card shadow-main p-6 card-border">
            <header className="border-b border-border pb-3 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <ShimmerBar className="h-7 w-48 mb-2" />
                        <ShimmerBar className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <ShimmerBar className="h-7 w-12 rounded-md" />
                        <ShimmerBar className="h-7 w-16 rounded-md" />
                    </div>
                </div>
                 <ShimmerBar className="h-5 w-3/4 mt-3" />
            </header>

            <div className="space-y-6">
                <div>
                    <ShimmerBar className="h-6 w-40 mb-3" />
                    <div className="space-y-2 pl-4">
                         <ShimmerBar className="h-4 w-full" />
                         <ShimmerBar className="h-4 w-5/6" />
                    </div>
                </div>

                <div>
                    <ShimmerBar className="h-6 w-32 mb-3" />
                    <div className="space-y-2 pl-4">
                         <ShimmerBar className="h-4 w-full" />
                         <ShimmerBar className="h-4 w-3/4" />
                    </div>
                </div>

                <div>
                     <ShimmerBar className="h-6 w-20 mb-3" />
                     <div className="flex flex-wrap gap-2">
                        <ShimmerBar className="h-6 w-16 rounded-full" />
                        <ShimmerBar className="h-6 w-24 rounded-full" />
                        <ShimmerBar className="h-6 w-20 rounded-full" />
                     </div>
                </div>
            </div>
        </article>
    );
};

export default JournalEntrySkeleton;
