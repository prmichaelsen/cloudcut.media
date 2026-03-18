import { createFileRoute, Link } from '@tanstack/react-router'

const layouts = [
  { id: 'canvas-first', name: 'Canvas First', desc: 'CapCut / iMovie — large preview, bottom timeline', tags: ['mobile', 'desktop'] },
  { id: 'three-panel', name: 'Three Panel', desc: 'Premiere Pro / Resolve — media, preview, inspector', tags: ['desktop'] },
  { id: 'dual-monitor', name: 'Dual Monitor', desc: 'Resolve dual — preview left, controls right', tags: ['desktop'] },
  { id: 'script-editor', name: 'Script Editor', desc: 'Descript — transcript above, visual below', tags: ['desktop', 'mobile'] },
  { id: 'floating-drawers', name: 'Floating Drawers', desc: 'InShot / VN — clean canvas, slide-in panels', tags: ['mobile', 'desktop'] },
  { id: 'grid-canvas', name: 'Grid Canvas', desc: 'Canva Video — drag-drop with multi-track', tags: ['desktop'] },
  { id: 'ai-canvas', name: 'AI Canvas', desc: 'Runway ML — full canvas, right sidebar AI tools', tags: ['desktop'] },
  { id: 'collapsible', name: 'Collapsible Sidebar', desc: 'Final Cut Pro — toggle sidebars, maximize canvas', tags: ['desktop'] },
  { id: 'split-view', name: 'Split View', desc: 'Side-by-side editor with shared timeline', tags: ['desktop'] },
  { id: 'tabbed-workspace', name: 'Tabbed Workspace', desc: 'Resolve Pages — switch between Edit, Color, Audio', tags: ['desktop'] },
]

export const Route = createFileRoute('/demo/')({
  component: DemoIndex,
})

function DemoIndex() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Layout Demos</h1>
            <p className="text-sm text-gray-500 mt-0.5">10 video editor layout mockups</p>
          </div>
          <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Timeline component demo */}
        <div className="mb-8">
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Component</h2>
          <Link
            to="/demo/timeline"
            className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-teal-800 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium group-hover:text-teal-400 transition-colors">Timeline Scrubber</h3>
                <p className="text-sm text-gray-500 mt-0.5">Interactive playhead + in/out trim handles demo</p>
              </div>
              <span className="text-gray-600 group-hover:text-teal-400 transition-colors">→</span>
            </div>
          </Link>
        </div>

        {/* Layout demos */}
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Layouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {layouts.map((layout) => (
            <Link
              key={layout.id}
              to={`/demo/view/${layout.id}` as any}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-teal-800 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-teal-400 transition-colors">{layout.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{layout.desc}</p>
                  <div className="flex gap-1.5 mt-2">
                    {layout.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          tag === 'mobile'
                            ? 'bg-purple-900/40 text-purple-400'
                            : 'bg-blue-900/40 text-blue-400'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-teal-400 transition-colors mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
