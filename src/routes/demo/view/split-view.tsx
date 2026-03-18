import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockScript, MockInspector, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/split-view')({
  component: SplitViewLayout,
})

function SplitViewLayout() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Split View" description="Side-by-side editor with shared timeline" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Layout:</span>
          {['50/50', '70/30', '30/70'].map((r, i) => (
            <button
              key={r}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                i === 0 ? 'bg-teal-900/50 text-teal-400' : 'text-gray-500 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-400">2 collaborators</span>
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Script view */}
        <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
          <div className="px-3 py-1.5 border-b border-gray-800 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Script View</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px]">A</div>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-auto min-h-0">
            <MockScript />
          </div>
        </div>

        {/* Right: Visual view */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-3 py-1.5 border-b border-gray-800 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Visual View</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px]">B</div>
            </div>
          </div>
          <div className="flex-1 p-3 min-h-0">
            <MockPreview label="Scene Editor" />
          </div>
          <div className="h-[100px] p-2 pt-0 shrink-0 hidden md:block">
            <MockInspector />
          </div>
        </div>
      </div>

      {/* Shared timeline */}
      <div className="h-[140px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={3} />
      </div>
    </div>
  )
}
