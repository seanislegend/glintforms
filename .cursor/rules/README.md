# Glint project cursor rules

This directory contains the cursor rules for the Glint project, organised by concern. These rules follow best practices for creating effective AI coding guidelines.

## High-level overview

These rules are designed to ensure consistent, maintainable, and high-quality code across the Glint project. Each rule file focuses on a specific area of development and provides comprehensive guidelines, patterns, examples, and verification steps.

## Rule files

### Core development
- **[writing.mdc](./writing.mdc)** - Writing style and tone guidelines
- **[react.mdc](./react.mdc)** - React component development patterns
- **[typescript.mdc](./typescript.mdc)** - TypeScript configuration and patterns
- **[ui.mdc](./ui.mdc)** - UI building and design system
- **[forms.mdc](./forms.mdc)** - Form handling and validation

### Architecture and patterns
- **[state-management.mdc](./state-management.mdc)** - State management patterns
- **[apis.mdc](./apis.mdc)** - APIs and data fetching
- **[database.mdc](./database.mdc)** - Database and ORM patterns
- **[nextjs.mdc](./nextjs.mdc)** - Next.js App Router patterns

### Quality and tooling
- **[testing.mdc](./testing.mdc)** - Testing patterns and tools
- **[code-quality.mdc](./code-quality.mdc)** - Code quality and tooling
- **[performance.mdc](./performance.mdc)** - Performance optimisation
- **[security.mdc](./security.mdc)** - Security considerations and authentication

### Infrastructure
- **[css.mdc](./css.mdc)** - CSS and Tailwind styling
- **[environment.mdc](./environment.mdc)** - Environment and configuration
- **[development.mdc](./development.mdc)** - Development workflow
- **[project-structure.mdc](./project-structure.md)** - Project structure and organisation

## Rule structure

Each rule file follows a consistent structure:

1. **High-level overview** - Clear description of what the AI should achieve
2. **Essential code elements** - Critical requirements that must always be included
3. **Core patterns** - Established patterns and conventions
4. **Example patterns** - Detailed code examples with explanations
5. **Deprecated patterns** - Explicit examples of what NOT to do
6. **Common pitfalls and solutions** - Real-world problems and their solutions
7. **Verification steps** - Specific checks the AI must perform

## Key principles

1. **Type safety first** - Always prioritise type safety with TypeScript
2. **Consistency** - Follow consistent patterns throughout the codebase
3. **Performance** - Consider performance implications in all decisions
4. **Security** - Implement proper security measures
5. **Maintainability** - Write code that is easy to maintain and understand
6. **Accessibility** - Ensure all components are accessible
7. **British English** - Use British English spelling and terminology

## Usage

These rules are designed to be used with Cursor IDE to maintain consistency across the Glint project. The AI will automatically apply relevant rules based on the context and file types being worked with.

### Rule types

- **Always apply** - Rules that apply to all contexts (e.g., writing style)
- **Auto attached** - Rules that apply to specific file types (e.g., TypeScript files)
- **Manual** - Rules that require explicit attachment

## Best practices for using these rules

1. **Start with the overview** - Always read the high-level overview first
2. **Follow the patterns** - Use the established patterns and examples
3. **Avoid deprecated patterns** - Never use the explicitly marked deprecated patterns
4. **Verify your work** - Always complete the verification steps
5. **Consider edge cases** - Think about error handling and edge cases
6. **Test thoroughly** - Test your code with the provided verification steps

## Contributing

When updating these rules:

1. Follow the established structure
2. Include clear examples and counter-examples
3. Add verification steps for new patterns
4. Update the README if adding new rule files
5. Test the rules with various prompts to ensure they work correctly
