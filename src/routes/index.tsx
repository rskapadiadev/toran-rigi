import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
    return <main className="p-10 font-serif text-3xl">Toran</main>;
}
