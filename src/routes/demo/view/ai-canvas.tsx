import { createFileRoute, Link } from '@tanstack/react-router'
import { MockPreview, MockTimeline, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/ai-canvas')({
  component: AiCanvasLayout,
})

function AiCanvasLayout() {
  const aiTools = [
    { name: 'Remove BG', desc: 'Remove background from clip', status: 'ready' },
    { name: 'Inpaint', desc: 'Fill or replace selected region', status: 'ready' },
    { name: 'Extend', desc: 'Generate continuation frames', status: 'ready' },
    { name: 'Style Transfer', desc: 'Apply visual style to clip', status: 'beta' },
    { name: 'Upscale', desc: '4x resolution enhancement', status: 'ready' },
    { name: 'Auto Caption', desc: 'Generate subtitles from speech', status: 'ready' },
  ]

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col relative">
      <LayoutLabel name="AI Canvas" description="Runway ML — full canvas, right sidebar AI tools" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">AI Powered</span>
        </div>
        <button className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded font-medium">Export</button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 min-h-0">
            <MockPreview label="AI Workspace" />
          </div>
          <div className="h-[120px] p-2 pt-0 shrink-0">
            <MockTimeline tracks={2} />
          </div>
        </div>

        {/* Right: AI tools sidebar */}
        <div className="w-72 border-l border-gray-800 flex flex-col hidden md:flex">
          {/* Prompt input */}
          <div className="p-3 border-b border-gray-800">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Prompt</label>
            <textarea
              placeholder="Describe what you want to generate or modify..."
              className="w-full bg-gray-900 text-sm rounded-lg px-3 py-2 text-gray-300 placeholder-gray-600 border border-gray-800 focus:border-purple-600 focus:outline-none resize-none h-20"
            />
            <button className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-xs py-2 rounded-lg font-medium transition-colors">
              Generate
            </button>
          </div>

          {/* AI tools grid */}
          <div className="flex-1 overflow-auto p-3">
            <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Tools</label>
            <div className="space-y-2">
              {aiTools.map((tool) => (
                <button
                  key={tool.name}
                  className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-800 rounded-lg p-3 text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium group-hover:text-purple-300">{tool.name}</span>
                    {tool.status === 'beta' && (
                      <span className="text-[9px] bg-yellow-900/50 text-yellow-400 px-1.5 py-0.5 rounded">Beta</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{tool.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
