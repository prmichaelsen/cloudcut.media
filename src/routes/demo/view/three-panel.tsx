import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockMediaBin, MockInspector, MockToolbar, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/three-panel')({
  component: ThreePanelLayout,
})

function ThreePanelLayout() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Three Panel" description="Premiere Pro / Resolve — media, preview, inspector" />

      {/* Menu bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <MockToolbar items={['File', 'Edit', 'View', 'Effects', 'Window']} />
        <div />
      </div>

      {/* Three panel layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Media bin */}
        <div className="w-64 border-r border-gray-800 p-2 overflow-auto hidden md:block">
          <MockMediaBin />
        </div>

        {/* Center: Preview + Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview */}
          <div className="flex-1 p-2 min-h-0">
            <MockPreview label="Program Monitor" />
          </div>
          {/* Timeline */}
          <div className="h-[200px] p-2 pt-0 shrink-0">
            <MockTimeline tracks={4} />
          </div>
        </div>

        {/* Right: Inspector */}
        <div className="w-60 border-l border-gray-800 p-2 overflow-auto hidden md:block">
          <MockInspector />
        </div>
      </div>
    </div>
  )
}
