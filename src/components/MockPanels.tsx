/** Shared mock UI panels for layout demos */

export function MockPreview({ label = 'Preview' }: { label?: string }) {
  return (
    <div className="bg-black rounded-lg flex items-center justify-center h-full min-h-[120px]">
      <div className="text-center space-y-1">
        <div className="w-16 h-10 mx-auto bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[8px] border-l-teal-400 border-y-[5px] border-y-transparent ml-1" />
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  )
}

export function MockTimeline({ tracks = 3 }: { tracks?: number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-full min-h-[60px] space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Timeline</span>
        <div className="flex gap-1">
          {['V', 'A', 'T'].map((t) => (
            <span key={t} className="text-[9px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      </div>
      {Array.from({ length: tracks }).map((_, i) => (
        <div key={i} className="flex gap-1 h-5">
          <span className="text-[9px] text-gray-600 w-4 flex items-center justify-center shrink-0">
            {i === 0 ? 'V' : i === 1 ? 'A' : 'T'}
          </span>
          <div className="flex-1 flex gap-0.5">
            {Array.from({ length: 2 + Math.floor(Math.random() * 3) }).map((_, j) => (
              <div
                key={j}
                className={`h-full rounded-sm ${
                  i === 0
                    ? 'bg-teal-800/60'
                    : i === 1
                      ? 'bg-blue-800/60'
                      : 'bg-purple-800/60'
                }`}
                style={{ flex: 1 + Math.random() * 2 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MockToolbar({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-1 p-1.5 bg-gray-800 rounded-lg">
      {items.map((item) => (
        <button
          key={item}
          className="px-2.5 py-1.5 text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors uppercase tracking-wider"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function MockMediaBin() {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-full min-h-[80px]">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Media</span>
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video bg-gray-700 rounded-sm"
          />
        ))}
      </div>
    </div>
  )
}

export function MockInspector() {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-full min-h-[80px] space-y-3">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Inspector</span>
      {['Position', 'Scale', 'Opacity', 'Speed'].map((prop) => (
        <div key={prop} className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-400">{prop}</span>
            <span className="text-[10px] text-gray-500 font-mono">100</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full">
            <div className="h-1 bg-teal-600 rounded-full" style={{ width: `${50 + Math.random() * 50}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MockScript() {
  return (
    <div className="bg-gray-800 rounded-lg p-3 h-full min-h-[80px] space-y-2">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Script</span>
      {[
        'Welcome to the video. Today we...',
        'First, let me show you how to...',
        'And that brings us to the final...',
        'Thanks for watching, subscribe...',
      ].map((line, i) => (
        <p key={i} className={`text-xs ${i === 1 ? 'text-white bg-teal-900/30 -mx-1 px-1 py-0.5 rounded' : 'text-gray-400'}`}>
          {line}
        </p>
      ))}
    </div>
  )
}

export function MockEffectsDrawer({ items }: { items: string[] }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">Effects</span>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {items.map((fx) => (
          <div key={fx} className="shrink-0 text-center">
            <div className="w-12 h-12 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
              <span className="text-lg">{fx}</span>
            </div>
            <span className="text-[9px] text-gray-500 mt-1 block">Effect</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MockTabs({ tabs, active }: { tabs: string[]; active: number }) {
  return (
    <div className="flex border-b border-gray-700">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          className={`px-4 py-2 text-xs uppercase tracking-wider border-b-2 transition-colors ${
            i === active
              ? 'text-teal-400 border-teal-400'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function LayoutLabel({ name, description }: { name: string; description: string }) {
  return (
    <div className="absolute top-3 left-3 z-50 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50">
      <p className="text-xs font-medium text-teal-400">{name}</p>
      <p className="text-[10px] text-gray-400">{description}</p>
    </div>
  )
}
