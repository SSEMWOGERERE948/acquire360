import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight, ArrowUpRight, BarChart3, Building2, Check,
  ChevronDown, CircleAlert, Clock3, Compass, Factory, FileText, Globe2,
  Layers3, Mail, Menu, Minus, PackageSearch, Phone, Pin, Search, Send,
  Sparkles, Target, Truck, Users, X, Zap,
} from 'lucide-react';
import {
  useCreateRfq, useGetCompanyProfile, useGetContentSummary, useListClients,
  useListProducts, useListProjects, useListServices, useListTeamMembers,
  useUploadRfqAttachment,
} from '@workspace/api-client-react';
import type {
  Client, Product, Project, RfqInput, Service, TeamMember,
} from '@workspace/api-client-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import logo from '@assets/WhatsApp_Image_2026-08-26_at_20.15.45_1787765120573.jpeg';
import { AuthProvider } from '@/lib/auth-context';
import { useDocumentMeta } from '@/lib/use-document-meta';
import { apiErrorMessage } from '@/lib/api-error';
import { apiAssetUrl } from '@/lib/api-base-url';
import { AdminGuard } from '@/admin/shell';
import { AdminLogin } from '@/admin/login';
import { AdminDashboard } from '@/admin/dashboard';
import { AdminCompanyProfile } from '@/admin/company';
import { AdminServices } from '@/admin/services';
import { AdminProjects } from '@/admin/projects';
import { AdminProducts } from '@/admin/products';
import { AdminTeam } from '@/admin/team';
import { AdminClients } from '@/admin/clients';
import { AdminMedia } from '@/admin/media';
import { AdminRfqs } from '@/admin/rfqs';
import './index.css';

const queryClient = new QueryClient();
const navItems = [
  ['About', '/about'], ['Services', '/services'], ['Projects', '/projects'],
  ['Catalogue', '/products'], ['Contact', '/contact'],
];

function cx(...classes: Array<string | false | undefined>) { return classes.filter(Boolean).join(' '); }

function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1240px] px-5 md:px-8 lg:px-10', className)}>{children}</div>;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex shrink-0 items-center" data-testid="link-brand">
    <img src={logo} alt="Acquire 360 Ventures Ltd" className={cx('logo-img object-contain object-center', compact ? 'h-11 w-[142px]' : 'h-14 w-[180px]')} />
  </Link>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const phone = profile.data?.phone || '+256 784208202';
  return <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.92)] backdrop-blur-md">
    <PageContainer className="flex h-[76px] items-center justify-between">
      <BrandMark compact />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
        {navItems.map(([label, href]) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase()}`} className={cx('text-[12px] font-bold uppercase tracking-[.08em] transition-colors hover:text-[hsl(var(--secondary))]', location === href ? 'text-[hsl(var(--secondary))]' : 'text-[hsl(var(--foreground)/.68)]')}>{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-4 lg:flex">
        <a href={`tel:${phone.replace(/\s+/g, '')}`} data-testid="link-header-phone" className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground)/.65)] hover:text-[hsl(var(--secondary))]"><Phone size={14} /> {phone}</a>
        <Link href="/quote" data-testid="link-header-quote" className="group flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">Request a quote <ArrowUpRight size={14} className="line-arrow" /></Link>
      </div>
      <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu" onClick={() => setOpen(!open)} className="p-2 text-[hsl(var(--primary))] lg:hidden">{open ? <X size={24} /> : <Menu size={24} />}</button>
    </PageContainer>
    {open && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-4 lg:hidden">
      <nav className="flex flex-col gap-1" aria-label="Mobile navigation">{navItems.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} data-testid={`link-mobile-${label.toLowerCase()}`} className="border-b border-[hsl(var(--border)/.65)] py-3 text-sm font-bold text-[hsl(var(--foreground))]">{label}<ArrowUpRight className="float-right" size={16} /></Link>)}</nav>
      <Link href="/quote" onClick={() => setOpen(false)} data-testid="link-mobile-quote" className="mt-4 block bg-[hsl(var(--secondary))] px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary-foreground))]">Request a quote</Link>
    </div>}
  </header>;
}

function Footer() {
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const phone = profile.data?.phone || '+256 784208202';
  const email = profile.data?.email || 'procurement@acquire360ventures.com';
  return <footer className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
    <PageContainer className="grid gap-12 py-14 md:grid-cols-[1.4fr_.7fr_.7fr] md:py-20">
      <div>
        <BrandMark />
        <p className="mt-5 max-w-sm text-sm leading-7 text-[hsl(var(--primary-foreground)/.65)]">A dependable procurement partner for organisations moving important work forward across East Africa.</p>
        <div className="mt-7 flex flex-wrap gap-2"><span className="border border-[hsl(var(--primary-foreground)/.2)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary-foreground)/.7)]">Kampala, Uganda</span><span className="border border-[hsl(var(--primary-foreground)/.2)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary-foreground)/.7)]">East Africa</span></div>
      </div>
      <div><p className="eyebrow">Explore</p><div className="mt-5 flex flex-col gap-3">{navItems.slice(0, 4).map(([label, href]) => <Link key={href} href={href} data-testid={`link-footer-${label.toLowerCase()}`} className="text-sm text-[hsl(var(--primary-foreground)/.65)] transition-colors hover:text-[hsl(var(--accent))]">{label}</Link>)}</div></div>
      <div><p className="eyebrow">Start a conversation</p><div className="mt-5 space-y-3 text-sm text-[hsl(var(--primary-foreground)/.65)]"><a data-testid="link-footer-email" href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[hsl(var(--accent))]"><Mail size={15} /> {email}</a><a data-testid="link-footer-phone" href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-[hsl(var(--accent))]"><Phone size={15} /> {phone}</a><Link href="/quote" data-testid="link-footer-rfq" className="mt-5 inline-flex items-center gap-2 border-b border-[hsl(var(--secondary))] pb-1 font-bold text-[hsl(var(--primary-foreground))]">Send an enquiry <ArrowRight size={14} /></Link></div></div>
    </PageContainer>
    <div className="border-t border-[hsl(var(--primary-foreground)/.12)]"><PageContainer className="flex flex-col justify-between gap-2 py-5 text-[11px] text-[hsl(var(--primary-foreground)/.42)] md:flex-row"><span>© {new Date().getFullYear()} Acquire 360 Ventures Ltd.</span><span>Procurement with purpose. Delivery with precision.</span></PageContainer></div>
  </footer>;
}

function Shell({ children }: { children: ReactNode }) { return <div className="site-shell min-h-[100dvh]"><Header />{children}<Footer /></div>; }

function LoadingState({ label = 'Loading content' }: { label?: string }) {
  return <div className="grid gap-4 md:grid-cols-3" aria-label={label} data-testid="loading-state">{[1, 2, 3].map(i => <div key={i} className="h-52 animate-pulse border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.45)]" />)}</div>;
}
function ErrorState({ onRetry, label = 'We could not load this content.' }: { onRetry: () => void; label?: string }) {
  return <div className="border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.05)] p-7 text-center" data-testid="error-state"><CircleAlert className="mx-auto mb-3 text-[hsl(var(--destructive))]" size={24} /><p className="text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p><button type="button" data-testid="button-retry" onClick={onRetry} className="mt-4 border border-[hsl(var(--foreground)/.25)] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-[hsl(var(--secondary))]">Try again</button></div>;
}
function EmptyState({ label = 'No records have been published yet.' }: { label?: string }) { return <div className="border border-dashed border-[hsl(var(--border))] p-14 text-center" data-testid="empty-state"><Layers3 className="mx-auto mb-3 text-[hsl(var(--secondary))]" size={28} /><p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p></div>; }

function SectionIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end"><div><p className="eyebrow mb-4">{eyebrow}</p><h2 className="display max-w-2xl text-4xl font-semibold leading-[1.03] text-[hsl(var(--primary))] md:text-5xl">{title}</h2>{copy && <p className="mt-5 max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{copy}</p>}</div>{action}</div>;
}

function Hero() {
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const content = useGetContentSummary({ query: { queryKey: ['/api/summary'] } });
  const p = profile.data;
  return <section className="hero-wash relative overflow-hidden text-[hsl(var(--primary-foreground))]">
    <div className="absolute inset-0 opacity-[.09] topo" />
    <PageContainer className="relative grid min-h-[610px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
      <div className="fade-up">
        <div className="mb-7 flex items-center gap-3"><span className="h-px w-9 bg-[hsl(var(--secondary))]" /><span className="eyebrow text-[hsl(var(--accent))]">Procurement, supply & project support</span></div>
        <h1 className="display max-w-3xl text-5xl font-semibold leading-[.96] tracking-[-.06em] md:text-7xl lg:text-[5.5rem]">{p?.tagline || 'Acquire with confidence. Deliver with precision.'}</h1>
        <p className="mt-8 max-w-xl text-base leading-8 text-[hsl(var(--primary-foreground)/.72)]">We make sourcing feel calm, capable and exact for NGOs, institutions, contractors and growing businesses across East Africa.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/quote" data-testid="link-hero-quote" className="group inline-flex items-center justify-center gap-3 bg-[hsl(var(--secondary))] px-6 py-4 text-xs font-bold uppercase tracking-[.1em] text-[hsl(var(--secondary-foreground))] transition-transform hover:-translate-y-1">Tell us what you need <ArrowUpRight size={16} className="line-arrow" /></Link><Link href="/services" data-testid="link-hero-services" className="inline-flex items-center justify-center gap-2 border border-[hsl(var(--primary-foreground)/.25)] px-6 py-4 text-xs font-bold uppercase tracking-[.1em] text-[hsl(var(--primary-foreground)/.85)] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]">How we help <ArrowRight size={16} /></Link></div>
      </div>
      <div className="fade-up fade-up-2 relative hidden min-h-[400px] lg:block">
        <div className="absolute right-0 top-4 h-[370px] w-[370px] rounded-full border border-[hsl(var(--primary-foreground)/.18)]" /><div className="absolute right-10 top-14 h-[290px] w-[290px] rounded-full border border-[hsl(var(--secondary)/.55)]" /><div className="absolute right-[108px] top-[112px] h-[173px] w-[173px] rounded-full bg-[hsl(var(--secondary)/.16)]" />
        <div className="absolute right-[146px] top-[149px] flex h-24 w-24 items-center justify-center rounded-full border border-[hsl(var(--accent)/.65)] bg-[hsl(var(--primary)/.8)]"><Compass size={40} strokeWidth={1} className="text-[hsl(var(--accent))]" /></div>
        <div className="absolute bottom-4 left-12 max-w-[220px] border-l-2 border-[hsl(var(--secondary))] pl-5"><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[hsl(var(--accent))]">One partner. Clearer progress.</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--primary-foreground)/.62)]">From first brief to final delivery, every detail has an owner.</p></div>
      </div>
    </PageContainer>
    <div className="relative border-t border-[hsl(var(--primary-foreground)/.12)]"><PageContainer className="grid grid-cols-2 divide-x divide-[hsl(var(--primary-foreground)/.12)] py-6 sm:grid-cols-4">{[['services', content.data?.services ?? '—'], ['projects', content.data?.projects ?? '—'], ['products', content.data?.products ?? '—'], ['clients', content.data?.clients ?? '—']].map(([label, value]) => <div key={label} className="px-4 first:pl-0 sm:px-7"><p className="text-2xl font-semibold text-[hsl(var(--accent))]">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary-foreground)/.45)]">{label} in our network</p></div>)}</PageContainer></div>
  </section>;
}

function Home() {
  useDocumentMeta(
    'Procurement Company Uganda',
    'Acquire 360 Ventures Ltd delivers reliable procurement, supply and project support solutions across Uganda and East Africa.',
  );
  const services = useListServices({ query: { queryKey: ['/api/services'] } });
  const projects = useListProjects({ query: { queryKey: ['/api/projects'] } });
  const clients = useListClients({ query: { queryKey: ['/api/clients'] } });
  const featured = services.data?.filter(s => s.featured).slice(0, 3) ?? [];
  return <Shell><Hero />
    <main>
      <section className="bg-[hsl(var(--background))] py-20 md:py-28"><PageContainer><SectionIntro eyebrow="The Acquire approach" title="The right supply chain partner changes the whole project." copy="We combine local market intelligence, disciplined process and a genuinely responsive team to remove friction from getting good work done." action={<Link href="/about" data-testid="link-home-about" className="group inline-flex items-center gap-3 border-b border-[hsl(var(--primary))] pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Meet Acquire 360 <ArrowRight size={15} className="line-arrow" /></Link>} /><div className="grid gap-5 md:grid-cols-3">{[['01', 'Listen closely', 'We start with the brief, not the product list. Context creates better decisions.'], ['02', 'Source precisely', 'Our network reaches the right manufacturers, distributors and specialists.'], ['03', 'Deliver reliably', 'Clear updates, quality checks and accountable handover keep work moving.']].map(([num, title, body]) => <div key={num} className="border-t-2 border-[hsl(var(--primary))] pt-5"><span className="text-xs font-bold text-[hsl(var(--secondary))]">{num}</span><h3 className="mt-12 text-xl font-bold text-[hsl(var(--primary))]">{title}</h3><p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{body}</p></div>)}</div></PageContainer></section>
      <section className="bg-[hsl(var(--muted)/.5)] py-20 md:py-28"><PageContainer><SectionIntro eyebrow="What we do best" title="Capability that meets you where the work is." action={<Link href="/services" data-testid="link-home-services" className="group inline-flex items-center gap-3 border-b border-[hsl(var(--primary))] pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Explore all services <ArrowRight size={15} className="line-arrow" /></Link>} />{services.isLoading ? <LoadingState /> : services.isError ? <ErrorState onRetry={() => services.refetch()} /> : featured.length === 0 ? <EmptyState label="Our service capabilities will be published here shortly." /> : <div className="grid gap-5 md:grid-cols-3">{featured.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}</div>}</PageContainer></section>
      <section className="bg-[hsl(var(--primary))] py-20 text-[hsl(var(--primary-foreground))] md:py-28"><PageContainer><SectionIntro eyebrow="Selected work" title="Quietly making complex things possible." action={<Link href="/projects" data-testid="link-home-projects" className="group inline-flex items-center gap-3 border-b border-[hsl(var(--accent))] pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent))]">View project record <ArrowRight size={15} className="line-arrow" /></Link>} />{projects.isLoading ? <LoadingState /> : projects.isError ? <ErrorState onRetry={() => projects.refetch()} /> : (projects.data?.length ?? 0) === 0 ? <EmptyState label="Project stories are being prepared." /> : <ProjectStrip projects={projects.data?.slice(0, 2) ?? []} />}</PageContainer></section>
      <section className="topo border-t border-[hsl(var(--border))] py-20 md:py-24"><PageContainer><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow">Trusted across sectors</p><h2 className="display mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[hsl(var(--primary))] md:text-5xl">Good work is easier when everyone knows who to call.</h2></div><Link href="/quote" data-testid="link-home-cta" className="group flex w-fit items-center gap-3 bg-[hsl(var(--secondary))] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary-foreground))]">Start a conversation <ArrowUpRight size={16} className="line-arrow" /></Link></div>{clients.isLoading ? <div className="mt-12 h-14 animate-pulse bg-[hsl(var(--muted))]" /> : clients.isError ? <div className="mt-12"><ErrorState onRetry={() => clients.refetch()} /></div> : <ClientRail clients={clients.data ?? []} />}</PageContainer></section>
    </main>
  </Shell>;
}

function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <article className="group overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform hover:-translate-y-1" data-testid={`card-service-${service.id}`}>
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[hsl(var(--muted))]">
        {service.image ? (
          <img src={apiAssetUrl(service.image)} alt={service.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Zap size={34} className="text-[hsl(var(--secondary))]" />
        )}
        <span className="absolute right-4 top-4 bg-[hsl(var(--background)/.9)] px-2 py-1 text-[11px] font-bold text-[hsl(var(--secondary))]">
          0{(index ?? 0) + 1}
        </span>
      </div>
      <div className="relative min-h-[190px] p-7">
        <p className="eyebrow">{service.category}</p>
        <h3 className="mt-2 text-xl font-bold text-[hsl(var(--primary))]">{service.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{service.description}</p>
        <ArrowUpRight className="absolute bottom-7 right-7 text-[hsl(var(--primary)/.3)] transition-all group-hover:-translate-y-1 group-hover:text-[hsl(var(--secondary))]" size={19} />
      </div>
    </article>
  );
}
function ProjectStrip({ projects }: { projects: Project[] }) {
  return <div className="grid gap-5 md:grid-cols-2">{projects.map((p, i) => <article key={p.id} className="group grid min-h-[240px] grid-cols-[.9fr_1.1fr] border border-[hsl(var(--primary-foreground)/.14)]" data-testid={`card-project-${p.id}`}><div className={cx('image-wash relative overflow-hidden', i % 2 ? 'bg-[hsl(var(--secondary)/.25)]' : 'bg-[hsl(var(--accent)/.16)]')}>{p.image ? <img src={apiAssetUrl(p.image)} alt="" className="h-full w-full object-cover mix-blend-multiply opacity-70" /> : <div className="absolute bottom-7 left-7 text-[hsl(var(--primary-foreground)/.35)]"><Factory size={58} strokeWidth={1} /></div>}</div><div className="flex flex-col justify-between p-6"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--accent))]">{p.category}</p><h3 className="mt-3 text-xl font-bold">{p.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--primary-foreground)/.57)]">{p.description}</p></div><p className="mt-5 text-xs text-[hsl(var(--primary-foreground)/.42)]">{p.client} · {p.completionDate}</p></div></article>)}</div>;
}
function ClientRail({ clients }: { clients: Client[] }) {
  if (!clients.length) return <EmptyState label="Client stories will appear here as our network grows." />;
  return <div className="mt-12 flex flex-wrap gap-3 border-t border-[hsl(var(--border))] pt-7">{clients.map(c => <div key={c.id} data-testid={`client-${c.id}`} className="flex items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] px-4 py-3">{c.logo ? <img src={apiAssetUrl(c.logo)} alt={c.name} className="h-8 w-8 object-contain" /> : <div className="flex h-8 w-8 items-center justify-center bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--accent))]">{c.name.slice(0, 2).toUpperCase()}</div>}<span className="text-xs font-semibold text-[hsl(var(--primary))]">{c.name}</span></div>)}</div>;
}

function InteriorHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="bg-[hsl(var(--primary))] py-20 text-[hsl(var(--primary-foreground))] md:py-28"><PageContainer><p className="eyebrow text-[hsl(var(--accent))]">{eyebrow}</p><h1 className="display mt-5 max-w-4xl text-5xl font-semibold leading-[.98] md:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-base leading-8 text-[hsl(var(--primary-foreground)/.68)]">{copy}</p></PageContainer></section>;
}

const DEFAULT_CORE_VALUES = ['Reliability', 'Quality', 'Professionalism', 'Customer Satisfaction', 'Efficiency'];

function About() {
  useDocumentMeta(
    'About Us',
    'Learn about Acquire 360 Ventures Ltd — our vision, mission, core values and the team behind our procurement work in Uganda.',
  );
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const team = useListTeamMembers({ query: { queryKey: ['/api/team'] } });
  const p = profile.data;
  const coreValues = p?.coreValues?.length ? p.coreValues : DEFAULT_CORE_VALUES;
  return <Shell><InteriorHero eyebrow="About Acquire 360" title="A steady hand for important work." copy={p?.about || 'Acquire 360 Ventures Ltd is a Uganda-based procurement, supply and project support company helping organisations source with confidence and deliver with clarity.'} /><main><PageContainer className="grid gap-16 py-20 md:grid-cols-[1.1fr_.9fr] md:py-28"><div><p className="eyebrow">Our point of view</p><h2 className="display mt-4 text-4xl font-semibold leading-tight text-[hsl(var(--primary))] md:text-5xl">Procurement is not just purchasing. It is keeping promises.</h2></div><div className="space-y-6 text-sm leading-7 text-[hsl(var(--muted-foreground))]"><p>{p?.about || 'From a clear brief to a careful handover, we bring an accountable rhythm to every engagement.'}</p><div className="border-l-2 border-[hsl(var(--secondary))] pl-5"><p className="font-bold text-[hsl(var(--primary))]">“{p?.vision || 'To be East Africa’s most trusted procurement and project support partner.'}”</p><p className="mt-2 text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">Our vision</p></div></div></PageContainer><section className="bg-[hsl(var(--muted)/.5)] py-20 md:py-24"><PageContainer><SectionIntro eyebrow="What guides us" title="Clear values. Practical action." /><div className="grid gap-px bg-[hsl(var(--border))] sm:grid-cols-2 lg:grid-cols-5">{coreValues.map((value, i) => <div key={value} className="bg-[hsl(var(--background))] p-7"><span className="text-xs font-bold text-[hsl(var(--secondary))]">0{i + 1}</span><h3 className="mt-12 text-lg font-bold text-[hsl(var(--primary))]">{value}</h3></div>)}</div></PageContainer></section><section className="py-20 md:py-28"><PageContainer><SectionIntro eyebrow="The people behind the work" title="Small enough to stay close. Experienced enough to see ahead." />{team.isLoading ? <LoadingState /> : team.isError ? <ErrorState onRetry={() => team.refetch()} /> : !team.data?.length ? <EmptyState label="Our team profiles are being prepared." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{team.data.map(member => <TeamCard key={member.id} member={member} />)}</div>}</PageContainer></section></main></Shell>;
}
function TeamCard({ member }: { member: TeamMember }) { return <article data-testid={`card-team-${member.id}`} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="image-wash flex h-48 items-end bg-[hsl(var(--primary)/.12)] p-5">{member.image ? <img src={apiAssetUrl(member.image)} alt={member.name} className="h-full w-full object-cover" /> : <span className="text-5xl font-bold text-[hsl(var(--primary)/.2)]">{member.name.split(' ').map(s => s[0]).join('').slice(0, 2)}</span>}</div><div className="p-6"><h3 className="font-bold text-[hsl(var(--primary))]">{member.name}</h3><p className="mt-1 text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">{member.position}</p><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{member.bio}</p></div></article>; }

function Services() {
  useDocumentMeta(
    'Procurement Services',
    'Explore Acquire 360 Ventures Ltd procurement services — office furniture, PPE, ICT equipment, construction materials and more, delivered across Uganda.',
  );
  const query = useListServices({ query: { queryKey: ['/api/services'] } });
  return <Shell><InteriorHero eyebrow="Our capabilities" title="The practical intelligence behind better supply." copy="From one urgent item to a full project workstream, we give teams the reach and rigour to move forward." /><main className="py-20 md:py-28"><PageContainer>{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState label="Our capability list is being prepared." /> : <div className="grid gap-5 md:grid-cols-2">{query.data.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}</div>}<div className="mt-20 border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] md:flex md:items-center md:justify-between md:p-12"><div><p className="eyebrow text-[hsl(var(--accent))]">Have a specific brief?</p><h2 className="display mt-3 text-3xl font-semibold">Let’s make a clear plan.</h2></div><Link href="/quote" data-testid="link-services-quote" className="mt-7 inline-flex w-fit items-center gap-3 bg-[hsl(var(--secondary))] px-5 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary-foreground))] md:mt-0">Send an RFQ <ArrowUpRight size={15} /></Link></div></PageContainer></main></Shell>;
}

function Projects() {
  useDocumentMeta(
    'Projects & Experience',
    'See completed procurement and supply projects delivered by Acquire 360 Ventures Ltd for NGOs, institutions and businesses across Uganda.',
  );
  const query = useListProjects({ query: { queryKey: ['/api/projects'] } });
  return <Shell><InteriorHero eyebrow="Project record" title="A track record built on getting the details right." copy="A selection of work delivered with care for organisations, communities and teams across Uganda and the region." /><main className="py-20 md:py-28"><PageContainer>{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState label="Project stories are being prepared." /> : <div className="grid gap-6 md:grid-cols-2">{query.data.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}</div>}</PageContainer></main></Shell>;
}
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const gallery = project.images?.length ? project.images : project.image ? [project.image] : [];
  const cover = project.image ?? gallery[0];
  const thumbnails = gallery.filter((image) => image !== cover).slice(0, 4);

  return (
    <article
      data-testid={`card-project-full-${project.id}`}
      className={cx(
        'group grid overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        index % 3 === 0 ? 'md:col-span-2 md:grid-cols-[1.2fr_.8fr]' : 'md:grid-cols-[.8fr_1.2fr]',
      )}
    >
      <div className={cx('bg-[hsl(var(--primary)/.1)]', index % 3 === 1 && 'md:order-2')}>
        {cover ? (
          <div className="grid h-full min-h-[220px] grid-rows-[1fr_auto]">
            <img src={apiAssetUrl(cover)} alt={project.title} className="h-full min-h-[220px] w-full object-cover" />
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-4 gap-1 bg-[hsl(var(--background))] p-1">
                {thumbnails.map((image) => (
                  <img key={image} src={apiAssetUrl(image)} alt="" className="h-16 w-full object-cover" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[220px] items-center justify-center text-[hsl(var(--primary)/.25)]">
            <Building2 size={70} strokeWidth={1} />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between p-7 md:p-10">
        <div>
          <p className="eyebrow">{project.category}</p>
          <h2 className="display mt-4 text-3xl font-semibold text-[hsl(var(--primary))]">{project.title}</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))]">{project.description}</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-2"><Users size={14} className="text-[hsl(var(--secondary))]" />{project.client}</span>
          <span className="flex items-center gap-2"><Clock3 size={14} className="text-[hsl(var(--secondary))]" />{project.completionDate}</span>
        </div>
      </div>
    </article>
  );
}

function Products() {
  useDocumentMeta(
    'Product Catalogue',
    'Browse the Acquire 360 Ventures Ltd product catalogue — PPE, ICT equipment, furniture, electrical and plumbing materials, construction supplies and more.',
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const query = useListProducts({ search: search || undefined, category: category || undefined }, { query: { queryKey: ['/api/products', { search, category }] } });
  const categories = useMemo(() => Array.from(new Set((query.data ?? []).map(p => p.category))).filter(Boolean), [query.data]);
  return <Shell><InteriorHero eyebrow="Product catalogue" title="A considered catalogue for the work ahead." copy="Browse essential supplies and specialist equipment. Need something specific? Search here, then ask us to source it." /><main className="py-16 md:py-24"><PageContainer><div className="mb-10 flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-6 md:flex-row"><label className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={e => setSearch(e.target.value)} data-testid="input-product-search" placeholder="Search the catalogue" className="h-12 w-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-11 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]" /></label><label className="relative md:w-56"><span className="sr-only">Filter by category</span><select value={category} onChange={e => setCategory(e.target.value)} data-testid="select-product-category" className="h-12 w-full appearance-none border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-4 pr-10 text-sm"><option value="">All categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" /></label></div>{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState label={search ? 'No catalogue items match that search.' : 'Our catalogue is being refreshed. Ask us to source a specific item.'} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{query.data.map(p => <ProductCard key={p.id} product={p} />)}</div>}</PageContainer></main></Shell>;
}
function ProductCard({ product }: { product: Product }) { return <article data-testid={`card-product-${product.id}`} className="group flex min-h-[300px] flex-col border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-transform hover:-translate-y-1"><div className="image-wash relative flex h-36 items-center justify-center overflow-hidden bg-[hsl(var(--muted))]">{product.image ? <img src={apiAssetUrl(product.image)} alt={product.name} className="h-full w-full object-cover" /> : <PackageSearch size={42} strokeWidth={1} className="text-[hsl(var(--primary)/.3)]" />}<span className="absolute left-4 top-4 bg-[hsl(var(--primary))] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--accent))]">{product.category}</span></div><div className="flex flex-1 flex-col p-5"><h3 className="font-bold text-[hsl(var(--primary))]">{product.name}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{product.description}</p><div className="mt-auto flex items-center justify-between pt-5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary))]"><span>{product.specifications ? 'Specifications available' : 'Source on request'}</span><ArrowUpRight size={15} className="line-arrow transition-transform group-hover:-translate-y-0.5" /></div></div></article>; }

function Quote() {
  useDocumentMeta(
    'Request a Quote',
    'Submit a request for quotation to Acquire 360 Ventures Ltd for PPE, office furniture, ICT equipment, construction materials and more.',
  );
  const create = useCreateRfq();
  const uploadAttachment = useUploadRfqAttachment();
  const [sent, setSent] = useState(false);
  const [file, setFile] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    setFileName(selected.name);
    uploadAttachment.mutate(
      { data: { file: selected } },
      {
        onSuccess: (result) => setFile(result.url),
        onError: (err) =>
          setError(apiErrorMessage(err, 'We could not upload that file. Please try again or continue without it.')),
      },
    );
  };
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setError(''); const data = new FormData(e.currentTarget); const input: RfqInput = { companyName: String(data.get('companyName') || ''), contactPerson: String(data.get('contactPerson') || ''), email: String(data.get('email') || ''), phone: String(data.get('phone') || ''), product: String(data.get('product') || ''), quantity: String(data.get('quantity') || ''), description: String(data.get('description') || ''), file: file || null }; if (Object.values(input).slice(0, 7).some(v => !v)) { setError('Please complete the required fields before sending your enquiry.'); return; } create.mutate({ data: input }, { onSuccess: () => setSent(true), onError: () => setError('We could not send your enquiry right now. Please try again or contact us directly.') }); };
  return <Shell><InteriorHero eyebrow="Request for quotation" title="Tell us what you need. We’ll take it from there." copy="Share the essentials and our team will come back with a clear next step. The more context you give us, the more useful we can be." /><main className="py-16 md:py-24"><PageContainer><div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr]">{sent ? <SuccessState /> : <form onSubmit={submit} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-10" data-testid="form-rfq"><div className="mb-8 border-b border-[hsl(var(--border))] pb-6"><p className="eyebrow">Your brief</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Required fields are marked with an asterisk.</p></div><div className="grid gap-5 md:grid-cols-2"><Field label="Organisation" name="companyName" required /><Field label="Contact person" name="contactPerson" required /><Field label="Email address" name="email" type="email" required /><Field label="Phone number" name="phone" type="tel" required /><Field label="Product or service needed" name="product" required /><Field label="Quantity / scale" name="quantity" required /></div><label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground)/.72)]">Brief details *<textarea name="description" required data-testid="input-rfq-description" rows={5} placeholder="What are you trying to source? Include timelines, standards or delivery context." className="mt-2 block w-full resize-y border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm font-normal normal-case tracking-normal outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></label><label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground)/.72)]">Supporting document <input type="file" onChange={e => handleFile(e.target.files?.[0])} data-testid="input-rfq-file" className="mt-2 block w-full border border-dashed border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-xs font-normal normal-case tracking-normal" />{uploadAttachment.isPending && <span className="mt-2 block text-xs text-[hsl(var(--muted-foreground))]">Uploading {fileName}…</span>}{!uploadAttachment.isPending && file && <span className="mt-2 block text-xs text-[hsl(var(--secondary))]">Attached: {fileName}</span>}</label>{error && <p className="mt-5 flex items-center gap-2 text-sm text-[hsl(var(--destructive))]" data-testid="status-rfq-error"><CircleAlert size={16} />{error}</p>}<button type="submit" disabled={create.isPending || uploadAttachment.isPending} data-testid="button-submit-rfq" className="mt-7 inline-flex items-center gap-3 bg-[hsl(var(--secondary))] px-6 py-4 text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary-foreground))] disabled:cursor-wait disabled:opacity-60">{create.isPending ? 'Sending enquiry…' : 'Send enquiry'}<Send size={15} /></button></form>}<aside className="lg:pt-3"><p className="eyebrow">A clear next step</p><h2 className="display mt-4 text-4xl font-semibold leading-tight text-[hsl(var(--primary))]">No complicated portal. No chasing.</h2><p className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">Your enquiry goes straight to a team that understands procurement in the region and knows how to turn a requirement into action.</p><div className="mt-9 space-y-5 border-t border-[hsl(var(--border))] pt-7">{[['01', 'We review your brief', 'Usually within one working day.'], ['02', 'We clarify what matters', 'Specs, timing, budget and delivery.'], ['03', 'We come back with options', 'A considered response, not a guess.']].map(([n, t, d]) => <div key={n} className="flex gap-4"><span className="text-xs font-bold text-[hsl(var(--secondary))]">{n}</span><div><p className="text-sm font-bold text-[hsl(var(--primary))]">{t}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{d}</p></div></div>)}</div></aside></div></PageContainer></main></Shell>;
}
function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--foreground)/.72)]">{label}{required && ' *'}<input type={type} name={name} required={required} data-testid={`input-rfq-${name}`} className="mt-2 block h-12 w-full border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm font-normal normal-case tracking-normal outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></label>; }
function SuccessState() { return <div className="flex min-h-[500px] flex-col items-start justify-center border border-[hsl(var(--secondary)/.45)] bg-[hsl(var(--secondary)/.08)] p-8 md:p-12" data-testid="status-rfq-success"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"><Check size={28} /></div><p className="eyebrow mt-8">Enquiry received</p><h2 className="display mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">Thank you. We’re on it.</h2><p className="mt-5 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">Your request has been sent to the Acquire 360 team. We’ll review the brief and be in touch with a clear next step.</p><Link href="/" data-testid="link-success-home" className="mt-8 inline-flex items-center gap-2 border-b border-[hsl(var(--primary))] pb-2 text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">Back to home <ArrowRight size={15} /></Link></div>; }

function Contact() {
  useDocumentMeta(
    'Contact Us',
    'Get in touch with Acquire 360 Ventures Ltd for procurement, supply and project support enquiries in Uganda.',
  );
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const p = profile.data;
  return <Shell><InteriorHero eyebrow="Contact" title="Let’s get the right people in the room." copy="Whether you have a defined RFQ or an early project question, we’re ready to listen." /><main className="py-20 md:py-28"><PageContainer><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">Reach the team</p><h2 className="display mt-4 text-4xl font-semibold text-[hsl(var(--primary))]">A direct line is usually the fastest way forward.</h2><div className="mt-10 space-y-5">{[['Email', p?.email || 'info@acquire360ventures.com', Mail, `mailto:${p?.email || 'info@acquire360ventures.com'}`], ['Phone', p?.phone || '+256 752 885 488', Phone, `tel:${p?.phone || '+256752885488'}`]].map(([label, value, Icon, href]) => <a href={String(href)} key={String(label)} data-testid={`link-contact-${String(label).toLowerCase()}`} className="flex items-start gap-4 border-t border-[hsl(var(--border))] pt-5 hover:text-[hsl(var(--secondary))]"><span className="flex h-9 w-9 items-center justify-center bg-[hsl(var(--muted))] text-[hsl(var(--secondary))]">{typeof Icon === 'function' && <Icon size={17} />}</span><div><p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{String(label)}</p><p className="mt-1 text-sm font-semibold text-[hsl(var(--primary))]">{String(value)}</p></div></a>)}</div></div><div className="topo flex min-h-[380px] flex-col justify-between border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] p-8 md:p-12"><div><Pin className="text-[hsl(var(--secondary))]" size={26} /><p className="eyebrow mt-12">Our base</p><h2 className="display mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">Kampala, Uganda</h2><p className="mt-4 max-w-sm text-sm leading-7 text-[hsl(var(--muted-foreground))]">Working with partners and clients across Uganda and East Africa.</p></div><Link href="/quote" data-testid="link-contact-quote" className="group inline-flex w-fit items-center gap-3 border-b border-[hsl(var(--primary))] pb-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Send an enquiry <ArrowRight size={15} className="line-arrow" /></Link></div></div></PageContainer></main></Shell>;
}

function NotFound() { return <Shell><main className="flex min-h-[60vh] items-center justify-center px-5 text-center"><div><p className="eyebrow">404 / not found</p><h1 className="display mt-4 text-6xl font-semibold text-[hsl(var(--primary))]">This page took a wrong turn.</h1><Link href="/" data-testid="link-not-found-home" className="mt-8 inline-flex items-center gap-2 bg-[hsl(var(--secondary))] px-5 py-4 text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary-foreground))]">Return home <ArrowRight size={15} /></Link></div></main></Shell>; }

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/services" component={Services} />
    <Route path="/projects" component={Projects} />
    <Route path="/products" component={Products} />
    <Route path="/quote" component={Quote} />
    <Route path="/contact" component={Contact} />
    <Route path="/admin/login" component={AdminLogin} />
    <Route path="/admin" component={() => <AdminGuard><AdminDashboard /></AdminGuard>} />
    <Route path="/admin/company" component={() => <AdminGuard><AdminCompanyProfile /></AdminGuard>} />
    <Route path="/admin/services" component={() => <AdminGuard><AdminServices /></AdminGuard>} />
    <Route path="/admin/projects" component={() => <AdminGuard><AdminProjects /></AdminGuard>} />
    <Route path="/admin/products" component={() => <AdminGuard><AdminProducts /></AdminGuard>} />
    <Route path="/admin/team" component={() => <AdminGuard><AdminTeam /></AdminGuard>} />
    <Route path="/admin/clients" component={() => <AdminGuard><AdminClients /></AdminGuard>} />
    <Route path="/admin/media" component={() => <AdminGuard><AdminMedia /></AdminGuard>} />
    <Route path="/admin/rfqs" component={() => <AdminGuard><AdminRfqs /></AdminGuard>} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></AuthProvider></QueryClientProvider>;
}
export default App;
