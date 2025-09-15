
'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useLocalStorage } from '@/hooks/use-local-storage';

const MIN_ROWS = 1;
const MIN_COLS = 1;

export function SpreadsheetView() {
  const [gridData, setGridData] = useLocalStorage<string[][]>('projects:spreadsheet-v2', 
    () => Array(5).fill(null).map(() => Array(4).fill(''))
  );

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGridData = gridData.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    setGridData(newGridData);
  };

  const addRow = () => {
    const numCols = gridData[0]?.length || MIN_COLS;
    setGridData([...gridData, Array(numCols).fill('')]);
  };
  
  const addCol = () => {
    setGridData(gridData.map(row => [...row, '']));
  };

  const removeRow = (rowIndex: number) => {
    if (gridData.length <= MIN_ROWS) return;
    setGridData(gridData.filter((_, rIdx) => rIdx !== rowIndex));
  }

  const removeCol = (colIndex: number) => {
    if (gridData[0]?.length <= MIN_COLS) return;
    setGridData(gridData.map(row => row.filter((_, cIdx) => cIdx !== colIndex)));
  }

  const numRows = gridData.length;
  const numCols = gridData[0]?.length || 0;

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <div className="flex gap-2">
            <Button onClick={addRow} variant="outline">
                <Plus className="mr-2 h-4 w-4"/> Add Row
            </Button>
            <Button onClick={addCol} variant="outline">
                <Plus className="mr-2 h-4 w-4"/> Add Column
            </Button>
        </div>

        <div className="flex-1 relative border rounded-lg overflow-hidden">
            <ScrollArea className="w-full h-full">
                <table className="border-collapse table-fixed w-full">
                    <thead className="sticky top-0 bg-muted z-10">
                        <tr>
                            <th className="sticky left-0 bg-muted w-14 h-8 border-b border-r z-20"></th>
                            {Array.from({ length: numCols }).map((_, colIndex) => (
                                <th key={colIndex} className="w-40 border p-0 text-center font-medium text-muted-foreground text-sm relative group">
                                    <div className="p-1">
                                      {String.fromCharCode(65 + colIndex)}
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeCol(colIndex)}
                                      disabled={numCols <= MIN_COLS}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numRows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="group">
                                <td className="sticky left-0 bg-muted w-14 border-r border-b p-0 text-center text-sm text-muted-foreground relative">
                                  <div className="p-1">{rowIndex + 1}</div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeRow(rowIndex)}
                                    disabled={numRows <= MIN_ROWS}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </td>
                                {Array.from({ length: numCols }).map((_, colIndex) => (
                                    <td key={`${rowIndex}-${colIndex}`} className="p-0 border">
                                        <Input
                                            type="text"
                                            value={gridData[rowIndex]?.[colIndex] || ''}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            className="w-full h-full p-1.5 text-sm bg-transparent border-0 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:z-10"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    </div>
  );
}
