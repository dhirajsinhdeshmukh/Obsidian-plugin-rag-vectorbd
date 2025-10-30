import { TagSuggestionService } from '../src/tag-suggestion-service';
import { App } from 'obsidian';

interface RAGVectorDBSettings {
	enableAutoTagging: boolean;
	enableVectorDB: boolean;
	similarityThreshold: number;
	maxSuggestions: number;
}

describe('TagSuggestionService', () => {
	let service: TagSuggestionService;
	let mockApp: App;
	let mockSettings: RAGVectorDBSettings;

	beforeEach(() => {
		mockApp = {
			vault: {
				getMarkdownFiles: jest.fn().mockReturnValue([]),
				read: jest.fn(),
			}
		} as unknown as App;

		mockSettings = {
			enableAutoTagging: true,
			enableVectorDB: true,
			similarityThreshold: 0.7,
			maxSuggestions: 5
		};

		service = new TagSuggestionService(mockApp, mockSettings);
	});

	describe('suggestTags', () => {
		test('should return empty array for empty content', async () => {
			const suggestions = await service.suggestTags('', 5);
			expect(Array.isArray(suggestions)).toBe(true);
		});

		test('should not suggest tags that already exist in content', async () => {
			const content = 'This is a note with #existing-tag';
			const suggestions = await service.suggestTags(content, 5);
			expect(suggestions).not.toContain('existing-tag');
		});
	});

	describe('getMostUsedTags', () => {
		test('should return array of tag objects', async () => {
			const mostUsed = await service.getMostUsedTags(10);
			expect(Array.isArray(mostUsed)).toBe(true);
		});

		test('should return limited number of tags', async () => {
			const limit = 5;
			const mostUsed = await service.getMostUsedTags(limit);
			expect(mostUsed.length).toBeLessThanOrEqual(limit);
		});
	});
});
