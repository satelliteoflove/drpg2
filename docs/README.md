# DRPG2 Documentation

Welcome to the DRPG2 (Dungeon RPG 2) documentation. This directory contains comprehensive guides for understanding, using, and contributing to the DRPG2 game engine.

## Documentation Overview

### 📚 Core Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - Detailed overview of the engine's architecture, design patterns, and core components
- **[Usage Guide](./USAGE.md)** - Developer guide for creating games with the DRPG2 engine
- **[Performance Guide](./PERFORMANCE.md)** - Optimization strategies, profiling techniques, and best practices

### 🔧 API Documentation

- **[API Reference](./api/)** - Complete TypeScript API documentation generated with TypeDoc
- **[Service Interfaces](./api/modules/services.html)** - Service layer documentation and dependency injection
- **[Core Classes](./api/modules/core.html)** - Game engine core classes and systems

## Quick Start

### For Game Developers
1. Start with the **[Usage Guide](./USAGE.md)** to understand basic concepts
2. Review the **[Architecture Guide](./ARCHITECTURE.md)** for system design
3. Reference the **[API Documentation](./api/)** for detailed class information

### For Engine Contributors
1. Read the **[Architecture Guide](./ARCHITECTURE.md)** to understand the codebase structure
2. Follow the **[Performance Guide](./PERFORMANCE.md)** for optimization practices
3. Use the **[API Documentation](./api/)** for implementation details

### For Performance Optimization
1. Start with the **[Performance Guide](./PERFORMANCE.md)** for optimization strategies
2. Reference the **[Architecture Guide](./ARCHITECTURE.md)** for system interactions
3. Use profiling tools as described in the performance documentation

## Engine Features

### 🎮 Core Game Engine
- **Service-Oriented Architecture** with dependency injection
- **Scene-Based State Management** for different game modes
- **Canvas Rendering Pipeline** with layer-based rendering
- **Input Management System** with keyboard and mouse support
- **Save/Load System** with auto-save functionality

### 🎨 Rendering System
- **Layer-Based Rendering** with background, entities, effects, and UI layers
- **Performance Optimization** with dirty region tracking and frame skipping
- **Sprite Caching** with LRU eviction for memory management
- **Debug Visualization** with performance metrics and profiling

### 🏗️ Architecture
- **TypeScript Strict Mode** for type safety and reliability
- **Entity-Component-System** patterns for game objects
- **Error Handling** with graceful degradation and logging
- **Testing Infrastructure** with Jest and comprehensive test coverage

## Getting Help

### Documentation Structure
Each guide is designed to be read independently, but they reference each other:
- **Architecture** → Understanding the system design
- **Usage** → Practical development guidance  
- **Performance** → Optimization and profiling

### Common Use Cases
- **"How do I create a new scene?"** → [Usage Guide - Scene Development](./USAGE.md#creating-new-scenes)
- **"Why is my game running slowly?"** → [Performance Guide - Profiling](./PERFORMANCE.md#performance-profiling)
- **"How does the service system work?"** → [Architecture Guide - Service Layer](./ARCHITECTURE.md#service-layer-services)
- **"What methods are available on Scene?"** → [API Reference - Scene Class](./api/classes/core_Scene.Scene.html)

## Contributing to Documentation

### Updating Documentation
1. Edit the relevant Markdown files in `docs/`
2. For API documentation, add JSDoc comments to TypeScript source files
3. Regenerate API docs with `npm run docs`
4. Test documentation links and formatting

### Documentation Standards
- Use clear, concise language
- Include code examples for complex concepts
- Cross-reference related sections
- Keep examples up-to-date with the current API

## Version Information

This documentation is generated for DRPG2 engine version **1.0.0**.

### Documentation Generation
- **API Docs**: Generated with [TypeDoc](https://typedoc.org/) from TypeScript source
- **Architecture/Usage/Performance**: Hand-written Markdown documentation
- **Update Frequency**: Documentation is updated with each major release

---

For the most up-to-date information, always refer to the source code and the latest API documentation generated with `npm run docs`.