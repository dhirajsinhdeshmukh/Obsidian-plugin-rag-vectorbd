import { App, TFile } from 'obsidian';

export class NoteRetriever {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Retrieve all markdown notes from the vault
	 */
	async getAllNotes(): Promise<TFile[]> {
		const files = this.app.vault.getMarkdownFiles();
		return files;
	}

	/**
	 * Get content of a specific note
	 */
	async getNoteContent(file: TFile): Promise<string> {
		return await this.app.vault.read(file);
	}

	/**
	 * Get notes modified since a specific date
	 */
	async getRecentNotes(since: Date): Promise<TFile[]> {
		const allFiles = await this.getAllNotes();
		return allFiles.filter(file => file.stat.mtime > since.getTime());
	}

	/**
	 * Get notes containing specific tags
	 */
	async getNotesWithTags(tags: string[]): Promise<TFile[]> {
		const allFiles = await this.getAllNotes();
		const filesWithTags: TFile[] = [];

		for (const file of allFiles) {
			const content = await this.getNoteContent(file);
			const hasAllTags = tags.every(tag => 
				content.includes(`#${tag}`) || content.includes(`tag: ${tag}`)
			);
			
			if (hasAllTags) {
				filesWithTags.push(file);
			}
		}

		return filesWithTags;
	}

	/**
	 * Extract tags from note content
	 */
	extractTags(content: string): string[] {
		const tags: string[] = [];
		
		// Extract inline tags (#tag)
		const inlineTagRegex = /#([a-zA-Z0-9_-]+)/g;
		let match;
		while ((match = inlineTagRegex.exec(content)) !== null) {
			tags.push(match[1]);
		}

		// Extract YAML frontmatter tags
		const yamlRegex = /^---\s*\n([\s\S]*?)\n---/;
		const yamlMatch = content.match(yamlRegex);
		if (yamlMatch) {
			const yamlContent = yamlMatch[1];
			const tagLineRegex = /tags?:\s*\[([^\]]+)\]/;
			const tagLineMatch = yamlContent.match(tagLineRegex);
			if (tagLineMatch) {
				const yamlTags = tagLineMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
				tags.push(...yamlTags);
			}
		}

		// Return unique tags
		return [...new Set(tags)];
	}

	/**
	 * Get all unique tags across all notes
	 */
	async getAllTags(): Promise<Map<string, number>> {
		const tagCounts = new Map<string, number>();
		const allFiles = await this.getAllNotes();

		for (const file of allFiles) {
			const content = await this.getNoteContent(file);
			const tags = this.extractTags(content);
			
			tags.forEach(tag => {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			});
		}

		return tagCounts;
	}
}
