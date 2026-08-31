import {
  useCreateService,
  useDeleteService,
  useListServices,
  useUpdateService,
} from '@workspace/api-client-react';
import type { Service } from '@workspace/api-client-react';
import { EntityPage, type FieldConfig, type FieldValues } from './entity-crud';
import { useDocumentMeta } from '@/lib/use-document-meta';

const fields: FieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'featured', label: 'Featured on homepage', type: 'checkbox' },
];

function toValues(s?: Service): FieldValues {
  return {
    title: s?.title ?? '',
    category: s?.category ?? '',
    description: s?.description ?? '',
    image: s?.image ?? '',
    featured: s?.featured ? 'true' : 'false',
  };
}

function toBody(values: FieldValues) {
  return {
    title: values.title,
    category: values.category,
    description: values.description,
    image: values.image || null,
    featured: values.featured === 'true',
  };
}

export function AdminServices() {
  useDocumentMeta('Manage services', 'Create, edit and remove procurement service listings.');
  const list = useListServices({ query: { queryKey: ['/api/services'] } });
  const create = useCreateService();
  const update = useUpdateService();
  const del = useDeleteService();

  return (
    <EntityPage<Service>
      title="Services"
      description="Manage the procurement capabilities shown on the public site."
      fields={fields}
      columns={[
        { label: 'Title', render: (s) => s.title },
        { label: 'Category', render: (s) => s.category },
        { label: 'Featured', render: (s) => (s.featured ? 'Yes' : 'No') },
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
