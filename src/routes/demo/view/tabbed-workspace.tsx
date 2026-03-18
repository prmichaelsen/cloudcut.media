import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MockPreview, MockTimeline, MockMediaBin, MockInspector, MockTabs, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/tabbed-workspace')({
  component: TabbedWorkspaceLayout,
})

const workspaces = ['Edit', 'Color', 'Audio', 'Effects', 'Export']

function TabbedWorkspaceLayout() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Tabbed Workspace" description="Resolve Pages — switch between Edit, Color, Audio" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <div className="flex items-center">
          {workspaces.map((ws, i) => (
            <button
              key={ws}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                i === activeTab
                  ? 'text-teal-400 bg-gray-800 rounded'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {ws}
            </button>
          ))}
        </div>
        <div />
      </div>

      {/* Workspace content changes per tab */}
      {activeTab === 0 && <EditWorkspace />}
      {activeTab === 1 && <ColorWorkspace />}
      {activeTab === 2 && <AudioWorkspace />}
      {activeTab === 3 && <EffectsWorkspace />}
      {activeTab === 4 && <ExportWorkspace />}
    </div>
  )
}

function EditWorkspace() {
  return (
    <>
      <div className="flex-1 flex min-h-0">
        <div className="w-56 border-r border-gray-800 p-2 overflow-auto hidden md:block">
          <MockMediaBin />
        </div>
        <div className="flex-1 p-2 min-h-0">
          <MockPreview label="Edit" />
        </div>
        <div className="w-56 border-l border-gray-800 p-2 overflow-auto hidden md:block">
          <MockInspector />
        </div>
      </div>
      <div className="h-[160px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={4} />
      </div>
    </>
  )
}

function ColorWorkspace() {
  return (
    <>
      <div className="flex-1 flex min-h-0">
        {/* Scopes */}
        <div className="w-64 border-r border-gray-800 p-3 hidden md:block">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Scopes</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Waveform', 'Vectorscope', 'Histogram', 'Parade'].map((s) => (
              <div key={s} className="aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                <span className="text-[9px] text-gray-500">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 p-3 min-h-0">
          <MockPreview label="Color" />
        </div>

        {/* Color wheels */}
        <div className="w-72 border-l border-gray-800 p-3 hidden md:block">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Color Wheels</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {['Lift', 'Gamma', 'Gain'].map((w) => (
              <div key={w} className="text-center">
                <div className="aspect-square bg-gray-800 rounded-full border border-gray-700 mx-auto" />
                <span className="text-[9px] text-gray-500 mt-1 block">{w}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {['Temperature', 'Tint', 'Contrast', 'Saturation'].map((s) => (
              <div key={s} className="space-y-0.5">
                <span className="text-[10px] text-gray-400">{s}</span>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-teal-600 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[120px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={1} />
      </div>
    </>
  )
}

function AudioWorkspace() {
  return (
    <>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-3 min-h-0">
          <MockPreview label="Audio Mixer" />
        </div>
        {/* Meters */}
        <div className="w-48 border-l border-gray-800 p-3 hidden md:block">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Meters</span>
          <div className="flex gap-3 mt-3 justify-center h-[200px]">
            {['L', 'R'].map((ch) => (
              <div key={ch} className="flex flex-col items-center gap-1">
                <div className="flex-1 w-4 bg-gray-800 rounded-full relative overflow-hidden">
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ height: '65%' }} />
                </div>
                <span className="text-[9px] text-gray-500">{ch}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {['Volume', 'Pan', 'EQ', 'Compressor'].map((c) => (
              <div key={c} className="space-y-0.5">
                <span className="text-[10px] text-gray-400">{c}</span>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${40 + Math.random() * 40}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[160px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={3} />
      </div>
    </>
  )
}

function EffectsWorkspace() {
  return (
    <>
      <div className="flex-1 flex min-h-0">
        {/* Node graph area */}
        <div className="flex-1 p-3 min-h-0">
          <div className="bg-gray-800 rounded-lg h-full border border-gray-700 flex items-center justify-center relative">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Node Graph</span>
            {/* Mock nodes */}
            <div className="absolute top-1/3 left-1/4 bg-gray-700 rounded px-3 py-1.5 text-[10px] text-teal-400 border border-teal-800">Input</div>
            <div className="absolute top-1/3 left-1/2 bg-gray-700 rounded px-3 py-1.5 text-[10px] text-purple-400 border border-purple-800">Blur</div>
            <div className="absolute top-1/3 right-1/4 bg-gray-700 rounded px-3 py-1.5 text-[10px] text-blue-400 border border-blue-800">Output</div>
          </div>
        </div>
        <div className="w-56 border-l border-gray-800 p-2 overflow-auto hidden md:block">
          <MockInspector />
        </div>
      </div>
      <div className="h-[120px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={2} />
      </div>
    </>
  )
}

function ExportWorkspace() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
          <h2 className="text-sm font-medium">Export Settings</h2>
          {[
            { label: 'Format', value: 'MP4 (H.264)' },
            { label: 'Resolution', value: '1920 x 1080' },
            { label: 'Frame Rate', value: '30 fps' },
            { label: 'Quality', value: 'High (18 Mbps)' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{s.label}</span>
              <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">{s.value}</span>
            </div>
          ))}
          <button className="w-full bg-teal-600 hover:bg-teal-500 text-sm py-2.5 rounded-lg font-medium transition-colors mt-2">
            Export Video
          </button>
        </div>
      </div>
    </div>
  )
}
