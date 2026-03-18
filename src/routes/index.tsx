import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          cloudcut.media
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          WebAssembly-powered browser-based video editor with cloud rendering
        </p>
        <div className="space-y-4">
          <Link
            to="/editor"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Launch Editor
          </Link>
          <div className="mt-8 text-sm text-gray-500">
            <p>Features:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Timeline UI with real-time preview</li>
              <li>WASM + WebGL/WebGPU accelerated rendering</li>
              <li>Proxy editing with cloud-based final render</li>
              <li>Persistent connection to cloud backend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}