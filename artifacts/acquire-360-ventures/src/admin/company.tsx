import { type FormEvent, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetCompanyProfile, useUpdateCompanyProfile } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useDocumentMeta } from '@/lib/use-document-meta';

interface FormState {
  companyName: string;
  tagline: string;
  vision: string;
  mission: string;
  about: string;
  coreValues: string;
  phone: string;
  email: string;
}

const empty: FormState = {
  companyName: '',
  tagline: '',
  vision: '',
  mission: '',
  about: '',
  coreValues: '',
  phone: '',
  email: '',
};

export function AdminCompanyProfile() {
  useDocumentMeta('Company profile', 'Edit the company overview, vision, mission and contact details.');
  const profile = useGetCompanyProfile({ query: { queryKey: ['/api/company'] } });
  const update = useUpdateCompanyProfile();
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (profile.data) {
      setForm({
        companyName: profile.data.companyName,
        tagline: profile.data.tagline,
        vision: profile.data.vision,
        mission: profile.data.mission,
        about: profile.data.about,
        coreValues: profile.data.coreValues.join(', '),
        phone: profile.data.phone,
        email: profile.data.email,
      });
    }
  }, [profile.data]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        data: {
          companyName: form.companyName,
          tagline: form.tagline,
          vision: form.vision,
          mission: form.mission,
          about: form.about,
          coreValues: form.coreValues.split(',').map((v) => v.trim()).filter(Boolean),
          phone: form.phone,
          email: form.email,
        },
      });
      await profile.refetch();
      toast({ title: 'Saved', description: 'Company profile updated.' });
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">Company profile</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Edit the company name, vision, mission, about text, core values and contact details shown across the site.
        </p>
      </div>

      {profile.isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : (
        <form onSubmit={submit} className="max-w-2xl space-y-5 border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6" data-testid="form-admin-company">
          <div className="space-y-1.5">
            <Label htmlFor="company-name">Company name</Label>
            <Input id="company-name" required data-testid="input-company-name" {...field('companyName')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company-tagline">Tagline</Label>
            <Input id="company-tagline" required data-testid="input-company-tagline" {...field('tagline')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company-vision">Vision</Label>
            <Textarea id="company-vision" rows={3} required data-testid="input-company-vision" {...field('vision')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company-mission">Mission</Label>
            <Textarea id="company-mission" rows={3} required data-testid="input-company-mission" {...field('mission')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company-about">About</Label>
            <Textarea id="company-about" rows={5} required data-testid="input-company-about" {...field('about')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company-values">Core values (comma-separated)</Label>
            <Input id="company-values" required data-testid="input-company-values" {...field('coreValues')} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-phone">Phone</Label>
              <Input id="company-phone" required data-testid="input-company-phone" {...field('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-email">Email</Label>
              <Input id="company-email" type="email" required data-testid="input-company-email" {...field('email')} />
            </div>
          </div>
          <Button type="submit" disabled={update.isPending} data-testid="button-company-save">
            {update.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            Save changes
          </Button>
        </form>
      )}
    </div>
  );
}
