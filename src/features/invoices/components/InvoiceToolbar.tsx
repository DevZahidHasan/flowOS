'use client';

import { ReactNode } from 'react';

interface Props {
  filters: ReactNode;
  actions?: ReactNode;
}

export function InvoiceToolbar({ filters, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-1">
      <div className="flex-1 w-full lg:w-auto">
        {filters}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
