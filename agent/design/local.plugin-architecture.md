# Plugin Architecture

**Concept**: Extension point system for third-party feature modules following VSCode plugin model
**Created**: 2026-03-17
**Status**: Design Specification

---

## Overview

This document defines the plugin architecture for cloudcut.media — an extension system that allows third-party developers to build feature modules (effects, transitions, export formats, AI tools, etc.) without modifying the core editor codebase.

The architecture follows the VSCode extension model: well-defined extension points, manifest-based plugin declaration, and a plugin lifecycle system. While actual plugin loader implementation is a late priority (P10), the core editor is designed from day 1 with extension points in place to avoid costly refactoring later.

**Key principle**: Core code should be written as if plugins already exist, even if the loader isn't built yet.

---

## Problem Statement

Video editing software requires diverse functionality:
- Custom video effects and filters
- New export formats and codecs
- AI-powered features (background removal, auto-captions, scene detection)
- Integration with third-party services (stock footage, music libraries)
- Specialized workflows (multi-cam editing, color grading tools)

Challenges:
- **Monolithic core**: Building all features in-house is slow and resource-intensive
- **Inflexibility**: Users can't extend the editor for their specific needs
- **Missed opportunities**: Community contributions require core team involvement
- **Maintenance burden**: Every feature added to core increases complexity and testing surface

**Consequence of not solving**: cloudcut.media remains limited to features we build ourselves, losing competitive advantage against extensible editors (Premiere Pro plugins, DaVinci Resolve FX).

---

## Solution

Design the core editor with **well-defined extension points** from the start. Plugins can hook into these points via a manifest file (`plugin.json`) and provide implementations.

### Extension Points

| Extension Point | Purpose | Example Plugin |
|-----------------|---------|----------------|
| `effects.video` | Custom video effects (shaders, filters) | "Vintage Film" effect bundle |
| `effects.audio` | Audio effects and filters | "Noise reduction" plugin |
| `transitions` | Clip transitions | "Wipe transitions" pack |
| `export.formats` | Export formats and codecs | "ProRes export" plugin |
| `ai.analysis` | AI-powered video analysis | "Auto scene detection" |
| `ai.generation` | AI content generation | "AI voice clone" |
| `services.storage` | Cloud storage integrations | "Dropbox connector" |
| `services.media` | Stock media providers | "Getty Images" integration |
| `ui.panels` | Custom UI panels | "Advanced color grading" panel |
| `timeline.tools` | Timeline editing tools | "Ripple edit" tool |

### Plugin Manifest

Each plugin declares capabilities in `plugin.json`:

```json
{
  "name": "vintage-film-effects",
  "version": "1.0.0",
  "displayName": "Vintage Film Effects",
  "description": "Film grain, scratches, and retro filters",
  "author": "Third Party Studio",
  "contributes": {
    "effects.video": [
      {
        "id": "film-grain",
        "name": "Film Grain",
        "shader": "shaders/film-grain.glsl",
        "parameters": [
          { "id": "intensity", "type": "float", "default": 0.5, "min": 0, "max": 1 }
        ]
      }
    ]
  },
  "activationEvents": [
    "onEffect:film-grain"
  ]
}
```

### Plugin Lifecycle

```
┌─────────────────────────────────────────┐
│ 1. Discovery (scan plugin directories)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 2. Manifest Validation                  │
│    - Check schema                       │
│    - Validate dependencies              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 3. Registration                         │
│    - Register extension points          │
│    - Store metadata                     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 4. Activation (on demand)               │
│    - Load plugin code                   │
│    - Initialize plugin                  │
│    - Call activate() hook               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 5. Execution                            │
│    - Plugin contributes to UI/pipeline  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ 6. Deactivation                         │
│    - Call deactivate() hook             │
│    - Cleanup resources                  │
└─────────────────────────────────────────┘
```

### Alternative Approaches Considered

1. **Fork-based model** (like OBS Studio plugins)
   - ❌ Rejected: Too tightly coupled to core code, requires rebuilding

2. **Web Component-based** (custom elements only)
   - ❌ Rejected: Too limited, can't extend core functionality beyond UI

3. **Full sandboxing** (separate processes, strict API-only access)
   - ✅ Future consideration for security, but adds complexity

---

## Implementation

### Phase 1: Design Extension Points (M1-M6)

**Goal**: Ensure core code has clean interfaces where plugins can hook in.

**Example — Video Effect Extension Point**:

```typescript
// src/core/effects/EffectRegistry.ts
export interface VideoEffect {
  id: string;
  name: string;
  apply(frame: ImageData, params: EffectParams): ImageData;
  getParameters(): EffectParameter[];
}

export class EffectRegistry {
  private effects = new Map<string, VideoEffect>();

  register(effect: VideoEffect): void {
    this.effects.set(effect.id, effect);
  }

  get(id: string): VideoEffect | undefined {
    return this.effects.get(id);
  }

  list(): VideoEffect[] {
    return Array.from(this.effects.values());
  }
}

// Core registers built-in effects
effectRegistry.register(new BrightnessEffect());
effectRegistry.register(new ContrastEffect());

// Plugin will eventually do:
// effectRegistry.register(new FilmGrainEffect());
```

**Key principle**: Write core code as if `FilmGrainEffect` already exists. The registry should be plugin-agnostic.

### Phase 2: Plugin Loader (P10)

**Goal**: Implement manifest parsing, plugin discovery, lifecycle management.

**Structure**:
```
plugins/
  vintage-film-effects/
    plugin.json
    index.js          # Main entry point
    shaders/
      film-grain.glsl

  dropbox-connector/
    plugin.json
    index.js
```

**Loader pseudocode**:
```typescript
class PluginLoader {
  async loadPlugins(pluginDir: string) {
    const plugins = await this.discover(pluginDir);

    for (const plugin of plugins) {
      await this.validate(plugin.manifest);
      await this.register(plugin);
    }
  }

  private async register(plugin: Plugin) {
    // Register extension points
    for (const effect of plugin.manifest.contributes['effects.video'] ?? []) {
      const instance = await plugin.load(effect.id);
      effectRegistry.register(instance);
    }
  }
}
```

### Phase 3: Plugin Marketplace (P15+)

Web-based discovery, ratings, automatic updates.

---

## Benefits

1. **Extensibility**: Users can add features without waiting for core team
2. **Community contributions**: Open ecosystem drives innovation
3. **Modularity**: Core stays lean, advanced features are opt-in
4. **Revenue potential**: Premium plugin marketplace
5. **Competitive advantage**: Matches feature parity with Premiere/DaVinci via plugins
6. **Faster iteration**: Third parties can ship features on their own timeline

---

## Trade-offs

1. **Complexity**: Plugin system adds architectural overhead
   - **Mitigation**: Keep extension points simple, clear contracts, good documentation

2. **Security risks**: Malicious plugins could access user data or inject code
   - **Mitigation**: Sandboxing (future), code review for marketplace plugins, user warnings

3. **Maintenance burden**: Breaking changes in core require updating all plugins
   - **Mitigation**: Versioned extension points, deprecation warnings, backward compatibility

4. **Performance**: Plugin overhead (discovery, activation, execution)
   - **Mitigation**: Lazy loading, activation events, caching

5. **Testing surface**: Must test core with/without plugins, plugin interactions
   - **Mitigation**: Extension point contracts have automated tests

---

## Dependencies

- **Phase 1** (extension points): No external dependencies, just clean interfaces in core code
- **Phase 2** (loader): Manifest parser, plugin sandbox (if implementing), module loader
- **Phase 3** (marketplace): Web service for plugin registry, payment gateway

---

## Testing Strategy

### Phase 1: Extension Point Testing

Test that extension points work as designed:

```typescript
// Test: EffectRegistry accepts and retrieves effects
test('EffectRegistry', () => {
  const registry = new EffectRegistry();
  const mockEffect = new MockEffect('test-effect');

  registry.register(mockEffect);
  expect(registry.get('test-effect')).toBe(mockEffect);
  expect(registry.list()).toContain(mockEffect);
});
```

### Phase 2: Plugin Loader Testing

- **Manifest validation**: Reject invalid plugin.json schemas
- **Lifecycle hooks**: Verify activate/deactivate called correctly
- **Error handling**: Plugin load failure doesn't crash core
- **Isolation**: Plugin A doesn't interfere with Plugin B

### Phase 3: Security Testing

- **Malicious code detection**: Static analysis of plugin code
- **Resource limits**: Memory/CPU caps for plugins
- **API access control**: Plugins can't access unauthorized APIs

---

## Migration Path

Not applicable — this is a new feature. However:

1. **M1-M6**: Build core with extension points
2. **Post-MVP**: Build plugin loader
3. **Later**: Open marketplace

Existing core code should work identically with or without plugins loaded.

---

## Future Considerations

1. **Plugin sandboxing**: Run plugins in separate contexts (Web Workers, iframes, or separate processes)
2. **Hot reload**: Update plugins without restarting the editor
3. **Plugin dependencies**: Plugins can depend on other plugins
4. **Versioned APIs**: Support multiple API versions for backward compatibility
5. **Plugin marketplace**: Web portal for discovery, ratings, purchases
6. **Premium plugins**: Monetization model (revenue share with third-party devs)
7. **Plugin SDK**: npm package with TypeScript types, utilities, testing framework
8. **Code signing**: Verify plugin authenticity and integrity
9. **Native plugins**: Support compiled extensions (WASM, native modules) for performance-critical code

---

**Status**: Design Specification (architectural foundation defined, implementation deferred to P10)
**Recommendation**: Implement extension points during M1-M6 development. Defer plugin loader to post-MVP.
**Related Documents**:
- `agent/design/requirements.md` (MVP scope excludes plugin loader)
- `agent/milestones/milestone-1-project-foundation.md` (should include extension point patterns)
