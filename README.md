# AI Chat Application

A screenshot analysis application powered by [OpenRouter](https://openrouter.ai), built with Next.js 15, TypeScript, and Tailwind CSS.

## Architecture

This application uses a **server-side API route** to securely communicate with OpenRouter's API. The API key is stored server-side and never exposed to the client. This means:

- **Secure API key handling** - Your API key remains private on the server
- **No data persistence** - Analysis results are not saved between sessions
- **Privacy-focused** - Your screenshots are processed server-side
- **Easy deployment** - Deploy to Vercel or any hosting provider that supports Next.js API routes

## Prerequisites

- Node.js 18+ or 20+
- npm or yarn package manager
- An OpenRouter account with an API key

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see [Environment Setup](#environment-setup) below)

## Environment Setup

### Local Development

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Get your OpenRouter API key:
   - Visit [https://openrouter.ai](https://openrouter.ai)
   - Sign up or log in
   - Navigate to your API keys section
   - Copy your API key

3. Edit `.env.local` and add your API key:

```env
OPENROUTER_API_KEY=your_actual_api_key_here
OPENROUTER_MODEL=meta-llama/llama-2-70b-chat
```

**Note:** These environment variables are server-side only and will not be exposed to the browser, keeping your API key secure.

### Production / Vercel Deployment

1. Push your repository to GitHub
2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your repository
   - Click "Import"
3. In the environment variables section, add:
   - Key: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key
   - Key: `OPENROUTER_MODEL`
   - Value: Your preferred model (e.g., `meta-llama/llama-2-70b-chat`)
4. Click "Deploy"

## Development

### Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

### Linting and Formatting

Check for code issues:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

Format code with Prettier:

```bash
npm run format
```

## Available Models

Visit [OpenRouter Models](https://openrouter.ai/docs/models) to see all available models. Some popular options:

- `meta-llama/llama-2-70b-chat` - Open source, free tier available
- `openai/gpt-4-turbo-preview` - GPT-4 with vision capabilities
- `mistralai/mistral-7b-instruct` - Lightweight, fast
- `anthropic/claude-3-opus` - Advanced reasoning capabilities

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Main page component
│   ├── globals.css         # Global styles with Tailwind
│   └── favicon.ico         # Application favicon
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.mjs     # PostCSS configuration
├── eslint.config.mjs      # ESLint configuration
├── .prettierrc             # Prettier configuration
└── package.json           # Project dependencies and scripts
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Linting:** ESLint 9
- **Formatting:** Prettier 3
- **API:** OpenRouter
- **Deployment:** Vercel (recommended)

## Important Notes

- **Server-Side API:** All API calls to OpenRouter are made server-side via Next.js API routes, keeping your API key secure and never exposed to the browser.
- **Rate Limiting:** Consider monitoring your OpenRouter API usage based on expected traffic
- **No Persistence:** Analysis results are not saved. Each screenshot analysis is independent
- **Security:** Environment variables without the `NEXT_PUBLIC_` prefix are only accessible server-side

## Troubleshooting

### Development server won't start

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### API key errors

- Verify your API key is correct in `.env.local`
- Check that the key is not expired or revoked on OpenRouter
- Ensure the model name is valid: [https://openrouter.ai/docs/models](https://openrouter.ai/docs/models)

### Build failures

```bash
# Run linting to check for issues
npm run lint

# Check TypeScript
npx tsc --noEmit

# Fix issues automatically
npm run lint:fix
npm run format
```

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter API Reference](https://openrouter.ai/docs/api/chat)

## License

This project is open source and available under the MIT License.

## Support

For issues with:

- **This application:** Check the repository issues and documentation
- **OpenRouter:** Visit [OpenRouter Docs](https://openrouter.ai/docs) or contact their support
- **Next.js:** See [Next.js GitHub](https://github.com/vercel/next.js)
