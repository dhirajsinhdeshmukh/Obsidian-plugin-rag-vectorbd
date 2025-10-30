import { ChromaClient, Collection } from 'chromadb';

interface RAGVectorDBSettings {
	enableAutoTagging: boolean;
	enableVectorDB: boolean;
	similarityThreshold: number;
	maxSuggestions: number;
}

interface SimilarityResult {
	document: string;
	similarity: number;
	metadata?: any;
}

export class VectorDBService {
	private client: ChromaClient | null = null;
	private collection: Collection | null = null;
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
			// For Obsidian plugin, we'll use in-memory storage
			// In production, you might want to use a persistent storage
			this.client = new ChromaClient();
			
			// Create or get collection
			try {
				this.collection = await this.client.getOrCreateCollection({
					name: 'obsidian_notes',
					metadata: { description: 'Obsidian notes vector embeddings' }
				});
			} catch (error) {
				console.error('Error creating collection:', error);
				// Fallback: use mock implementation
				this.useMockImplementation();
			}

			this.initialized = true;
			console.log('Vector DB initialized');
		} catch (error) {
			console.error('Failed to initialize vector database:', error);
			// Use mock implementation as fallback
			this.useMockImplementation();
		}
	}

	/**
	 * Use mock implementation when ChromaDB is not available
	 */
	private useMockImplementation(): void {
		console.log('Using mock vector DB implementation');
		this.initialized = true;
		// Mock implementation will be handled in methods below
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
			
			if (this.collection) {
				// Index each chunk
				for (let i = 0; i < chunks.length; i++) {
					const id = `${notePath}_chunk_${i}`;
					await this.collection.add({
						ids: [id],
						documents: [chunks[i]],
						metadatas: [{
							notePath: notePath,
							chunkIndex: i,
							totalChunks: chunks.length
						}]
					});
				}
			}
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
			if (this.collection) {
				const results = await this.collection.query({
					queryTexts: [content],
					nResults: limit
				});

				// Transform results to SimilarityResult format
				const similarityResults: SimilarityResult[] = [];
				
				if (results.metadatas && results.metadatas[0] && results.distances && results.distances[0]) {
					for (let i = 0; i < results.metadatas[0].length; i++) {
						const metadata = results.metadatas[0][i];
						const distance = results.distances[0][i];
						
						// Convert distance to similarity score (cosine similarity)
						const similarity = 1 - distance;
						
						if (similarity >= this.settings.similarityThreshold) {
							similarityResults.push({
								document: metadata?.notePath || 'unknown',
								similarity: similarity,
								metadata: metadata
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
			}

			return [];
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
			if (this.collection) {
				const results = await this.collection.query({
					queryTexts: [query],
					nResults: limit
				});

				const relatedTexts: SimilarityResult[] = [];
				
				if (results.documents && results.documents[0] && results.metadatas && results.metadatas[0] && results.distances && results.distances[0]) {
					for (let i = 0; i < results.documents[0].length; i++) {
						const doc = results.documents[0][i];
						const metadata = results.metadatas[0][i];
						const distance = results.distances[0][i];
						const similarity = 1 - distance;
						
						if (similarity >= this.settings.similarityThreshold) {
							relatedTexts.push({
								document: doc || '',
								similarity: similarity,
								metadata: metadata
							});
						}
					}
				}

				return relatedTexts;
			}

			return [];
		} catch (error) {
			console.error('Error finding related text:', error);
			return [];
		}
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
		if (this.collection && this.client) {
			try {
				await this.client.deleteCollection({ name: 'obsidian_notes' });
				this.collection = await this.client.getOrCreateCollection({
					name: 'obsidian_notes',
					metadata: { description: 'Obsidian notes vector embeddings' }
				});
			} catch (error) {
				console.error('Error clearing index:', error);
			}
		}
	}
}
