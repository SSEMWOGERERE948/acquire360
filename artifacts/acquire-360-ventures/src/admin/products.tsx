import {
  useCreateProduct,
  useDeleteProduct,
  useListProducts,
  useUpdateProduct,
} from '@workspace/api-client-react';
import type { Product } from '@workspace/api-client-react';
import { EntityPage, type FieldConfig, type FieldValues } from './entity-crud';
import { useDocumentMeta } from '@/lib/use-document-meta';

const PRODUCT_CATEGORIES = [
  'PPE',
  'ICT Equipment',
  'Furniture',
  'Electrical Materials',
  'Plumbing Materials',
  'Construction Materials',
  'Uniforms',
  'Stationery',
];

const fields: FieldConfig[] = [
  { name: 'name', label: 'Product name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: PRODUCT_CATEGORIES },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'specifications', label: 'Specifications', type: 'textarea' },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'datasheet', label: 'PDF datasheet', type: 'document' },
];

function toValues(p?: Product): FieldValues {
  return {
    name: p?.name ?? '',
    category: p?.category ?? '',
    description: p?.description ?? '',
    specifications: p?.specifications ?? '',
    image: p?.image ?? '',
    datasheet: p?.datasheet ?? '',
  };
}

function toBody(values: FieldValues) {
  return {
    name: values.name,
    category: values.category,
    description: values.description,
    specifications: values.specifications || null,
    image: values.image || null,
    datasheet: values.datasheet || null,
  };
}

export function AdminProducts() {
  useDocumentMeta('Manage products', 'Create, edit and remove product catalogue listings.');
  const list = useListProducts(undefined, { query: { queryKey: ['/api/products'] } });
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const del = useDeleteProduct();

  return (
    <EntityPage<Product>
      title="Products"
      description="Manage the searchable product catalogue."
      fields={fields}
      columns={[
        { label: 'Name', render: (p) => p.name },
        { label: 'Category', render: (p) => p.category },
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
