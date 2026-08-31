import { useRef, useState } from 'react';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useDeleteMedia, useListMedia, useUploadMedia } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useDocumentMeta } from '@/lib/use-document-meta';
import { apiErrorMessage } from '@/lib/api-error';

const MAX_IMAGES = 20;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMedia() {
  useDocumentMeta('Media library', 'Upload and manage images and PDF documents.');
  const list = useListMedia({ query: { queryKey: ['/api/media'] } });
  const upload = useUploadMedia();
  const del = useDeleteMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  const imageCount = list.data?.filter((a) => a.kind === 'image').length ?? 0;
  const imageQuotaReached = imageCount >= MAX_IMAGES;

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const selectedImages = files.filter((file) => file.type.startsWith('image/')).length;
    const remainingImageSlots = Math.max(0, MAX_IMAGES - imageCount);

    if (selectedImages > remainingImageSlots) {
      toast({
        title: 'Image limit reached',
        description: `You can upload ${remainingImageSlots} more image${remainingImageSlots === 1 ? '' : 's'}. Remove ${selectedImages - remainingImageSlots} image${selectedImages - remainingImageSlots === 1 ? '' : 's'} from this selection or delete existing media first.`,
        variant: 'destructive',
      });
      return;
    }

    setUploadProgress({ done: 0, total: files.length });

    const failed: string[] = [];
    for (const [index, file] of files.entries()) {
      try {
        await upload.mutateAsync({ data: { file } });
      } catch (err) {
        failed.push(`${file.name}: ${apiErrorMessage(err, 'Please try again.')}`);
      } finally {
        setUploadProgress({ done: index + 1, total: files.length });
      }
    }

    await list.refetch();
    setUploadProgress(null);

    if (failed.length > 0) {
      toast({
        title: `${failed.length} upload${failed.length === 1 ? '' : 's'} failed`,
        description: failed.slice(0, 2).join(' | '),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: files.length === 1 ? 'Uploaded' : 'Bulk upload complete',
      description: files.length === 1 ? files[0].name : `${files.length} files uploaded.`,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this file?')) return;
    setDeletingId(id);
    try {
      await del.mutateAsync({ id });
      await list.refetch();
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
          <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">Media library</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Upload images and documents for use across the site.</p>
          <p className={`mt-1 text-xs font-semibold ${imageQuotaReached ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
            {imageCount}/{MAX_IMAGES} images used{imageQuotaReached ? ' — delete an image to upload a new one' : ''}
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending || Boolean(uploadProgress)} data-testid="button-media-upload">
          {upload.isPending || uploadProgress ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
          {uploadProgress ? `Uploading ${uploadProgress.done}/${uploadProgress.total}` : 'Upload files'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.currentTarget.value = '';
          }}
        />
      </div>

      {list.isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : !list.data?.length ? (
        <div className="border border-dashed border-[hsl(var(--border))] p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No files uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.data.map((asset) => (
            <div key={asset.id} className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3" data-testid={`card-media-${asset.id}`}>
              <div className="flex h-28 items-center justify-center overflow-hidden bg-[hsl(var(--muted))]">
                {asset.kind === 'image' ? (
                  <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
                ) : (
                  <FileText size={32} className="text-[hsl(var(--primary)/.4)]" />
                )}
              </div>
              <p className="mt-2 truncate text-xs font-semibold text-[hsl(var(--primary))]" title={asset.filename}>
                {asset.filename}
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatSize(asset.size)}</p>
              <div className="mt-2 flex items-center justify-between">
                <a href={asset.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--secondary))]">
                  Open
                </a>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(asset.id)} disabled={deletingId === asset.id} data-testid={`button-media-delete-${asset.id}`}>
                  {deletingId === asset.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
