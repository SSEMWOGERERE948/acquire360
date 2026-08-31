import { type ReactNode, useEffect, useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useListMedia, useUploadMedia } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { apiErrorMessage } from '@/lib/api-error';

export type FieldValues = Record<string, string>;

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'date' | 'image' | 'images' | 'document' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ColumnConfig<T> {
  label: string;
  render: (row: T) => ReactNode;
}

function UploadField({
  value,
  onChange,
  kind,
}: {
  value: string;
  onChange: (url: string) => void;
  kind: 'image' | 'document';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();
  const media = useListMedia({ query: { queryKey: ['/api/media'] } });
  const [pickerOpen, setPickerOpen] = useState(false);
  const libraryItems = media.data?.filter((asset) => asset.kind === kind) ?? [];

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    upload.mutate(
      { data: { file } },
      {
        onSuccess: (asset) => onChange(asset.url),
        onError: (err) =>
          toast({
            title: 'Upload failed',
            description: apiErrorMessage(err, 'Could not upload the file. Please try again.'),
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === 'image' ? 'Image URL' : 'Document URL'}
          data-testid={`input-field-url`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setPickerOpen(true)}
          aria-label={kind === 'image' ? 'Choose image from media library' : 'Choose document from media library'}
          title={kind === 'image' ? 'Choose from media library' : 'Choose from media library'}
          data-testid="button-pick-media"
        >
          {kind === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          aria-label={kind === 'image' ? 'Upload new image' : 'Upload new document'}
          title={kind === 'image' ? 'Upload new image' : 'Upload new document'}
          data-testid="button-upload-file"
        >
          {upload.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={kind === 'image' ? 'image/*' : 'application/pdf'}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {kind === 'image' && value && (
        <img src={value} alt="Preview" className="h-20 w-20 rounded border border-border object-cover" />
      )}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{kind === 'image' ? 'Choose image' : 'Choose document'}</DialogTitle>
            <DialogDescription>Select a file already uploaded to the media library.</DialogDescription>
          </DialogHeader>
          {media.isLoading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading media...</p>
          ) : libraryItems.length === 0 ? (
            <div className="border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No {kind === 'image' ? 'images' : 'documents'} in the media library yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {libraryItems.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onChange(asset.url);
                    setPickerOpen(false);
                  }}
                  className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-left transition-colors hover:border-[hsl(var(--secondary))]"
                  data-testid={`button-pick-media-${asset.id}`}
                >
                  <div className="flex h-28 items-center justify-center overflow-hidden bg-[hsl(var(--muted))]">
                    {kind === 'image' ? (
                      <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
                    ) : (
                      <FileText size={32} className="text-[hsl(var(--primary)/.45)]" />
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-[hsl(var(--primary))]" title={asset.filename}>
                    {asset.filename}
                  </p>
                </button>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MultiImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (urls: string) => void;
}) {
  const media = useListMedia({ query: { queryKey: ['/api/media'] } });
  const [pickerOpen, setPickerOpen] = useState(false);
  const urls = value ? value.split('\n').map((url) => url.trim()).filter(Boolean) : [];
  const images = media.data?.filter((asset) => asset.kind === 'image') ?? [];

  const setUrls = (nextUrls: string[]) => onChange(nextUrls.join('\n'));
  const toggleUrl = (url: string) => {
    setUrls(urls.includes(url) ? urls.filter((item) => item !== url) : [...urls, url]);
  };

  return (
    <div className="space-y-3">
      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url) => (
            <div key={url} className="relative overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              <img src={url} alt="" className="h-20 w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setUrls(urls.filter((item) => item !== url))}
                className="absolute right-1 top-1 h-7 w-7 bg-[hsl(var(--background)/.9)]"
                aria-label="Remove project image"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[hsl(var(--border))] p-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
          No gallery images selected.
        </div>
      )}
      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)} data-testid="button-pick-project-images">
        <ImageIcon size={16} className="mr-2" />
        Choose gallery images
      </Button>
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose project images</DialogTitle>
            <DialogDescription>Select one or more images from the media library.</DialogDescription>
          </DialogHeader>
          {media.isLoading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading media...</p>
          ) : images.length === 0 ? (
            <div className="border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No images in the media library yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((asset) => {
                const selected = urls.includes(asset.url);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleUrl(asset.url)}
                    className={`border bg-[hsl(var(--card))] p-3 text-left transition-colors ${selected ? 'border-[hsl(var(--secondary))] ring-2 ring-[hsl(var(--secondary)/.25)]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]'}`}
                    data-testid={`button-pick-project-image-${asset.id}`}
                  >
                    <div className="flex h-28 items-center justify-center overflow-hidden bg-[hsl(var(--muted))]">
                      <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold text-[hsl(var(--primary))]" title={asset.filename}>
                      {selected ? 'Selected - ' : ''}{asset.filename}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setPickerOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EntityFormFields({
  fields,
  values,
  onChange,
}: {
  fields: FieldConfig[];
  values: FieldValues;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 py-2">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          {field.type !== 'checkbox' && (
            <Label htmlFor={`field-${field.name}`}>
              {field.label}
              {field.required && ' *'}
            </Label>
          )}
          {field.type === 'text' && (
            <Input
              id={`field-${field.name}`}
              value={values[field.name] ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange(field.name, e.target.value)}
              data-testid={`input-admin-${field.name}`}
            />
          )}
          {field.type === 'date' && (
            <Input
              id={`field-${field.name}`}
              type="date"
              value={values[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              data-testid={`input-admin-${field.name}`}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              id={`field-${field.name}`}
              value={values[field.name] ?? ''}
              placeholder={field.placeholder}
              rows={4}
              onChange={(e) => onChange(field.name, e.target.value)}
              data-testid={`input-admin-${field.name}`}
            />
          )}
          {field.type === 'select' && (
            <Select value={values[field.name] ?? ''} onValueChange={(v) => onChange(field.name, v)}>
              <SelectTrigger data-testid={`select-admin-${field.name}`}>
                <SelectValue placeholder={field.placeholder ?? 'Select'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(field.type === 'image' || field.type === 'document') && (
            <UploadField
              value={values[field.name] ?? ''}
              onChange={(url) => onChange(field.name, url)}
              kind={field.type}
            />
          )}
          {field.type === 'images' && (
            <MultiImageField
              value={values[field.name] ?? ''}
              onChange={(urls) => onChange(field.name, urls)}
            />
          )}
          {field.type === 'checkbox' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`field-${field.name}`}
                checked={values[field.name] === 'true'}
                onCheckedChange={(checked) => onChange(field.name, checked ? 'true' : 'false')}
                data-testid={`checkbox-admin-${field.name}`}
              />
              <Label htmlFor={`field-${field.name}`}>{field.label}</Label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EntityDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues,
  onSubmit,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  initialValues: FieldValues;
  onSubmit: (values: FieldValues) => Promise<void>;
  isSaving: boolean;
}) {
  const [values, setValues] = useState<FieldValues>(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async () => {
    const missing = fields.filter((f) => f.required && f.type !== 'checkbox' && !values[f.name]?.trim());
    if (missing.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in: ${missing.map((f) => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <EntityFormFields fields={fields} values={values} onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-admin-cancel">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSaving} data-testid="button-admin-save">
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EntityPage<T extends { id: number }>({
  title,
  description,
  fields,
  columns,
  items,
  isLoading,
  isError,
  onRetry,
  emptyToValues,
  itemToValues,
  onCreate,
  onUpdate,
  onDelete,
}: {
  title: string;
  description: string;
  fields: FieldConfig[];
  columns: ColumnConfig<T>[];
  items: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyToValues: () => FieldValues;
  itemToValues: (item: T) => FieldValues;
  onCreate: (values: FieldValues) => Promise<unknown>;
  onUpdate: (id: number, values: FieldValues) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: T) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: FieldValues) => {
    setIsSaving(true);
    try {
      if (editing) {
        await onUpdate(editing.id, values);
        toast({ title: 'Saved', description: `${title.slice(0, -1)} updated successfully.` });
      } else {
        await onCreate(values);
        toast({ title: 'Created', description: `${title.slice(0, -1)} created successfully.` });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: 'Something went wrong', description: 'Please check the fields and try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: T) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setDeletingId(item.id);
    try {
      await onDelete(item.id);
      toast({ title: 'Deleted', description: `${title.slice(0, -1)} removed.` });
    } catch {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">{title}</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
        <Button onClick={openCreate} data-testid="button-admin-new">
          <Plus size={16} className="mr-2" /> Add new
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : isError ? (
        <div className="border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.05)] p-6 text-sm">
          Could not load records.{' '}
          <button type="button" className="font-bold underline" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : !items?.length ? (
        <div className="border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No records yet. Add your first one.
        </div>
      ) : (
        <div className="overflow-x-auto border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.label}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} data-testid={`row-admin-${item.id}`}>
                  {columns.map((col) => (
                    <TableCell key={col.label}>{col.render(item)}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)} data-testid={`button-edit-${item.id}`}>
                      <Pencil size={15} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      data-testid={`button-delete-${item.id}`}
                    >
                      {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? `Edit ${title.slice(0, -1).toLowerCase()}` : `New ${title.slice(0, -1).toLowerCase()}`}
        fields={fields}
        initialValues={editing ? itemToValues(editing) : emptyToValues()}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
