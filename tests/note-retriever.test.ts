import { NoteRetriever } from '../src/note-retriever';
import { App } from 'obsidian';

describe('NoteRetriever', () => {
	describe('extractTags', () => {
		let retriever: NoteRetriever;

		beforeEach(() => {
			// Mock App object
			const mockApp = {
				vault: {
					getMarkdownFiles: jest.fn(),
					read: jest.fn(),
				}
			} as unknown as App;
			retriever = new NoteRetriever(mockApp);
		});

		test('should extract inline tags', () => {
			const content = 'This is a note with #tag1 and #tag2';
			const tags = retriever.extractTags(content);
			expect(tags).toContain('tag1');
			expect(tags).toContain('tag2');
			expect(tags.length).toBe(2);
		});

		test('should extract YAML frontmatter tags', () => {
			const content = `---
tags: [tag1, tag2, tag3]
---
This is the content`;
			const tags = retriever.extractTags(content);
			expect(tags).toContain('tag1');
			expect(tags).toContain('tag2');
			expect(tags).toContain('tag3');
		});

		test('should extract both inline and YAML tags', () => {
			const content = `---
tags: [yaml-tag]
---
This is a note with #inline-tag`;
			const tags = retriever.extractTags(content);
			expect(tags).toContain('yaml-tag');
			expect(tags).toContain('inline-tag');
		});

		test('should return unique tags', () => {
			const content = 'This has #duplicate and #duplicate tags';
			const tags = retriever.extractTags(content);
			expect(tags.filter(t => t === 'duplicate').length).toBe(1);
		});

		test('should handle content with no tags', () => {
			const content = 'This is a note without any tags';
			const tags = retriever.extractTags(content);
			expect(tags.length).toBe(0);
		});
	});
});
