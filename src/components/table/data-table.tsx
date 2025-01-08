"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableProps, SortDirection, PaginationState } from "./types";
import { sortData, filterData, paginateData } from "./table-utils";

export function DataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  searchable = true,
  searchField = "title" as keyof T,
  defaultSort,
  rowSelection = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onEdit,
  onDelete,
  onAdd,
  onRowClick,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    field: keyof T | undefined;
    direction: SortDirection;
  }>({
    field: defaultSort?.field,
    direction: defaultSort?.direction,
  });

  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Handle sorting
  const handleSort = (field: keyof T) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field
          ? current.direction === "asc"
            ? "desc"
            : current.direction === "desc"
            ? undefined
            : "asc"
          : "asc",
    }));
  };

  // Process data with sorting, filtering, and pagination
  const processedData = useMemo(() => {
    let processed = [...data];

    // Apply search filter
    if (searchValue && searchField) {
      processed = filterData(processed, searchField, searchValue);
    }

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      processed = sortData(processed, sortConfig.field, sortConfig.direction);
    }

    // Get total count before pagination
    const totalCount = processed.length;

    // Apply pagination
    const paginatedData = paginateData(
      processed,
      pagination.pageIndex,
      pagination.pageSize
    );

    return { data: paginatedData, totalCount };
  }, [data, searchValue, sortConfig, pagination]);

  // Handle row selection
  const handleSelectAll = () => {
    if (selectedRows.size === processedData.data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.data.map((_, index) => index)));
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const totalPages = Math.ceil(processedData.totalCount / pagination.pageSize);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        {onAdd && (
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center justify-between py-4">
            {searchable && (
              <Input
                placeholder="Filter items..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-sm"
              />
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {rowSelection && (
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          selectedRows.size === processedData.data.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={
                        column.sortable ? "cursor-pointer select-none" : ""
                      }
                      onClick={() =>
                        column.sortable && handleSort(column.accessorKey)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.header}</span>
                        {column.sortable && (
                          <div className="w-4">
                            {sortConfig.field === column.accessorKey ? (
                              sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : sortConfig.direction === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={onRowClick ? "cursor-pointer" : ""}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {rowSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(rowIndex)}
                          onCheckedChange={() => handleSelectRow(rowIndex)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.cell
                          ? column.cell({ row })
                          : String(row[column.accessorKey])}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete) && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(row)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(row)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                {selectedRows.size} of {processedData.totalCount} row(s)
                selected.
              </p>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  setPagination((current) => ({
                    ...current,
                    pageSize: Number(value),
                    pageIndex: 0,
                  }))
                }
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">rows per page</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }
                disabled={pagination.pageIndex === 0}
              >
                {"<<"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    pageIndex: current.pageIndex - 1,
                  }))
                }
                disabled={pagination.pageIndex === 0}
              >
                {"<"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {pagination.pageIndex + 1} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    pageIndex: current.pageIndex + 1,
                  }))
                }
                disabled={pagination.pageIndex === totalPages - 1}
              >
                {">"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    pageIndex: totalPages - 1,
                  }))
                }
                disabled={pagination.pageIndex === totalPages - 1}
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
