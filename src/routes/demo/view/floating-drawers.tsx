import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MockPreview, MockEffectsDrawer, MockTimeline, LayoutLabel } from '../../../components/MockPanels'

export const Route = createFileRoute('/demo/view/floating-drawers')({
  component: FloatingDrawersLayout,
})

function FloatingDrawersLayout() {
  const [drawer, setDrawer] = useState<string | null>(null)

  const tools = [
    { id: 'effects', label: 'Effects', icon: '✦' },
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'audio', label: 'Audio', icon: '♪' },
    { id: 'speed', label: 'Speed', icon: '▶' },
  ]

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col relative">
      <LayoutLabel name="Floating Drawers" description="InShot / VN — clean canvas, slide-in panels" />

      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-20">
        <Link to="/demo" className="text-xs text-gray-500 hover:text-white">← Demos</Link>
        <button className="text-xs bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded font-medium">Export</button>
      </div>

      {/* Full-screen preview */}
      <div className="flex-1 p-3 min-h-0 relative">
        <MockPreview label="Full Canvas" />

        {/* Floating drawer - slides up from bottom */}
        {drawer && (
          <div className="absolute bottom-0 left-3 right-3 bg-gray-900/95 backdrop-blur-md rounded-t-xl border border-gray-700 border-b-0 p-4 z-30 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-widest">{drawer}</span>
              <button onClick={() => setDrawer(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
            {drawer === 'effects' && (
              <MockEffectsDrawer items={['Blur', 'Glow', 'Grain', 'Vignette', 'Shake', 'Glitch']} />
            )}
            {drawer === 'text' && (
              <div className="grid grid-cols-3 gap-2">
                {['Title', 'Subtitle', 'Lower Third', 'Caption', 'Label', 'Quote'].map((t) => (
                  <div key={t} className="bg-gray-800 rounded-lg p-3 text-center text-xs text-gray-400 hover:bg-gray-700 cursor-pointer transition-colors">
                    {t}
                  </div>
                ))}
              </div>
            )}
            {drawer === 'audio' && (
              <div className="space-y-2">
                {['Original Audio', 'Background Music', 'Sound Effects'].map((a) => (
                  <div key={a} className="flex items-center gap-3 bg-gray-800 rounded-lg p-2.5">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">♪</div>
                    <span className="text-xs text-gray-300 flex-1">{a}</span>
                    <div className="w-20 h-1 bg-gray-700 rounded-full">
                      <div className="h-1 bg-teal-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {drawer === 'speed' && (
              <div className="flex items-center justify-center gap-3 py-4">
                {['0.5x', '1x', '1.5x', '2x', '3x'].map((s) => (
                  <button
                    key={s}
                    className={`w-12 h-12 rounded-full border text-xs font-medium transition-colors ${
                      s === '1x'
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="px-3 pb-1">
        <MockTimeline tracks={2} />
      </div>

      {/* Bottom tool strip */}
      <div className="flex items-center justify-center gap-6 px-4 py-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setDrawer(drawer === tool.id ? null : tool.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              drawer === tool.id ? 'text-teal-400' : 'text-gray-500 hover:text-white'
            }`}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="text-[9px] uppercase tracking-wider">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
