import { useListRfqs, useUpdateRfqStatus } from '@workspace/api-client-react';
import type { Rfq } from '@workspace/api-client-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useDocumentMeta } from '@/lib/use-document-meta';

const STATUSES = ['new', 'reviewing', 'quoted', 'closed'] as const;

function StatusBadge({ rfq, onChanged }: { rfq: Rfq; onChanged: () => void }) {
  const update = useUpdateRfqStatus();

  return (
    <Select
      value={rfq.status}
      onValueChange={(status) => {
        update.mutate(
          { id: rfq.id, data: { status: status as (typeof STATUSES)[number] } },
          {
            onSuccess: onChanged,
            onError: () => toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' }),
          },
        );
      }}
    >
      <SelectTrigger className="h-8 w-32" data-testid={`select-rfq-status-${rfq.id}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminRfqs() {
  useDocumentMeta('Enquiries', 'Review incoming request-for-quotation submissions.');
  const list = useListRfqs({ query: { queryKey: ['/api/rfqs'] } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">Enquiries</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Requests for quotation submitted through the public site.</p>
      </div>

      {list.isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : !list.data?.length ? (
        <div className="border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No enquiries yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.map((rfq) => (
                <TableRow key={rfq.id} data-testid={`row-rfq-${rfq.id}`}>
                  <TableCell className="font-semibold">{rfq.companyName}</TableCell>
                  <TableCell>
                    <div>{rfq.contactPerson}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{rfq.email} · {rfq.phone}</div>
                  </TableCell>
                  <TableCell>{rfq.product}</TableCell>
                  <TableCell>{rfq.quantity}</TableCell>
                  <TableCell className="text-xs">{new Date(rfq.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {rfq.file ? (
                      <a href={rfq.file} target="_blank" rel="noreferrer" className="text-xs font-bold text-[hsl(var(--secondary))]">
                        View file
                      </a>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge rfq={rfq} onChanged={() => list.refetch()} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
