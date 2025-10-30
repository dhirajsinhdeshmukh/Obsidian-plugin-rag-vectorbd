import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import { VectorDBService } from './src/vectordb-service';
import { TagSuggestionService } from './src/tag-suggestion-service';
import { NoteRetriever } from './src/note-retriever';

interface RAGVectorDBSettings {
	enableAutoTagging: boolean;
	enableVectorDB: boolean;
	similarityThreshold: number;
	maxSuggestions: number;
}

const DEFAULT_SETTINGS: RAGVectorDBSettings = {
	enableAutoTagging: true,
	enableVectorDB: true,
	similarityThreshold: 0.7,
	maxSuggestions: 5
}

export default class RAGVectorDBPlugin extends Plugin {
	settings: RAGVectorDBSettings;
	vectorDBService: VectorDBService;
	tagSuggestionService: TagSuggestionService;
	noteRetriever: NoteRetriever;

	async onload() {
		await this.loadSettings();

		// Initialize services
		this.noteRetriever = new NoteRetriever(this.app);
		this.vectorDBService = new VectorDBService(this.settings);
		this.tagSuggestionService = new TagSuggestionService(this.app, this.settings);

		// Add ribbon icon
		const ribbonIconEl = this.addRibbonIcon('brain-circuit', 'RAG Vector DB', async (evt: MouseEvent) => {
			new Notice('RAG Vector DB: Indexing notes...');
			await this.indexAllNotes();
			new Notice('RAG Vector DB: Indexing complete!');
		});
		ribbonIconEl.addClass('rag-vectordb-ribbon-class');

		// Add commands
		this.addCommand({
			id: 'index-all-notes',
			name: 'Index all notes',
			callback: async () => {
				await this.indexAllNotes();
			}
		});

		this.addCommand({
			id: 'find-similar-notes',
			name: 'Find similar notes',
			callback: async () => {
				await this.findSimilarNotes();
			}
		});

		this.addCommand({
			id: 'suggest-tags',
			name: 'Suggest tags for current note',
			callback: async () => {
				await this.suggestTags();
			}
		});

		// Add settings tab
		this.addSettingTab(new RAGVectorDBSettingTab(this.app, this));

		// Initialize vector database on startup if enabled
		if (this.settings.enableVectorDB) {
			await this.vectorDBService.initialize();
			console.log('RAG Vector DB: Service initialized');
		}
	}

	async indexAllNotes() {
		try {
			const notes = await this.noteRetriever.getAllNotes();
			new Notice(`Indexing ${notes.length} notes...`);
			
			for (const note of notes) {
				const content = await this.noteRetriever.getNoteContent(note);
				await this.vectorDBService.indexNote(note.path, content);
			}
			
			new Notice('Indexing complete!');
		} catch (error) {
			console.error('Error indexing notes:', error);
			new Notice('Error indexing notes. Check console for details.');
		}
	}

	async findSimilarNotes() {
		try {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice('No active note');
				return;
			}

			const content = await this.noteRetriever.getNoteContent(activeFile);
			const similarNotes = await this.vectorDBService.findSimilar(
				content,
				this.settings.maxSuggestions
			);

			if (similarNotes.length === 0) {
				new Notice('No similar notes found');
				return;
			}

			// Display similar notes
			let message = 'Similar notes:\n';
			similarNotes.forEach((result, idx) => {
				message += `${idx + 1}. ${result.document} (${(result.similarity * 100).toFixed(1)}%)\n`;
			});
			new Notice(message);
		} catch (error) {
			console.error('Error finding similar notes:', error);
			new Notice('Error finding similar notes. Check console for details.');
		}
	}

	async suggestTags() {
		try {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice('No active note');
				return;
			}

			const content = await this.noteRetriever.getNoteContent(activeFile);
			const suggestions = await this.tagSuggestionService.suggestTags(
				content,
				this.settings.maxSuggestions
			);

			if (suggestions.length === 0) {
				new Notice('No tag suggestions available');
				return;
			}

			// Display suggestions
			let message = 'Suggested tags:\n';
			suggestions.forEach((tag, idx) => {
				message += `${idx + 1}. ${tag}\n`;
			});
			new Notice(message);
		} catch (error) {
			console.error('Error suggesting tags:', error);
			new Notice('Error suggesting tags. Check console for details.');
		}
	}

	onunload() {
		console.log('Unloading RAG Vector DB plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class RAGVectorDBSettingTab extends PluginSettingTab {
	plugin: RAGVectorDBPlugin;

	constructor(app: App, plugin: RAGVectorDBPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'RAG Vector Database Settings'});

		new Setting(containerEl)
			.setName('Enable Vector Database')
			.setDesc('Enable vector database for similarity search')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableVectorDB)
				.onChange(async (value) => {
					this.plugin.settings.enableVectorDB = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable Auto-Tagging')
			.setDesc('Enable automatic tag suggestions')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoTagging)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoTagging = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Similarity Threshold')
			.setDesc('Minimum similarity score for related notes (0-1)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.similarityThreshold)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.similarityThreshold = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Suggestions')
			.setDesc('Maximum number of suggestions to show')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.maxSuggestions)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxSuggestions = value;
					await this.plugin.saveSettings();
				}));
	}
}
