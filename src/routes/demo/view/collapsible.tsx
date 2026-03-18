import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MockPreview, MockTimeline, MockMediaBin, MockInspector, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/collapsible')({
  component: CollapsibleLayout,
})

function CollapsibleLayout() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Collapsible Sidebar" description="Final Cut Pro — toggle sidebars, maximize canvas" />

      {/* Top bar with sidebar toggles */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              leftOpen ? 'bg-teal-900/50 text-teal-400' : 'bg-gray-800 text-gray-500'
            }`}
          >
            ◧ Media
          </button>
        </div>
        <div className="flex items-center gap-1">
          {['Magnetic', 'Insert', 'Overwrite'].map((m, i) => (
            <button
              key={m}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                i === 0 ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            rightOpen ? 'bg-teal-900/50 text-teal-400' : 'bg-gray-800 text-gray-500'
          }`}
        >
          Inspector ◨
        </button>
      </div>

      {/* Main layout with collapsible panels */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <div
          className={`border-r border-gray-800 p-2 overflow-auto transition-all duration-200 ${
            leftOpen ? 'w-56' : 'w-0 p-0 border-0 overflow-hidden'
          }`}
        >
          {leftOpen && <MockMediaBin />}
        </div>

        {/* Center: Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3 min-h-0">
            <MockPreview label="Viewer" />
          </div>
        </div>

        {/* Right sidebar */}
        <div
          className={`border-l border-gray-800 p-2 overflow-auto transition-all duration-200 ${
            rightOpen ? 'w-56' : 'w-0 p-0 border-0 overflow-hidden'
          }`}
        >
          {rightOpen && <MockInspector />}
        </div>
      </div>

      {/* Timeline - full width, resizable area */}
      <div className="h-[180px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[10px] text-gray-500">Zoom:</span>
          <div className="w-24 h-1 bg-gray-700 rounded-full">
            <div className="h-1 bg-teal-600 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
        <MockTimeline tracks={4} />
      </div>
    </div>
  )
}
