import {
  useCreateClient,
  useDeleteClient,
  useListClients,
  useUpdateClient,
} from '@workspace/api-client-react';
import type { Client } from '@workspace/api-client-react';
import { EntityPage, type FieldConfig, type FieldValues } from './entity-crud';
import { useDocumentMeta } from '@/lib/use-document-meta';

const fields: FieldConfig[] = [
  { name: 'name', label: 'Client name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'logo', label: 'Logo', type: 'image' },
];

function toValues(c?: Client): FieldValues {
  return {
    name: c?.name ?? '',
    description: c?.description ?? '',
    logo: c?.logo ?? '',
  };
}

function toBody(values: FieldValues) {
  return {
    name: values.name,
    description: values.description ?? '',
    logo: values.logo || null,
  };
}

export function AdminClients() {
  useDocumentMeta('manage clients', 'Create, edit and remove trusted client listings.');
  const list = useListClients({ query: { queryKey: ['/api/clients'] } });
  const create = useCreateClient();
  const update = useUpdateClient();
  const del = useDeleteClient();

  return (
    <EntityPage<Client>
      title="Clients"
      description="Manage the trusted clients shown on the homepage."
      fields={fields}
      columns={[{ label: 'Name', render: (c) => c.name }]}
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
