import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockMediaBin, MockInspector, MockToolbar, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/dual-monitor')({
  component: DualMonitorLayout,
})

function DualMonitorLayout() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Dual Monitor" description="Resolve dual — source left, program right" />

      {/* Menu bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <MockToolbar items={['Source', 'Program', 'Sync']} />
        <div />
      </div>

      {/* Dual preview */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Source monitor + media */}
        <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
          <div className="flex-1 p-2 min-h-0">
            <MockPreview label="Source" />
          </div>
          <div className="h-[140px] p-2 pt-0 shrink-0">
            <MockMediaBin />
          </div>
        </div>

        {/* Right: Program monitor + inspector */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-2 min-h-0">
            <MockPreview label="Program" />
          </div>
          <div className="h-[140px] p-2 pt-0 shrink-0 hidden md:block">
            <MockInspector />
          </div>
        </div>
      </div>

      {/* Shared timeline across full width */}
      <div className="h-[160px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={4} />
      </div>
    </div>
  )
}
