import {
  useCreateTeamMember,
  useDeleteTeamMember,
  useListTeamMembers,
  useUpdateTeamMember,
} from '@workspace/api-client-react';
import type { TeamMember } from '@workspace/api-client-react';
import { EntityPage, type FieldConfig, type FieldValues } from './entity-crud';
import { useDocumentMeta } from '@/lib/use-document-meta';

const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'position', label: 'Position', type: 'text', required: true },
  { name: 'bio', label: 'Biography', type: 'textarea', required: true },
  { name: 'image', label: 'Profile image', type: 'image' },
];

function toValues(m?: TeamMember): FieldValues {
  return {
    name: m?.name ?? '',
    position: m?.position ?? '',
    bio: m?.bio ?? '',
    image: m?.image ?? '',
  };
}

function toBody(values: FieldValues) {
  return {
    name: values.name,
    position: values.position,
    bio: values.bio,
    image: values.image || null,
  };
}

export function AdminTeam() {
  useDocumentMeta('Manage team', 'Create, edit and remove team member profiles.');
  const list = useListTeamMembers({ query: { queryKey: ['/api/team'] } });
  const create = useCreateTeamMember();
  const update = useUpdateTeamMember();
  const del = useDeleteTeamMember();

  return (
    <EntityPage<TeamMember>
      title="Team"
      description="Manage the people shown on the About page."
      fields={fields}
      columns={[
        { label: 'Name', render: (m) => m.name },
        { label: 'Position', render: (m) => m.position },
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
