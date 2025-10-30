# Development Guide

This guide provides detailed information for developers working on the RAG Vector Database plugin.

## Architecture

### Core Components

#### 1. Main Plugin (`main.ts`)
- **RAGVectorDBPlugin**: Main plugin class that extends Obsidian's Plugin
- Handles plugin lifecycle (load/unload)
- Manages plugin commands and UI elements
- Coordinates between services

#### 2. Note Retriever (`src/note-retriever.ts`)
- **NoteRetriever**: Service for retrieving and processing notes
- Methods:
  - `getAllNotes()`: Get all markdown files from vault
  - `getNoteContent(file)`: Read content of a specific note
  - `getRecentNotes(since)`: Filter notes by modification date
  - `getNotesWithTags(tags)`: Find notes with specific tags
  - `extractTags(content)`: Extract inline and YAML tags
  - `getAllTags()`: Get tag frequency map across vault

#### 3. Vector Database Service (`src/vectordb-service.ts`)
- **VectorDBService**: In-memory vector database implementation
- Uses TF-IDF and cosine similarity for semantic search
- Methods:
  - `initialize()`: Initialize the vector database
  - `indexNote(path, content)`: Index a note with chunking
  - `findSimilar(content, limit)`: Find similar notes
  - `findRelatedText(query, limit)`: Find related text chunks
  - `clearIndex()`: Clear all indexed documents

**Implementation Details:**
- Uses in-memory Map for storage (browser-compatible)
- Implements text chunking for better granularity
- TF-IDF vectorization with cosine similarity
- Configurable similarity threshold

#### 4. Tag Suggestion Service (`src/tag-suggestion-service.ts`)
- **TagSuggestionService**: Intelligent tag recommendation system
- Multi-factor scoring algorithm:
  - Tag frequency in vault
  - Keyword similarity with content
  - Co-occurrence patterns with existing tags
- Methods:
  - `suggestTags(content, max)`: Generate tag suggestions
  - `getMostUsedTags(limit)`: Get popular tags

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/dhirajsinhdeshmukh/Obsidian-plugin-rag-vectorbd.git
cd Obsidian-plugin-rag-vectorbd

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Development Mode

The `npm run dev` command:
1. Starts esbuild in watch mode
2. Automatically rebuilds on file changes
3. Generates source maps for debugging

### Building

```bash
# Production build (minified, no source maps)
npm run build

# The build outputs:
# - main.js: Bundled plugin code
# - main.js.map: Source map (dev only)
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test note-retriever.test.ts

# Generate coverage report
npm test -- --coverage
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Adding New Features

### 1. Adding a New Command

Edit `main.ts`:

```typescript
this.addCommand({
    id: 'your-command-id',
    name: 'Your Command Name',
    callback: async () => {
        await this.yourMethod();
    }
});
```

### 2. Adding a New Setting

1. Update the interface in `main.ts`:
```typescript
interface RAGVectorDBSettings {
    // existing settings...
    yourNewSetting: boolean;
}
```

2. Update default settings:
```typescript
const DEFAULT_SETTINGS: RAGVectorDBSettings = {
    // existing defaults...
    yourNewSetting: false
}
```

3. Add UI in `RAGVectorDBSettingTab.display()`:
```typescript
new Setting(containerEl)
    .setName('Your Setting')
    .setDesc('Description')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.yourNewSetting)
        .onChange(async (value) => {
            this.plugin.settings.yourNewSetting = value;
            await this.plugin.saveSettings();
        }));
```

### 3. Adding a New Service

1. Create file in `src/` directory
2. Export service class
3. Initialize in `main.ts`:
```typescript
export default class RAGVectorDBPlugin extends Plugin {
    yourService: YourService;
    
    async onload() {
        this.yourService = new YourService(this.app, this.settings);
    }
}
```

## Testing Guidelines

### Unit Test Structure

```typescript
import { YourClass } from '../src/your-file';
import { App } from 'obsidian';

describe('YourClass', () => {
    let instance: YourClass;
    let mockApp: App;

    beforeEach(() => {
        mockApp = {
            // mock App interface
        } as unknown as App;
        
        instance = new YourClass(mockApp);
    });

    describe('yourMethod', () => {
        test('should do something', () => {
            // arrange
            const input = 'test';
            
            // act
            const result = instance.yourMethod(input);
            
            // assert
            expect(result).toBe('expected');
        });
    });
});
```

### Best Practices

1. **Test Coverage**: Aim for >80% code coverage
2. **Mock External Dependencies**: Always mock Obsidian API
3. **Test Edge Cases**: Empty inputs, null values, errors
4. **Descriptive Names**: Use clear test descriptions
5. **Arrange-Act-Assert**: Follow AAA pattern

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` type (use `unknown` or proper types)
- Use async/await over promises
- Export only what's needed

### Naming Conventions

- Classes: PascalCase (`NoteRetriever`)
- Functions/Methods: camelCase (`extractTags`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_SETTINGS`)
- Interfaces: PascalCase with 'I' prefix optional (`RAGVectorDBSettings`)

## CI/CD Pipeline

### Build Workflow (`.github/workflows/build.yml`)

Triggers: Push and PR to `main` and `develop`

Steps:
1. Checkout code
2. Setup Node.js (18.x, 20.x matrix)
3. Install dependencies
4. Run linter
5. Build plugin
6. Run tests
7. Upload artifacts

### Release Workflow (`.github/workflows/release.yml`)

Triggers: Git tag push

Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build plugin
5. Create release package (ZIP)
6. Create GitHub release
7. Attach artifacts

### Creating a Release

```bash
# Update version in package.json
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# This automatically:
# 1. Updates package.json
# 2. Runs version-bump.mjs
# 3. Updates manifest.json and versions.json
# 4. Creates git tag

# Push tags to trigger release
git push --follow-tags
```

## Debugging

### In Obsidian

1. Enable Developer Tools: `Ctrl/Cmd + Shift + I`
2. Check Console for logs
3. Set breakpoints in bundled `main.js`

### Development Tips

```typescript
// Add debug logging
console.log('Debug info:', variable);

// Use debugger statement
debugger; // execution pauses here when DevTools open

// Log performance
console.time('operation');
await someOperation();
console.timeEnd('operation');
```

## Common Issues

### Build Fails

**Issue**: `Cannot find module 'obsidian'`
**Solution**: Run `npm install`

**Issue**: TypeScript errors
**Solution**: Check `tsconfig.json` and ensure types are correct

### Tests Fail

**Issue**: Import errors in tests
**Solution**: Ensure Jest config has correct paths

**Issue**: Mock not working
**Solution**: Check mock implementation matches interface

### Plugin Not Loading

**Issue**: Plugin doesn't appear in Obsidian
**Solution**: 
1. Check manifest.json is valid
2. Ensure files are in correct directory
3. Restart Obsidian

## Performance Optimization

### Vector Database

- **Chunking**: Adjust chunk size based on note length
- **Caching**: Results cached for 5 minutes
- **Batch Operations**: Index multiple notes together

### Tag Suggestions

- **Lazy Loading**: Tags loaded on-demand
- **Debouncing**: Delay suggestions during typing
- **Memoization**: Cache frequent queries

## Security Considerations

1. **No External API Calls**: All processing is local
2. **No Data Collection**: No telemetry or tracking
3. **Sandboxed**: Runs in Obsidian's security context
4. **Input Validation**: Sanitize all user inputs

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Run linter and tests
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

### PR Checklist

- [ ] Tests added/updated
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Backward compatible (or noted in PR)

## Resources

- [Obsidian API Docs](https://docs.obsidian.md/Home)
- [Obsidian Plugin Dev](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESBuild Documentation](https://esbuild.github.io/)
