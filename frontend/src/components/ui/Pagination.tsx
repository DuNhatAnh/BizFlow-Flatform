import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    itemName?: string;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    itemName = "sản phẩm",
    onPageChange
}) => {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const handleFirst = () => {
        if (currentPage > 1) onPageChange(1);
    };

    const handleLast = () => {
        if (currentPage < totalPages) onPageChange(totalPages);
    };

    return (
        <div className="flex items-center justify-between border-t border-surface-container-high bg-white px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-on-surface-variant">
                        Hiển thị <span className="font-bold text-on-surface">{startItem}</span> - <span className="font-bold text-on-surface">{endItem}</span> trong tổng số <span className="font-bold text-on-surface">{totalItems}</span> {itemName}
                    </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={handleFirst} 
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-colors"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handlePrev} 
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="px-4 py-1.5 text-sm font-bold text-on-surface bg-white border border-outline-variant rounded-full mx-1">
                      Trang {currentPage} / {totalPages || 1}
                    </div>
                    
                    <button 
                      onClick={handleNext} 
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleLast} 
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-colors"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
            </div>
            
            {/* Mobile view */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                >
                    Trước
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative ml-3 inline-flex items-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};
