import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockToolbar, MockEffectsDrawer, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/canvas-first')({
  component: CanvasFirstLayout,
})

function CanvasFirstLayout() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Canvas First" description="CapCut / iMovie — large preview, bottom timeline" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 z-10">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <MockToolbar items={['Undo', 'Redo']} />
        <button className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded font-medium">Export</button>
      </div>

      {/* Preview — takes most space */}
      <div className="flex-1 p-3 pb-0">
        <MockPreview label="16:9 Preview" />
      </div>

      {/* Tool strip */}
      <div className="px-3 py-2">
        <MockEffectsDrawer items={['Cut', 'Trim', 'Split', 'Speed', 'Filter', 'Text', 'Music']} />
      </div>

      {/* Timeline at bottom */}
      <div className="px-3 pb-3">
        <MockTimeline tracks={2} />
      </div>
    </div>
  )
}
