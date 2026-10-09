'use client';

import React, { useState } from 'react';
import { SentEmail } from '../lib/types';
import { Table, Column } from './ui/table';
import { Badge } from './ui/badge';
import { formatScheduledTime } from '../lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

export interface SentTableProps {
  emails: SentEmail[];
  loading: boolean;
  onOpenCompose: () => void;
  onSelectEmail?: (email: SentEmail) => void;
}

export const SentTable: React.FC<SentTableProps> = ({
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
        title="No sent emails"
        description="No emails have been delivered yet. Scheduled jobs will appear here once executed."
        onAction={onOpenCompose}
        actionText="Compose New Email"
      />
    );
  }

  const totalPages = Math.ceil(emails.length / pageSize);
  const paginatedEmails = emails.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<SentEmail>[] = [
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
      header: 'Sent Time',
      cell: (item) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {item.sentAt ? formatScheduledTime(item.sentAt) : formatScheduledTime(item.scheduledAt)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => {
        const isSuccess = item.status === 'SENT';
        return (
          <Badge variant={isSuccess ? 'success' : 'danger'}>
            <span className="flex items-center space-x-1">
              {isSuccess ? (
                <CheckCircle className="w-3 h-3 text-emerald-600 inline mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600 inline mr-1" />
              )}
              <span>{item.status}</span>
            </span>
          </Badge>
        );
      },
    },
    {
      header: 'Preview',
      cell: (item) => {
        if (!item.etherealPreviewUrl) {
          return <span className="text-gray-400 text-[11px]">—</span>;
        }
        return (
          <a
            href={item.etherealPreviewUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[#00A859] hover:underline"
          >
            <span>View Ethereal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
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
