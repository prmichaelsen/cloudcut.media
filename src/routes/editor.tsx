import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/editor')({
  component: Editor,
})

function Editor() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">Video Editor</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-2">Video Editor</h2>
              <p className="text-gray-400 mb-6">
                Timeline editor UI will be implemented in Milestone 3
              </p>
              <p className="text-sm text-gray-500">
                Current milestone: M1 - Project Foundation & Scaffolding
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}