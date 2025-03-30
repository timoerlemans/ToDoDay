# GitHub Copilot Instructions

These instructions define the standards and practices that should be followed when working on this project.

## Package Management

- Always use PNPM for package management
- Never use NPM or Yarn
- Use exact versions for dependencies
- Include "preinstall": "npx only-allow pnpm" in package.json
- Use pnpm-workspace.yaml for monorepo structure
- Maintain a single `pnpm-lock.yaml` file
- Use strict version numbers

## Angular

- Use **Angular v19** for all frontend development
- Use strict type checking - avoid any type
- Use reactive forms instead of template-driven forms
- Use OnPush change detection strategy for better performance
- Use proper component composition with content projection
- Document all public methods, properties, and classes with TSDoc
- Follow English-only convention for all comments, variables, and UI text
- Use Angular signals for state management
- Use SCSS with BEM methodology for styling
- **Adopt the new template syntax** (@if, @for) instead of legacy \*ngIf and \*ngFor
- **Use destroyRef** instead of managing destruction manually with destroy$ subject or subscriptions
- **Use the new input() decorator** instead of the legacy @Input() decorator
- **Use the new output() decorator** instead of the legacy @Output() decorator
- **Add takeUntilDestroyed() operator** to every subscription
- **Use constructor-based injection** instead of inject() function
- **Use functional guards instead of class-based guards**, which are an exception on the `constructor-based injection` instruction.
- **Use Angular CLI to update** to a newer version of Angular when needed

## Code Structure

- Organize imports: Angular core first, third-party libraries second, local imports third
- Use barrel files (index.ts) for module exports
- **Use namespace imports** instead of relative paths (use @tododay with an alias pointing to projects/tododay/src/app)
- Implement lazy loading for feature modules
- Follow single responsibility principle for services
- **DO NOT USE STAND-ALONE COMPONENTS IN ANGULAR**
- **Store sensitive data and API keys in .env files**, avoid hard-coding credentials
- **Always use separate files** for templates (.html) and styles (.scss or .css) instead of inline definitions
- Consistently name files using kebab-case (todo-list.component.ts) and classes using PascalCase (TodoListComponent)
- Use Angular CLI commands to generate components, services, modules, and pipes for consistent project structure
- **Make sure the code and folder structure follows Angular conventions**

## Templates

- Use new Angular control flow syntax (@if, @for) instead of *ngIf, *ngFor
- Use proper semantic HTML elements
- Include proper accessibility attributes (aria-\*)
- Use ngTemplateOutlet for complex template composition
- Avoid complex logic in templates
- Use trackBy with @for
- **Make sure all texts are in English**

## Styling

- Use CSS variables for theming
- Implement responsive design
- Use a mobile-first design approach
- Use mixins for reusable styles
- Maintain proper color contrast for accessibility
- Use **Tailwind CSS** for utility-first styling
- Use **SCSS** for custom components and theming
- Use CSS variables where possible
- **Use BEM methodology in SCSS**

## Testing

- Use **Jest** for unit tests
- Use **Cypress** for end-to-end tests
- Aim for 80% minimum code coverage
- Write unit tests for components and services
- Test edge cases and error scenarios
- Mock dependencies in tests
- Implement integration tests for component interactions
- Include accessibility tests
- Test descriptions should be in English (not Dutch)

## Error Handling

- Define custom error classes
- Implement proper error handling in HTTP requests
- Show meaningful error messages
- Log errors appropriately
- Use error interceptors
- Handle async errors

## Security

- Avoid bypassSecurityTrustHtml unless necessary
- Validate user input
- Implement proper authentication and authorization
- Store sensitive data in environment variables
- Use HTTPS
- Implement CSRF protection
- Add security headers
- Use Angular's built-in sanitization

## Performance

- Unsubscribe from observables
- Use takeUntilDestroyed() for subscriptions
- Properly handle memory management
- Optimize bundle size
- Use OnPush change detection
- Implement trackBy functions
- Use async pipe for observables
- Implement lazy loading for feature modules

## Database/Backend

- Use **Supabase** for database and backend services
- Use type-safe database queries
- Implement row level security
- Use Supabase realtime features where relevant

## State Management

- Use **RxJS** for reactive programming
- Use **NgRx signals** for component state
- Use appropriate RxJS operators
- Implement proper cleanup
- Use signals for local state
- Implement proper state updates
- Handle loading and error states

## API Integration

- Use **OpenAI API** for AI functionality
- Implement rate limiting
- Error handling for API calls
- Caching where possible

## Accessibility

- Follow WCAG 2.1 accessibility guidelines
- Use semantic HTML elements
- Add aria-label to elements without visible text
- Ensure keyboard navigation works
- Always use labels with form controls
- Maintain minimum contrast ratio of 4.5:1

## Documentation

- Document all public methods, properties, and classes
- Include parameter types and return types
- Document inputs and outputs of components
- Document error handling and side effects
- Include usage examples

## Commits

- Use atomic commits with commitizen
- Use the following commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Structure commit messages with type(scope?), subject, body, and footer
- Use commit messages in English only
- **Make sure to do atomic commits using the commitizen naming convention**

## Code Style & Formatting

- **Use Prettier for opinionated code formatting**
- **Make sure Prettier and ESLint are configured to be compatible with each other**
- Follow consistent code style across the project
- Use meaningful variable and function names
- Prefer const over let when variables aren't reassigned
- Avoid magic numbers and strings, use constants instead

## Configuration Files

- ESLint config can be found in `.eslintrc.json` (in root AND in project)
- Prettier config can be found in `.prettierrc`
- TSConfig can be found at `tsconfig.*.json` at different levels of this project
- Tailwind can be found at `tailwind.config.json`
- Babelconfig can be found at `babel.config.js`
- PostCSS config can be found at `postcss.config.js`
- Cypress config can be found at `cypress.config.ts`
- dotenv config can be found at `.env`
- Angular config can be found at `angular.json`
- Jest config can be found at `jest.config.js`
