import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockScript, MockInspector, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/script-editor')({
  component: ScriptEditorLayout,
})

function ScriptEditorLayout() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Script Editor" description="Descript — transcript above, visual below" />

      {/* Menu bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <div className="flex gap-3">
          <button className="text-xs text-teal-400 border-b border-teal-400 pb-0.5">Script</button>
          <button className="text-xs text-gray-500 hover:text-white pb-0.5">Scenes</button>
          <button className="text-xs text-gray-500 hover:text-white pb-0.5">Canvas</button>
        </div>
        <button className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded font-medium">Publish</button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Script + Preview stacked */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Script (top half) */}
          <div className="flex-1 p-3 pb-0 min-h-0 overflow-auto">
            <MockScript />
          </div>

          {/* Preview (bottom half) */}
          <div className="flex-1 p-3 min-h-0">
            <MockPreview label="Scene Preview" />
          </div>
        </div>

        {/* Right sidebar: Inspector */}
        <div className="w-56 border-l border-gray-800 p-2 overflow-auto hidden md:block">
          <MockInspector />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-[120px] p-2 pt-0 shrink-0 border-t border-gray-800">
        <MockTimeline tracks={2} />
      </div>
    </div>
  )
}
