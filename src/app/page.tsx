import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            My Expenses Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Take control of your finances. Track, analyze, and optimize your spending habits with ease.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>📊 Track Expenses</CardTitle>
              <CardDescription>
                Record all your daily expenses in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quickly add expenses with details like category, amount, and payment method. Never lose track of where your money goes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Set Budgets</CardTitle>
              <CardDescription>
                Create category-wise budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set spending limits for different categories and get insights when you&apos;re approaching your budget limits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Analyze Trends</CardTitle>
              <CardDescription>
                Understand your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize your expenses with charts and reports. Make informed decisions about your spending.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started →
            </Button>
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui</p>
        </div>
      </div>
    </main>
  );
}
