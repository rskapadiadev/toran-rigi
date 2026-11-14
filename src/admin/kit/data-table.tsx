import {
    type Column,
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    type Table as TableInstance,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Filter,
    Search,
    X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { PanelCard } from '@/admin/kit/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface FacetOption {
    value: string;
    label: string;
}

export interface Facet {
    columnId: string;
    title: string;
    options: FacetOption[];
}

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    /** Card heading. Without one the toolbar alone heads the card. */
    title?: ReactNode;
    /** A muted prefix before the title: "Billing | Invoices". */
    section?: string;
    subtitle?: ReactNode;
    /** After search and Filter: a view switcher, then the primary button. */
    actions?: ReactNode;
    /** Plural, lower case, for the footer: "customers". */
    noun?: string;
    searchPlaceholder?: string;
    facets?: Facet[];
    initialSorting?: SortingState;
    pageSize?: number;
    /** Fill the page's remaining height (desktop): rows scroll inside, header and pagination stay. */
    fill?: boolean;
    onRowClick?: (row: TData) => void;
    isRowActive?: (row: TData) => boolean;
    rowLabel?: (row: TData) => string;
    empty?: ReactNode;
    className?: string;
}

/** Facet columns filter by "value is one of the selected options". */
export const inFilter = <TData,>(row: Row<TData>, id: string, value: string[]) =>
    value.length === 0 || value.includes(String(row.getValue(id)));

const LIMITS = [25, 50, 75, 100] as const;

// PayD's table pattern: ONE card — heading + toolbar in its header, the table flush in its body,
// pagination in the tinted footer.
export function DataTable<TData>({
    columns,
    data,
    title,
    section,
    subtitle,
    actions,
    noun = 'rows',
    searchPlaceholder = 'Search…',
    facets = [],
    initialSorting = [],
    pageSize = LIMITS[0],
    fill = true,
    onRowClick,
    isRowActive,
    rowLabel,
    empty,
    className,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns fresh functions each render by design; nothing here is memoised by the compiler.
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: { pagination: { pageSize } },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });
    const filtered = globalFilter !== '' || columnFilters.length > 0;

    // Title row, left to right: search, Filter, Reset, then the page's own switcher and button.
    const controls = (
        <>
            <InputGroup className="w-full min-w-0 sm:w-64 md:w-52 lg:w-64">
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                <InputGroupInput
                    aria-label={searchPlaceholder}
                    placeholder={searchPlaceholder}
                    value={globalFilter}
                    onChange={(e) => {
                        setGlobalFilter(e.target.value);
                    }}
                />
            </InputGroup>
            {facets.length > 0 && <FilterButton table={table} facets={facets} />}
            {filtered && (
                <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => {
                        setGlobalFilter('');
                        table.resetColumnFilters();
                    }}
                >
                    Reset
                    <X />
                </Button>
            )}
            {actions}
        </>
    );

    return (
        <PanelCard
            {...(title === undefined
                ? {
                      header: (
                          <div className="flex w-full flex-wrap items-center gap-2">{controls}</div>
                      ),
                  }
                : {
                      title,
                      section,
                      subtitle,
                      actions: controls,
                  })}
            padded={false}
            fill={fill}
            className={cn('data-table', className)}
            footer={<Pagination table={table} noun={noun} />}
        >
            <Table containerClassName={fill ? 'lg:min-h-0 lg:flex-1 lg:overflow-auto' : undefined}>
                <TableHeader>
                    {table.getHeaderGroups().map((group) => (
                        <TableRow key={group.id} className="hover:bg-transparent">
                            {group.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={isRowActive?.(row.original) ? 'selected' : undefined}
                                aria-label={rowLabel?.(row.original)}
                                tabIndex={onRowClick ? 0 : undefined}
                                className={cn(
                                    onRowClick &&
                                        'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none',
                                )}
                                onClick={
                                    onRowClick
                                        ? () => {
                                              onRowClick(row.original);
                                          }
                                        : undefined
                                }
                                onKeyDown={
                                    onRowClick
                                        ? (e) => {
                                              if (e.key === 'Enter') onRowClick(row.original);
                                          }
                                        : undefined
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={columns.length}
                                className="h-40 text-center text-sm text-muted-foreground"
                            >
                                {filtered ? 'No records found.' : empty}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </PanelCard>
    );
}

interface SortHeaderProps<TData> {
    column: Column<TData>;
    title: string;
    className?: string;
}

export function SortHeader<TData>({ column, title, className }: SortHeaderProps<TData>) {
    if (!column.getCanSort()) return <span className={className}>{title}</span>;
    const dir = column.getIsSorted();
    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn(
                '-ms-2 h-7 gap-1 px-2 text-xs font-medium tracking-wider text-inherit uppercase hover:bg-transparent hover:text-foreground',
                className,
            )}
            onClick={() => {
                column.toggleSorting(dir === 'asc');
            }}
        >
            {title}
            {dir === 'desc' ? (
                <ArrowDown className="size-3.5" />
            ) : dir === 'asc' ? (
                <ArrowUp className="size-3.5" />
            ) : (
                <ChevronsUpDown className="size-3.5 opacity-50" />
            )}
        </Button>
    );
}

interface FilterButtonProps<TData> {
    table: TableInstance<TData>;
    facets: Facet[];
}

const BADGE =
    'absolute -top-1.5 -end-1.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground';

// PayD's PDAFilterButton: ONE Filter button, badged with how many filters are set — no chip row.
function FilterButton<TData>({ table, facets }: FilterButtonProps<TData>) {
    const active = facets.reduce((n, f) => {
        const value = table.getColumn(f.columnId)?.getFilterValue() as string[] | undefined;
        return n + (value?.length ?? 0);
    }, 0);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="relative"
                    aria-label={active > 0 ? `Filter, ${String(active)} active` : undefined}
                >
                    <Filter aria-hidden />
                    Filter
                    {active > 0 && (
                        <span aria-hidden className={BADGE}>
                            {active}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <p className="text-sm font-medium">Filter</p>
                    {active > 0 && (
                        <Button
                            variant="link"
                            className="text-xs"
                            onClick={() => {
                                table.resetColumnFilters();
                            }}
                        >
                            Clear all
                        </Button>
                    )}
                </div>
                <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-4">
                    {facets.map((facet) => {
                        const column = table.getColumn(facet.columnId);
                        return column ? (
                            <FacetGroup key={facet.columnId} column={column} facet={facet} />
                        ) : null;
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface FacetGroupProps<TData> {
    column: Column<TData>;
    facet: Facet;
}

function FacetGroup<TData>({ column, facet }: FacetGroupProps<TData>) {
    const counts = column.getFacetedUniqueValues();
    const selected = new Set((column.getFilterValue() as string[] | undefined) ?? []);
    const options = facet.options.filter((o) => counts.has(o.value) || selected.has(o.value));
    const toggle = (value: string) => {
        const next = new Set(selected);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        column.setFilterValue(next.size ? [...next] : undefined);
    };
    return (
        <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {facet.title}
            </legend>
            {options.map((option) => {
                const id = `facet-${facet.columnId}-${option.value}`;
                return (
                    <label
                        key={option.value}
                        htmlFor={id}
                        className="flex h-8 items-center gap-2.5 rounded-control px-2 text-sm hover:bg-muted"
                    >
                        <Checkbox
                            id={id}
                            checked={selected.has(option.value)}
                            onCheckedChange={() => {
                                toggle(option.value);
                            }}
                        />
                        <span className="flex-1 truncate">{option.label}</span>
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                            {counts.get(option.value) ?? 0}
                        </span>
                    </label>
                );
            })}
        </fieldset>
    );
}

interface PaginationProps<TData> {
    table: TableInstance<TData>;
    noun: string;
}

// "1 2 … 9 10": the first, last and two around the current page.
function pageTokens(page: number, total: number): (number | 'gap-left' | 'gap-right')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const tokens: (number | 'gap-left' | 'gap-right')[] = [1];
    const from = Math.max(2, page - 1);
    const to = Math.min(total - 1, page + 1);
    if (from > 2) tokens.push('gap-left');
    for (let p = from; p <= to; p++) tokens.push(p);
    if (to < total - 1) tokens.push('gap-right');
    tokens.push(total);
    return tokens;
}

// PayD's PDAPagination: Limit | "Page 1 of 3 · 64 customers" | ‹ Previous 1 2 3 Next ›.
function Pagination<TData>({ table, noun }: PaginationProps<TData>) {
    const total = table.getFilteredRowModel().rows.length;
    const { pageIndex, pageSize } = table.getState().pagination;
    const page = pageIndex + 1;
    const pages = Math.max(1, table.getPageCount());
    // A Limit control only when more rows exist than the smallest page shows.
    const offerLimit = total > LIMITS[0];
    const summary = (
        <>
            Page {page} of {pages} · {total.toLocaleString()} {noun}
        </>
    );
    return (
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm md:grid-cols-[auto_1fr_auto] lg:grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)]">
            <div className="col-start-1 row-start-1 flex min-h-8 shrink-0 items-center gap-2">
                {offerLimit && (
                    <>
                        <span className="text-muted-foreground">Limit:</span>
                        <Select
                            value={String(pageSize)}
                            onValueChange={(v) => {
                                table.setPageSize(Number(v));
                            }}
                        >
                            <SelectTrigger
                                className="w-fit shrink-0"
                                aria-label={`${noun} per page`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                {LIMITS.map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                )}
            </div>
            <p className="col-start-2 row-start-1 min-w-0 text-end text-muted-foreground md:col-start-2 md:text-center">
                {summary}
            </p>
            {pages > 1 && (
                <nav
                    aria-label={`${noun} pages`}
                    className="col-span-2 row-start-2 flex items-center justify-end gap-0.5 md:col-span-1 md:col-start-3 md:row-start-1"
                >
                    <Button
                        variant="ghost"
                        className="ps-1.5!"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => {
                            table.previousPage();
                        }}
                    >
                        <ChevronLeft className="rtl:rotate-180" />
                        <span className="hidden sm:block">Previous</span>
                    </Button>
                    {pageTokens(page, pages).map((token) =>
                        typeof token === 'number' ? (
                            <Button
                                key={token}
                                variant={token === page ? 'outline' : 'ghost'}
                                size="icon"
                                aria-current={token === page ? 'page' : undefined}
                                className={cn('tabular-nums', token === page && 'text-primary')}
                                onClick={() => {
                                    table.setPageIndex(token - 1);
                                }}
                            >
                                {token}
                            </Button>
                        ) : (
                            <span
                                key={token}
                                aria-hidden
                                className="flex size-8 items-center justify-center text-muted-foreground"
                            >
                                …
                            </span>
                        ),
                    )}
                    <Button
                        variant="ghost"
                        className="pe-1.5!"
                        disabled={!table.getCanNextPage()}
                        onClick={() => {
                            table.nextPage();
                        }}
                    >
                        <span className="hidden sm:block">Next</span>
                        <ChevronRight className="rtl:rotate-180" />
                    </Button>
                </nav>
            )}
        </div>
    );
}
