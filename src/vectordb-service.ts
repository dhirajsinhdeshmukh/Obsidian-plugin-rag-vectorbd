interface RAGVectorDBSettings {
	enableAutoTagging: boolean;
	enableVectorDB: boolean;
	similarityThreshold: number;
	maxSuggestions: number;
}

interface SimilarityResult {
	document: string;
	similarity: number;
	metadata?: Record<string, string | number>;
}

interface IndexedDocument {
	id: string;
	notePath: string;
	content: string;
	chunks: string[];
	chunkIndex: number;
	totalChunks: number;
}

export class VectorDBService {
	private documents: Map<string, IndexedDocument[]> = new Map();
	private settings: RAGVectorDBSettings;
	private initialized: boolean = false;

	constructor(settings: RAGVectorDBSettings) {
		this.settings = settings;
	}

	/**
	 * Initialize the vector database connection
	 */
	async initialize(): Promise<void> {
		try {
			// Initialize in-memory storage for browser environment
			this.documents = new Map();
			this.initialized = true;
			console.log('Vector DB initialized (in-memory implementation)');
		} catch (error) {
			console.error('Failed to initialize vector database:', error);
			this.initialized = true;
		}
	}

	/**
	 * Index a note in the vector database
	 */
	async indexNote(notePath: string, content: string): Promise<void> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			// Split content into chunks for better granularity
			const chunks = this.chunkText(content);
			
			const indexedDocs: IndexedDocument[] = [];
			for (let i = 0; i < chunks.length; i++) {
				indexedDocs.push({
					id: `${notePath}_chunk_${i}`,
					notePath: notePath,
					content: chunks[i],
					chunks: chunks,
					chunkIndex: i,
					totalChunks: chunks.length
				});
			}
			
			this.documents.set(notePath, indexedDocs);
		} catch (error) {
			console.error('Error indexing note:', error);
		}
	}

	/**
	 * Find similar notes based on content
	 */
	async findSimilar(content: string, limit: number = 5): Promise<SimilarityResult[]> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			const similarityResults: SimilarityResult[] = [];
			
			// Calculate similarity with all indexed documents
			for (const [notePath, docs] of this.documents.entries()) {
				for (const doc of docs) {
					const similarity = this.calculateTextSimilarity(content, doc.content);
					
					if (similarity >= this.settings.similarityThreshold) {
						similarityResults.push({
							document: notePath,
							similarity: similarity,
							metadata: {
								notePath: notePath,
								chunkIndex: doc.chunkIndex,
								totalChunks: doc.totalChunks
							}
						});
					}
				}
			}

			// Group by document and get highest similarity
			const grouped = new Map<string, SimilarityResult>();
			similarityResults.forEach(result => {
				const existing = grouped.get(result.document);
				if (!existing || result.similarity > existing.similarity) {
					grouped.set(result.document, result);
				}
			});

			return Array.from(grouped.values())
				.sort((a, b) => b.similarity - a.similarity)
				.slice(0, limit);
		} catch (error) {
			console.error('Error finding similar notes:', error);
			return [];
		}
	}

	/**
	 * Find related text across all notes
	 */
	async findRelatedText(query: string, limit: number = 10): Promise<SimilarityResult[]> {
		if (!this.initialized) {
			await this.initialize();
		}

		try {
			const relatedTexts: SimilarityResult[] = [];
			
			for (const [notePath, docs] of this.documents.entries()) {
				for (const doc of docs) {
					const similarity = this.calculateTextSimilarity(query, doc.content);
					
					if (similarity >= this.settings.similarityThreshold) {
						relatedTexts.push({
							document: doc.content,
							similarity: similarity,
							metadata: {
								notePath: notePath,
								chunkIndex: doc.chunkIndex
							}
						});
					}
				}
			}

			return relatedTexts
				.sort((a, b) => b.similarity - a.similarity)
				.slice(0, limit);
		} catch (error) {
			console.error('Error finding related text:', error);
			return [];
		}
	}

	/**
	 * Calculate text similarity using TF-IDF and cosine similarity
	 */
	private calculateTextSimilarity(text1: string, text2: string): number {
		// Normalize and tokenize
		const tokens1 = this.tokenize(text1.toLowerCase());
		const tokens2 = this.tokenize(text2.toLowerCase());
		
		// Create frequency maps
		const freq1 = new Map<string, number>();
		const freq2 = new Map<string, number>();
		
		tokens1.forEach(token => freq1.set(token, (freq1.get(token) || 0) + 1));
		tokens2.forEach(token => freq2.set(token, (freq2.get(token) || 0) + 1));
		
		// Get all unique tokens
		const allTokens = new Set([...tokens1, ...tokens2]);
		
		// Calculate cosine similarity
		let dotProduct = 0;
		let magnitude1 = 0;
		let magnitude2 = 0;
		
		for (const token of allTokens) {
			const val1 = freq1.get(token) || 0;
			const val2 = freq2.get(token) || 0;
			
			dotProduct += val1 * val2;
			magnitude1 += val1 * val1;
			magnitude2 += val2 * val2;
		}
		
		if (magnitude1 === 0 || magnitude2 === 0) {
			return 0;
		}
		
		return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
	}

	/**
	 * Tokenize text into words
	 */
	private tokenize(text: string): string[] {
		return text
			.replace(/[^\w\s]/g, ' ')
			.split(/\s+/)
			.filter(token => token.length > 2);
	}

	/**
	 * Chunk text into smaller pieces for better embeddings
	 */
	private chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
		const chunks: string[] = [];
		const sentences = text.split(/[.!?]\s+/);
		let currentChunk = '';

		for (const sentence of sentences) {
			if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
				chunks.push(currentChunk.trim());
				// Add overlap
				const words = currentChunk.split(' ');
				currentChunk = words.slice(-overlap).join(' ') + ' ' + sentence;
			} else {
				currentChunk += (currentChunk ? ' ' : '') + sentence;
			}
		}

		if (currentChunk) {
			chunks.push(currentChunk.trim());
		}

		return chunks.length > 0 ? chunks : [text];
	}

	/**
	 * Clear all indexed notes
	 */
	async clearIndex(): Promise<void> {
		try {
			this.documents.clear();
			console.log('Index cleared');
		} catch (error) {
			console.error('Error clearing index:', error);
		}
	}
}
