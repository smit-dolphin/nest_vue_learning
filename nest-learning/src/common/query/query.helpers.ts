export interface PaginationQuery {
    page?: string | number;
    limit?: string | number;
}

export interface PaginationMeta {
    totalData: number;
    totalPages: number;
    currentPage: number;
    itemPerPage: number;
}

export interface PaginationResult {
    take: number;
    currentPage: number;
    skip: number;
    meta: PaginationMeta;
}

export type PrismaWhere = Record<string, any>;

/**
 * Resolves the page/limit values from the incoming query and returns the
 * pagination slice (skip/take) plus a meta object describing the result set.
 */
export function paginationHelper(
    query: PaginationQuery,
    totalData: number,
    itemPerPage = 10,
): PaginationResult {
    const limit = Math.max(1, Number(query.limit) || itemPerPage);
    const currentPage = Math.max(1, Number(query.page) || 1);

    return {
        take: limit,
        currentPage,
        skip: (currentPage - 1) * limit,
        meta: {
            totalData,
            totalPages: Math.ceil(totalData / limit),
            currentPage,
            itemPerPage: limit,
        },
    };
}

/**
 * Builds a nested Prisma filter object from a dotted field path,
 * e.g. "employee.firstName" -> { employee: { firstName: value } }.
 */
export function buildNestedFilter(
    fieldPath: string,
    value: unknown,
): Record<string, unknown> {
    const parts = fieldPath.split('.');
    const result = parts.reduceRight<unknown>(
        (acc, part) => ({ [part]: acc }),
        value,
    );
    return result as Record<string, unknown>;
}

/**
 * Adds an OR search across the given fields to the where clause.
 */
export function searchHelper(
    where: PrismaWhere,
    search: string | null | undefined,
    fields: string[] = [],
): PrismaWhere {
    const query = search?.trim();
    if (!query || !fields.length) return where;

    const andFilter = (where.AND as unknown[]) || [];
    where.AND = andFilter;
    andFilter.push({
        OR: fields.map((field) =>
            buildNestedFilter(field, {
                contains: query,
                mode: 'insensitive',
            }),
        ),
    });

    return where;
}

/**
 * Adds a boolean equality filter for the given field. Ignores values that
 * are not the literal strings "true"/"false".
 */
export function booleanFilter(
    where: PrismaWhere,
    field: string,
    value: unknown,
): PrismaWhere {
    if (value === undefined || value === null || value === '') return where;
    if (typeof value !== 'string' && typeof value !== 'number') return where;

    const normalized = String(value).toLowerCase();
    if (normalized !== 'true' && normalized !== 'false') return where;

    where[field] = normalized === 'true';
    return where;
}

/**
 * Adds an enum equality filter, validating the value against the provided
 * enum object. When the field was already set it is moved into the AND list
 * alongside the new value.
 */
export function enumFilter(
    where: PrismaWhere,
    field: string,
    value: unknown,
    enumObject?: Record<string, unknown>,
): PrismaWhere {
    if (value === undefined || value === null || value === '') return where;
    if (typeof value !== 'string' && typeof value !== 'number') return where;

    const raw = String(value);
    const allowedValues = enumObject ? Object.values(enumObject) : [];
    if (allowedValues.length && !allowedValues.includes(raw)) {
        return where;
    }

    if (Object.prototype.hasOwnProperty.call(where, field)) {
        const existing = where[field] as unknown;
        const andFilter = (where.AND as unknown[]) || [];
        where.AND = andFilter;
        andFilter.push({ [field]: existing });
        andFilter.push({ [field]: raw });
        delete where[field];
    } else {
        where[field] = raw;
    }

    return where;
}

/**
 * Adds a date range filter (gte from / lte to) for the given field.
 */
export function dateRangeFilter(
    where: PrismaWhere,
    field: string,
    from?: string,
    to?: string,
): PrismaWhere {
    if (!from && !to) return where;

    where[field] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
    };

    return where;
}