import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Hiển thị tất cả các trang nếu tổng số trang <= 5
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Hiển thị với dấu ...
            if (currentPage <= 3) {
                // Ở đầu
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Ở cuối
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Ở giữa
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8 mb-8">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                    }`}
            >
                <ChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="flex items-center justify-center w-10 h-10 text-gray-500"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all font-medium ${currentPage === page
                                ? 'bg-black text-white border-black'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                    >
                        {page}
                    </button>
                )
            ))}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                    }`}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
