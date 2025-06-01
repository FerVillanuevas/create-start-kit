# Create Start-Kit

A CLI tool to quickly scaffold projects from curated start-kit templates.

## Usage

```bash
# Using npx (recommended)
npx create-start-kit my-project

# Or install globally
npm install -g create-start-kit
create-start-kit my-project
```

## Features

- 🚀 Multiple template options
- 📦 Automatic dependency installation
- 🔧 Git repository initialization
- 💻 Interactive CLI prompts
- 🎨 Beautiful terminal output

## Available Templates

- **React + TypeScript**: React with TypeScript, Vite, and Tailwind CSS
- **Next.js + TypeScript**: Next.js with TypeScript, Tailwind CSS, and ESLint
- **Node.js + TypeScript**: Node.js with TypeScript, Express, and testing setup

## Command Line Options

```bash
create-start-kit [project-name] [options]

Options:
  -t, --template <template>  Template to use
  --no-install              Skip dependency installation
  --no-git                  Skip git initialization
  -h, --help                Display help for command
  -V, --version             Display version number
```

## Examples

```bash
# Interactive mode
npx create-start-kit

# Specify project name
npx create-start-kit my-awesome-project

# Use specific template
npx create-start-kit my-project --template react-ts

# Skip dependency installation
npx create-start-kit my-project --no-install

# Skip git initialization
npx create-start-kit my-project --no-git
```

## Development

```bash
# Clone the repository
git clone https://github.com/your-username/create-start-kit.git
cd create-start-kit

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Publishing

```bash
# Build the project
npm run build

# Publish to npm
npm publish
```

## License

MIT