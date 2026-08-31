import { Link } from 'wouter';
import { Boxes, Briefcase, FileText, Users } from 'lucide-react';
import { useGetContentSummary } from '@workspace/api-client-react';
import { useDocumentMeta } from '@/lib/use-document-meta';

export function AdminDashboard() {
  useDocumentMeta('Overview', 'Content command centre for the Acquire 360 Ventures website.');
  const summary = useGetContentSummary({ query: { queryKey: ['/api/summary'] } });

  const stats = [
    ['Services', summary.data?.services, Boxes, '/admin/services'],
    ['Projects', summary.data?.projects, Briefcase, '/admin/projects'],
    ['Products', summary.data?.products, Boxes, '/admin/products'],
    ['Clients', summary.data?.clients, Users, '/admin/clients'],
    ['Enquiries', summary.data?.rfqs, FileText, '/admin/rfqs'],
  ] as const;

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">Management overview</p>
        <h1 className="mt-2 text-3xl font-bold text-[hsl(var(--primary))]">Content command centre</h1>
      </div>

      {summary.isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(([label, value, Icon, href]) => (
            <Link key={label} href={href} data-testid={`admin-stat-${label.toLowerCase()}`} className="block border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</p>
                <Icon size={18} className="text-[hsl(var(--secondary))]" />
              </div>
              <p className="mt-8 text-4xl font-semibold text-[hsl(var(--primary))]">{value ?? '—'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
