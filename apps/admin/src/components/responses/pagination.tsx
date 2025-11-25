'use client';

import Button from '@glint/ui/button';
import type {PaginationProps} from './types';

const Pagination: React.FC<PaginationProps> = ({currentPage, onPageChange, pageSize, total}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = currentPage * pageSize + 1;
    const end = Math.min(total, (currentPage + 1) * pageSize);
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage + 1 >= totalPages;

    return (
        <div className="flex items-center justify-between sticky bottom-0 border-t py-4 bg-white/70 backdrop-blur-lg text-sm text-muted-foreground">
            <span>
                Showing {start}-{end} of {total} answers
            </span>
            <div className="flex gap-2">
                <Button
                    disabled={isFirstPage}
                    onClick={() => onPageChange(currentPage - 1)}
                    size="sm"
                    variant="outline"
                >
                    Previous
                </Button>
                <Button
                    disabled={isLastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    size="sm"
                    variant="outline"
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
