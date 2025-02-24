# GoHighLevel Integration MVP

This is a Next.js application that integrates with GoHighLevel API to create sub-accounts and view opportunities.

## Features

- Create sub-accounts with detailed information
- View opportunities in a clean, organized dashboard
- Modern UI with Tailwind CSS
- Form validation with Zod
- Type-safe API integration

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- GoHighLevel API key

### Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_GHL_API_KEY=your_api_key_here
NEXT_PUBLIC_GHL_BASE_URL=https://services.leadconnectorhq.com
```

Replace `your_api_key_here` with your actual GoHighLevel API key.

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/src/components` - React components
- `/src/lib` - API utilities and types
- `/src/app` - Next.js app router pages

## API Integration

This project uses the GoHighLevel API for:
- Creating sub-accounts (`POST /locations/v3`)
- Fetching opportunities (`GET /opportunities/v1`)

For more information about the API, visit the [GoHighLevel API documentation](https://highlevel.stoplight.io/docs/integrations/).

## Technologies Used

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://github.com/colinhacks/zod)
- [Axios](https://axios-http.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
