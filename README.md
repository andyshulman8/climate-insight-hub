# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0ecdd009-77af-4f58-8818-fb62d2b7d9e3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0ecdd009-77af-4f58-8818-fb62d2b7d9e3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## News API setup (optional)

To enable live news fetching (recommended), create a `.env` file in the project root with a NewsAPI.org key:

```env
# in project root
VITE_NEWS_API_KEY=your_newsapi_key_here
```

If `VITE_NEWS_API_KEY` is present, the app will query NewsAPI.org for recent climate/sustainability articles using the query:

```
(sustainability OR climate) OR ((sustainability OR climate) AND news)
```

When performing user keyword searches, the app will append the user's keywords to the query and allow switching sort between `Recent` and `Relevance` (if the provider supports it). If no API key is provided or API calls fail, the app falls back to local sample articles.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0ecdd009-77af-4f58-8818-fb62d2b7d9e3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
