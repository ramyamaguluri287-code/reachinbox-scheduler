'use client';

import React, { useState } from 'react';
import { ScheduledEmail } from '../lib/types';
import { Table, Column } from './ui/table';
import { Badge } from './ui/badge';
import { formatScheduledTime } from '../lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from './ui/button';

export interface ScheduledTableProps {
  emails: ScheduledEmail[];
  loading: boolean;
  onOpenCompose: () => void;
  onSelectEmail?: (email: ScheduledEmail) => void;
}

export const ScheduledTable: React.FC<ScheduledTableProps> = ({
  emails,
  loading,
  onOpenCompose,
  onSelectEmail,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        title="No scheduled emails"
        description="You have no emails waiting in the schedule queue. Compose a new campaign to get started."
        onAction={onOpenCompose}
        actionText="Compose New Email"
      />
    );
  }

  const totalPages = Math.ceil(emails.length / pageSize);
  const paginatedEmails = emails.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<ScheduledEmail>[] = [
    {
      header: 'Recipient Email',
      accessorKey: 'recipientEmail',
      className: 'font-semibold text-gray-900',
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      className: 'text-gray-700 max-w-xs truncate',
    },
    {
      header: 'Scheduled Time',
      cell: (item) => (
        <span className="inline-flex items-center space-x-1.5 text-gray-500 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{formatScheduledTime(item.scheduledAt)}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => {
        const isRescheduled = item.status === 'RESCHEDULED';
        return (
          <Badge variant={isRescheduled ? 'info' : 'warning'}>
            {isRescheduled ? 'RESCHEDULED' : 'PENDING'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        data={paginatedEmails}
        keyExtractor={(item) => item.id}
        onRowClick={onSelectEmail}
      />

      {/* Pagination Controls (10 per page) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, emails.length)} of {emails.length} emails
          </span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 text-xs font-semibold">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
