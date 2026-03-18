import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, MockToolbar, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/grid-canvas')({
  component: GridCanvasLayout,
})

function GridCanvasLayout() {
  const elements = ['Text', 'Image', 'Shape', 'Video', 'Audio', 'Animation', 'Background', 'Template']

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col relative">
      <LayoutLabel name="Grid Canvas" description="Canva Video — drag-drop with multi-track" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <MockToolbar items={['Design', 'Elements', 'Text', 'Upload', 'Apps']} />
        <div className="flex gap-2">
          <button className="text-xs text-gray-400 hover:text-white px-2 py-1">Share</button>
          <button className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded font-medium">Download</button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Elements panel */}
        <div className="w-72 border-r border-gray-800 p-3 overflow-auto hidden md:block">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search elements..."
              className="w-full bg-gray-800 text-sm rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 border border-gray-700 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {elements.map((el) => (
              <div
                key={el}
                className="aspect-square bg-gray-800 rounded-xl border border-gray-700 hover:border-teal-600 flex items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto bg-gray-700 rounded-lg mb-1 group-hover:bg-teal-900/50 transition-colors" />
                  <span className="text-[10px] text-gray-400 group-hover:text-teal-400">{el}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Canvas with page guides */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-950">
          <div className="w-full max-w-lg">
            <div className="bg-gray-800 rounded border border-gray-700 aspect-video relative">
              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-gray-700/20" />
                ))}
              </div>
              <MockPreview label="Canvas" />
            </div>
            {/* Page navigation */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {['1', '2', '3', '+'].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    p === '1'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-[140px] p-2 border-t border-gray-800 shrink-0">
        <MockTimeline tracks={3} />
      </div>
    </div>
  )
}
