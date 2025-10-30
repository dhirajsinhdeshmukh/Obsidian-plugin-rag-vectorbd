# Contributing to RAG Vector Database Plugin

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Obsidian-plugin-rag-vectorbd.git
   cd Obsidian-plugin-rag-vectorbd
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Before Making Changes

1. Check existing issues and PRs to avoid duplicates
2. Open an issue to discuss major changes
3. Read the [Development Guide](DEVELOPMENT.md)

### Making Changes

1. **Write Clean Code**
   - Follow existing code style
   - Use TypeScript strict mode
   - Add JSDoc comments for public APIs

2. **Add Tests**
   - Write unit tests for new features
   - Update existing tests if needed
   - Ensure all tests pass: `npm test`

3. **Update Documentation**
   - Update README.md if adding features
   - Update DEVELOPMENT.md for dev changes
   - Add inline comments for complex logic

4. **Run Quality Checks**
   ```bash
   # Lint code
   npm run lint
   
   # Run tests
   npm test
   
   # Build plugin
   npm run build
   ```

### Commit Guidelines

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add similarity threshold setting"
git commit -m "Fix tag extraction for YAML frontmatter"
git commit -m "Update README with installation instructions"

# Bad
git commit -m "fix bug"
git commit -m "updates"
git commit -m "wip"
```

**Commit Message Format:**
```
<type>: <short description>

<optional detailed description>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Submitting a Pull Request

1. **Push Your Changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Checklist**
   - [ ] Tests added/updated and passing
   - [ ] Linter passes without errors
   - [ ] Build succeeds
   - [ ] Documentation updated
   - [ ] No breaking changes (or clearly noted)
   - [ ] PR description explains the change

4. **Code Review**
   - Address review comments promptly
   - Push additional commits if needed
   - Be open to feedback

## Types of Contributions

### Bug Reports

**Before submitting:**
- Check if the bug is already reported
- Try to reproduce with latest version
- Gather relevant information

**Include in your report:**
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Obsidian version, plugin version)
- Screenshots/logs if applicable

**Template:**
```markdown
## Bug Description
[Clear description]

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Obsidian Version: [e.g., 1.4.0]
- Plugin Version: [e.g., 1.0.0]

## Additional Context
[Screenshots, logs, etc.]
```

### Feature Requests

**Before submitting:**
- Check if feature is already requested
- Consider if it fits the plugin's scope

**Include in your request:**
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (if any)
- Alternatives considered

**Template:**
```markdown
## Feature Description
[Clear description]

## Use Case
[Why is this feature needed?]

## Proposed Implementation
[Optional: How could this work?]

## Alternatives
[Optional: What alternatives did you consider?]
```

### Code Contributions

We welcome contributions in these areas:

1. **Core Features**
   - Vector database improvements
   - Tag suggestion enhancements
   - Note retrieval optimizations

2. **Tests**
   - Increase test coverage
   - Add integration tests
   - Improve test quality

3. **Documentation**
   - Fix typos and errors
   - Add examples
   - Improve clarity

4. **Bug Fixes**
   - Fix reported bugs
   - Improve error handling
   - Edge case handling

5. **Performance**
   - Optimize algorithms
   - Reduce memory usage
   - Improve speed

### Documentation Contributions

Documentation improvements are always welcome:
- Fix typos and grammatical errors
- Add examples and use cases
- Improve clarity and organization
- Add diagrams or screenshots

## Development Guidelines

### Code Style

- **TypeScript**: Use strict mode, proper types
- **Formatting**: Consistent with existing code
- **Comments**: For complex logic, not obvious code
- **Naming**: Clear, descriptive names

### Testing

- **Unit Tests**: For all new features
- **Coverage**: Aim for >80%
- **Mocking**: Mock external dependencies
- **Edge Cases**: Test error conditions

### Performance

- **Efficiency**: Consider algorithm complexity
- **Memory**: Avoid memory leaks
- **Caching**: Cache expensive operations
- **Lazy Loading**: Load on-demand when possible

### Security

- **Input Validation**: Validate all user inputs
- **No External Calls**: Keep processing local
- **Dependencies**: Minimize external dependencies
- **Secrets**: Never commit secrets

## Review Process

1. **Initial Review**: Maintainers review within 1-2 weeks
2. **Feedback**: Address comments and questions
3. **Re-review**: Maintainers review updates
4. **Merge**: Once approved, PR is merged

## Release Process

Maintainers handle releases:

1. Update version in package.json
2. Run `npm version [patch|minor|major]`
3. Push tags: `git push --follow-tags`
4. GitHub Actions creates release
5. Update release notes

## Getting Help

- **Issues**: Open an issue for questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check README and DEVELOPMENT.md

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments (for major features)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this plugin better! 🎉
