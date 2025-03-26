import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">This page is protected and only accessible to authenticated users.</p>
      <div className="bg-black/[.05] dark:bg-white/[.06] p-4 rounded-lg">
        <p>Your user ID: {userId}</p>
      </div>
    </div>
  );
} 