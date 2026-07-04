import React from 'react'

/**
 * DashboardSkeleton component.
 * Renders a premium, animated skeleton placeholder for the dashboard layout
 * (including stats cards, meeting rows, and side panels).
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="w-16 h-4 bg-slate-200 rounded-lg" />
            </div>
            <div className="w-24 h-7 bg-slate-200 rounded-lg mb-2" />
            <div className="w-32 h-4 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Grid: Upcoming Meetings and AI Summary Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Meetings Skeleton (Left - 2 Cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="w-36 h-5 bg-slate-200 rounded-lg" />
            <div className="w-16 h-4 bg-slate-200 rounded-lg" />
          </div>

          <div className="divide-y divide-slate-50 p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex-1 space-y-2">
                  <div className="w-1/2 h-4 bg-slate-200 rounded-lg" />
                  <div className="flex gap-4">
                    <div className="w-24 h-3 bg-slate-100 rounded-lg" />
                    <div className="w-16 h-3 bg-slate-100 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-6 bg-slate-200 rounded-lg" />
                  <div className="w-14 h-7 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Card Skeleton (Right - 1 Col) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="h-1 w-full bg-slate-200" />
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="w-28 h-5 bg-slate-200 rounded-lg mb-2" />
              <div className="w-36 h-4 bg-slate-100 rounded-lg mb-6" />

              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-2 flex-shrink-0" />
                    <div className="w-full space-y-1.5">
                      <div className="w-11/12 h-3.5 bg-slate-100 rounded" />
                      {i === 1 && <div className="w-3/4 h-3.5 bg-slate-100 rounded" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-10 bg-slate-200 rounded-xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
