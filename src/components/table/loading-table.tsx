"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingTableProps {
  columnCount?: number;
  rowCount?: number;
  showToolbar?: boolean;
}

export function LoadingTable({
  columnCount = 5,
  rowCount = 5,
  showToolbar = true,
}: LoadingTableProps) {
  return (
    <Card>
      <CardContent>
        {showToolbar && (
          <div className="flex items-center justify-between py-4">
            <Skeleton className="h-9 w-[250px]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-[100px]" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
      </CardContent>
    </Card>
  );
}
