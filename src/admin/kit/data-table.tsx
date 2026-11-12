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
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    PlusCircle,
    Search,
    X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
    searchPlaceholder?: string;
    facets?: Facet[];
    toolbar?: ReactNode;
    initialSorting?: SortingState;
    pageSize?: number;
    onRowClick?: (row: TData) => void;
    isRowActive?: (row: TData) => boolean;
    rowLabel?: (row: TData) => string;
    empty?: ReactNode;
    className?: string;
}

/** Facet columns filter by "value is one of the selected options". */
export const inFilter = <TData,>(row: Row<TData>, id: string, value: string[]) =>
    value.length === 0 || value.includes(String(row.getValue(id)));

export function DataTable<TData>({
    columns,
    data,
    searchPlaceholder = 'Search…',
    facets = [],
    toolbar,
    initialSorting = [],
    pageSize = 10,
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

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap items-center gap-2">
                <InputGroup className="h-8 w-full bg-card sm:w-64">
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
                {facets.map((facet) => {
                    const column = table.getColumn(facet.columnId);
                    return column ? (
                        <FacetedFilter key={facet.columnId} column={column} facet={facet} />
                    ) : null;
                })}
                {filtered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground"
                        onClick={() => {
                            setGlobalFilter('');
                            table.resetColumnFilters();
                        }}
                    >
                        Reset
                        <X />
                    </Button>
                )}
                {toolbar && <div className="ms-auto flex items-center gap-2">{toolbar}</div>}
            </div>
            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id} className="hover:bg-transparent">
                                {group.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-10 px-4 text-xs font-medium text-muted-foreground first:ps-5 last:pe-5"
                                    >
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
                                    data-state={
                                        isRowActive?.(row.original) ? 'selected' : undefined
                                    }
                                    aria-label={rowLabel?.(row.original)}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    className={cn(
                                        onRowClick &&
                                            'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none',
                                        'data-[state=selected]:bg-gold/8',
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
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3 first:ps-5 last:pe-5"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
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
                                    {filtered ? 'No results match these filters.' : empty}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination table={table} />
        </div>
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
                '-ms-2.5 h-7 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground',
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

interface FacetedFilterProps<TData> {
    column: Column<TData>;
    facet: Facet;
}

function FacetedFilter<TData>({ column, facet }: FacetedFilterProps<TData>) {
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
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed bg-card">
                    <PlusCircle />
                    {facet.title}
                    {selected.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-0.5 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                {selected.size}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start">
                <Command>
                    <CommandInput placeholder={facet.title} />
                    <CommandList>
                        <CommandEmpty>No options.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const on = selected.has(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            toggle(option.value);
                                        }}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-4 items-center justify-center rounded-[4px] border',
                                                on
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input',
                                            )}
                                        >
                                            {on && <Check className="size-3 text-current" />}
                                        </span>
                                        <span className="flex-1">{option.label}</span>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {counts.get(option.value) ?? 0}
                                        </span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selected.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        className="justify-center text-center"
                                        onSelect={() => {
                                            column.setFilterValue(undefined);
                                        }}
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface PaginationProps<TData> {
    table: TableInstance<TData>;
}

function Pagination<TData>({ table }: PaginationProps<TData>) {
    const total = table.getFilteredRowModel().rows.length;
    const { pageIndex, pageSize } = table.getState().pagination;
    const from = total === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min(total, (pageIndex + 1) * pageSize);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
            <span>
                {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span>Rows</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                            table.setPageSize(Number(v));
                        }}
                    >
                        <SelectTrigger
                            size="sm"
                            className="h-7 w-[68px] bg-card text-xs"
                            aria-label="Rows per page"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {[10, 20, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-7 bg-card"
                        aria-label="Previous page"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => {
                            table.previousPage();
                        }}
                    >
                        <ChevronLeft className="rtl:rotate-180" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-7 bg-card"
                        aria-label="Next page"
                        disabled={!table.getCanNextPage()}
                        onClick={() => {
                            table.nextPage();
                        }}
                    >
                        <ChevronRight className="rtl:rotate-180" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
