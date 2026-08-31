import {
  useCreateProject,
  useDeleteProject,
  useListProjects,
  useUpdateProject,
} from '@workspace/api-client-react';
import type { Project } from '@workspace/api-client-react';
import { EntityPage, type FieldConfig, type FieldValues } from './entity-crud';
import { useDocumentMeta } from '@/lib/use-document-meta';

const fields: FieldConfig[] = [
  { name: 'title', label: 'Project name', type: 'text', required: true },
  { name: 'client', label: 'Client name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'completionDate', label: 'Completion date', type: 'date', required: true },
  { name: 'image', label: 'Cover image', type: 'image' },
  { name: 'images', label: 'Project gallery', type: 'images' },
];

function toValues(p?: Project): FieldValues {
  return {
    title: p?.title ?? '',
    client: p?.client ?? '',
    category: p?.category ?? '',
    description: p?.description ?? '',
    completionDate: p?.completionDate ?? '',
    image: p?.image ?? '',
    images: p?.images?.join('\n') ?? '',
  };
}

function toBody(values: FieldValues) {
  const images = values.images
    ? values.images.split('\n').map((url) => url.trim()).filter(Boolean)
    : [];
  const image = values.image || images[0] || null;

  return {
    title: values.title,
    client: values.client,
    category: values.category,
    description: values.description,
    completionDate: values.completionDate,
    image,
    images,
  };
}

export function AdminProjects() {
  useDocumentMeta('Manage projects', 'Create, edit and remove completed project records.');
  const list = useListProjects({ query: { queryKey: ['/api/projects'] } });
  const create = useCreateProject();
  const update = useUpdateProject();
  const del = useDeleteProject();

  return (
    <EntityPage<Project>
      title="Projects"
      description="Manage the project record shown on the public site."
      fields={fields}
      columns={[
        { label: 'Title', render: (p) => p.title },
        { label: 'Client', render: (p) => p.client },
        { label: 'Category', render: (p) => p.category },
        { label: 'Images', render: (p) => p.images?.length ?? 0 },
        { label: 'Completed', render: (p) => p.completionDate },
      ]}
      items={list.data}
      isLoading={list.isLoading}
      isError={list.isError}
      onRetry={() => list.refetch()}
      emptyToValues={() => toValues()}
      itemToValues={toValues}
      onCreate={async (values) => {
        await create.mutateAsync({ data: toBody(values) });
        await list.refetch();
      }}
      onUpdate={async (id, values) => {
        await update.mutateAsync({ id, data: toBody(values) });
        await list.refetch();
      }}
      onDelete={async (id) => {
        await del.mutateAsync({ id });
        await list.refetch();
      }}
    />
  );
}
