# Obsidian RAG Vector Database Plugin

A powerful Obsidian plugin that implements RAG (Retrieval-Augmented Generation) and vector database functionality for intelligent note management, automatic text grouping, and smart tag suggestions.

## Features

### 1. ✅ Complete CI/CD Pipeline
- Automated build and testing on push and pull requests
- Automated plugin deployment via GitHub Actions
- Release workflow with automatic artifact generation
- Multi-version Node.js testing (18.x, 20.x)

### 2. 📝 Note Retrieval
- Retrieve all notes from your Obsidian vault
- Extract content from individual notes
- Filter notes by modification date
- Search notes by tags
- Extract and manage tags (inline and YAML frontmatter)

### 3. 🔍 RAG & Vector Database Implementation
- Index all notes in a vector database
- Chunk text for optimal embedding quality
- Find similar notes based on content
- Group related text across different notes
- Semantic search with configurable similarity threshold

### 4. 🏷️ Intelligent Tag Suggestions
- Analyze existing tags across your vault
- Suggest new tags based on:
  - Content keywords
  - Tag frequency in vault
  - Co-occurrence patterns with existing tags
- Get most frequently used tags
- Smart filtering to avoid duplicate suggestions

## Installation

### From GitHub Releases (Recommended)
1. Download the latest release from the [Releases page](https://github.com/dhirajsinhdeshmukh/Obsidian-plugin-rag-vectorbd/releases)
2. Extract the files to your vault's `.obsidian/plugins/rag-vectordb/` directory
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Manual Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Copy `main.js` and `manifest.json` to your vault's `.obsidian/plugins/rag-vectordb/` directory
5. Reload Obsidian and enable the plugin

## Development

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test
```

### Project Structure
```
.
├── main.ts                      # Main plugin entry point
├── src/
│   ├── note-retriever.ts        # Note retrieval and tag extraction
│   ├── vectordb-service.ts      # Vector database operations
│   └── tag-suggestion-service.ts # Tag suggestion logic
├── tests/                       # Unit tests
├── .github/workflows/           # CI/CD pipelines
│   ├── build.yml               # Build and test workflow
│   └── release.yml             # Release workflow
├── manifest.json               # Plugin metadata
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## Usage

### Commands
The plugin adds the following commands (accessible via Command Palette: `Ctrl/Cmd + P`):

- **Index all notes**: Index all notes in the vector database
- **Find similar notes**: Find notes similar to the current note
- **Suggest tags for current note**: Get intelligent tag suggestions

### Ribbon Icon
Click the brain circuit icon in the left ribbon to quickly index all notes.

### Settings
Access plugin settings via Settings → RAG Vector Database:

- **Enable Vector Database**: Toggle vector database functionality
- **Enable Auto-Tagging**: Toggle automatic tag suggestions
- **Similarity Threshold**: Adjust minimum similarity score (0-1)
- **Max Suggestions**: Set maximum number of suggestions (1-10)

## How It Works

### Vector Database
The plugin uses ChromaDB to create embeddings of your notes. Notes are:
1. Split into chunks for better granularity
2. Embedded using transformer models
3. Stored in a vector database
4. Searchable using semantic similarity

### Tag Suggestions
Tag suggestions are generated using a multi-factor scoring algorithm:
1. **Frequency**: How often a tag appears in your vault
2. **Keyword Similarity**: Similarity between tags and note content
3. **Co-occurrence**: How often tags appear together with existing tags

## CI/CD Pipeline

### Build Workflow
Triggered on push and pull requests to `main` and `develop` branches:
- Installs dependencies
- Runs linter
- Builds the plugin
- Runs tests
- Uploads build artifacts

### Release Workflow
Triggered on tag push:
- Builds the plugin
- Creates a release package
- Publishes to GitHub Releases
- Attaches plugin files for easy installation

### Creating a Release
```bash
# Update version in package.json
npm version patch  # or minor, major

# Push tag to trigger release
git push --tags
```

## Testing

The plugin includes unit tests for core functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- 🐛 [Report bugs](https://github.com/dhirajsinhdeshmukh/Obsidian-plugin-rag-vectorbd/issues)
- 💡 [Request features](https://github.com/dhirajsinhdeshmukh/Obsidian-plugin-rag-vectorbd/issues)
- 📖 [Obsidian API Documentation](https://docs.obsidian.md/Home)

## Roadmap

- [ ] Advanced semantic search with custom embeddings
- [ ] Tag hierarchy and relationship visualization
- [ ] Batch tag operations
- [ ] Export/import vector database
- [ ] Integration with AI services for enhanced suggestions
- [ ] Custom similarity algorithms
- [ ] Note clustering and visualization

## Acknowledgments

Built with:
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- [ChromaDB](https://www.trychroma.com/)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
