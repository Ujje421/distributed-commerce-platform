export declare class PaginationDto {
    page: number;
    limit: number;
    get skip(): number;
}
export declare class PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    constructor(data: T[], total: number, page: number, limit: number);
}
export declare class SortDto {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
//# sourceMappingURL=pagination.dto.d.ts.map