'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudUpload, Download, Eraser, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTransactions } from '@/context/transactions-context';
import { CURRENCIES } from '@/lib/constants';
import { downloadCsv } from '@/utils/csv';
import { toInputDate } from '@/utils/dates';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    transactions,
    settings,
    legacyLocalCount,
    setCurrency,
    loadSampleData,
    clearAllData,
    migrateLocalData,
  } = useTransactions();

  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(name: string, action: () => Promise<void>) {
    setBusy(name);
    try {
      await action();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="eyebrow mb-1">Housekeeping</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Settings
        </h1>
      </div>

      <div className="space-y-4">
        {legacyLocalCount > 0 && (
          <Card className="border-gold">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Entries found on this device
              </CardTitle>
              <CardDescription>
                {legacyLocalCount}{' '}
                {legacyLocalCount === 1 ? 'entry' : 'entries'} from before your
                ledger moved to the cloud are still stored in this browser.
                Bring them into your account so every device can see them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={busy !== null}
                onClick={() => run('migrate', migrateLocalData)}
              >
                <CloudUpload />
                {busy === 'migrate' ? 'Importing…' : 'Import to my account'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Account</CardTitle>
            <CardDescription>
              Signed in as{' '}
              <span className="text-foreground">{user?.email}</span> — your
              ledger follows this account on every device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
            >
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Currency</CardTitle>
            <CardDescription>
              Used to display every amount in the ledger. Stored per device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Label className="sr-only">Currency</Label>
              <Select value={settings.currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Your data</CardTitle>
            <CardDescription>
              Stored securely in your Supabase database, private to your
              account. Export a copy any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={transactions.length === 0}
              onClick={() =>
                downloadCsv(
                  transactions,
                  `transactions-${toInputDate(new Date())}.csv`
                )
              }
            >
              <Download /> Export CSV
            </Button>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => run('sample', loadSampleData)}
            >
              <Sparkles />
              {busy === 'sample' ? 'Loading…' : 'Load sample data'}
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={transactions.length === 0 || busy !== null}
              onClick={() => setConfirmClear(true)}
            >
              <Eraser /> Clear all data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Install as an app</CardTitle>
            <CardDescription>
              Ledger can live on your home screen like a native app.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">On your phone:</strong> open
              this site in your browser, then choose{' '}
              <em>Add to Home Screen</em> (Safari share menu on iOS, browser
              menu on Android).
            </p>
            <p className="mt-2">
              <strong className="text-foreground">On desktop:</strong> look for
              the install icon in the address bar of Chrome or Edge.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Burn the book?
            </DialogTitle>
            <DialogDescription>
              All {transactions.length} entries will be permanently deleted from
              your account and categories reset to defaults. Consider exporting
              a CSV first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy !== null}
              onClick={async () => {
                await run('clear', clearAllData);
                setConfirmClear(false);
              }}
            >
              {busy === 'clear' ? 'Deleting…' : 'Delete everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
