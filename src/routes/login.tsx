import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from './dashboard';

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: "Iniciar Sesión — Kinder Togas" },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminDashboard,
});
