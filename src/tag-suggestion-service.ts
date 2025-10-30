import { App } from 'obsidian';
import { NoteRetriever } from './note-retriever';

interface RAGVectorDBSettings {
	enableAutoTagging: boolean;
	enableVectorDB: boolean;
	similarityThreshold: number;
	maxSuggestions: number;
}

export class TagSuggestionService {
	private app: App;
	private settings: RAGVectorDBSettings;
	private noteRetriever: NoteRetriever;
	private tagCache: Map<string, number> | null = null;
	private lastCacheUpdate: number = 0;
	private readonly CACHE_TTL = 300000; // 5 minutes

	constructor(app: App, settings: RAGVectorDBSettings) {
		this.app = app;
		this.settings = settings;
		this.noteRetriever = new NoteRetriever(app);
	}

	/**
	 * Suggest tags for a given note content
	 */
	async suggestTags(content: string, maxSuggestions: number = 5): Promise<string[]> {
		// Update tag cache if needed
		await this.updateTagCache();

		// Extract existing tags from content
		const existingTags = this.noteRetriever.extractTags(content);

		// Get all tags with their frequencies
		const allTags = this.tagCache || new Map<string, number>();

		// Extract keywords from content
		const keywords = this.extractKeywords(content);

		// Score tags based on multiple factors
		const tagScores = new Map<string, number>();

		for (const [tag, frequency] of allTags.entries()) {
			// Skip tags that already exist in the note
			if (existingTags.includes(tag)) {
				continue;
			}

			let score = 0;

			// Factor 1: Frequency in vault (normalized)
			score += Math.log(frequency + 1) * 0.3;

			// Factor 2: Similarity to content keywords
			const keywordSimilarity = this.calculateKeywordSimilarity(tag, keywords);
			score += keywordSimilarity * 0.5;

			// Factor 3: Co-occurrence with existing tags
			if (existingTags.length > 0) {
				const cooccurrence = await this.calculateCooccurrence(tag, existingTags);
				score += cooccurrence * 0.2;
			}

			tagScores.set(tag, score);
		}

		// Sort tags by score and return top suggestions
		const suggestions = Array.from(tagScores.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, maxSuggestions)
			.map(([tag, _]) => tag);

		return suggestions;
	}

	/**
	 * Update the tag cache from all notes
	 */
	private async updateTagCache(): Promise<void> {
		const now = Date.now();
		if (this.tagCache && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
			return;
		}

		this.tagCache = await this.noteRetriever.getAllTags();
		this.lastCacheUpdate = now;
	}

	/**
	 * Extract keywords from content
	 */
	private extractKeywords(content: string): string[] {
		// Remove YAML frontmatter
		content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

		// Remove markdown formatting
		content = content
			.replace(/[#*_~`]/g, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.toLowerCase();

		// Split into words
		const words = content.split(/\s+/);

		// Common stop words to filter out
		const stopWords = new Set([
			'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
			'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
			'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
			'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
		]);

		// Filter and count word frequencies
		const wordFreq = new Map<string, number>();
		words.forEach(word => {
			const cleaned = word.replace(/[^a-z0-9]/g, '');
			if (cleaned.length > 3 && !stopWords.has(cleaned)) {
				wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
			}
		});

		// Return top keywords
		return Array.from(wordFreq.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 20)
			.map(([word, _]) => word);
	}

	/**
	 * Calculate similarity between a tag and content keywords
	 */
	private calculateKeywordSimilarity(tag: string, keywords: string[]): number {
		const tagLower = tag.toLowerCase();
		let similarity = 0;

		// Check for exact matches
		if (keywords.includes(tagLower)) {
			return 1.0;
		}

		// Check for partial matches
		for (const keyword of keywords) {
			if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
				similarity = Math.max(similarity, 0.5);
			}
		}

		// Check for semantic similarity (simplified)
		for (const keyword of keywords) {
			const distance = this.levenshteinDistance(tagLower, keyword);
			const maxLen = Math.max(tagLower.length, keyword.length);
			const sim = 1 - (distance / maxLen);
			if (sim > 0.7) {
				similarity = Math.max(similarity, sim * 0.3);
			}
		}

		return similarity;
	}

	/**
	 * Calculate co-occurrence score for a tag with existing tags
	 */
	private async calculateCooccurrence(tag: string, existingTags: string[]): Promise<number> {
		// This is a simplified implementation
		// In a full implementation, you would track tag co-occurrences across notes
		
		const allFiles = await this.noteRetriever.getAllNotes();
		let cooccurrenceCount = 0;
		let totalTagOccurrences = 0;

		for (const file of allFiles) {
			const content = await this.noteRetriever.getNoteContent(file);
			const fileTags = this.noteRetriever.extractTags(content);

			if (fileTags.includes(tag)) {
				totalTagOccurrences++;
				
				// Check if any existing tags are also in this file
				const hasExistingTag = existingTags.some(existingTag => 
					fileTags.includes(existingTag)
				);
				
				if (hasExistingTag) {
					cooccurrenceCount++;
				}
			}
		}

		return totalTagOccurrences > 0 ? cooccurrenceCount / totalTagOccurrences : 0;
	}

	/**
	 * Calculate Levenshtein distance between two strings
	 */
	private levenshteinDistance(str1: string, str2: string): number {
		const matrix: number[][] = [];

		for (let i = 0; i <= str2.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= str1.length; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= str2.length; i++) {
			for (let j = 1; j <= str1.length; j++) {
				if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					matrix[i][j] = Math.min(
						matrix[i - 1][j - 1] + 1,
						matrix[i][j - 1] + 1,
						matrix[i - 1][j] + 1
					);
				}
			}
		}

		return matrix[str2.length][str1.length];
	}

	/**
	 * Get most frequently used tags
	 */
	async getMostUsedTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
		await this.updateTagCache();
		
		if (!this.tagCache) {
			return [];
		}

		return Array.from(this.tagCache.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
			.map(([tag, count]) => ({ tag, count }));
	}
}
