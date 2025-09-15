
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Plus, Table } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const COLS = 26;
const ROWS = 100;

// Function to convert column index to letter (0 -> A, 1 -> B)
const colToLetter = (colIndex: number) => {
  return String.fromCharCode(65 + colIndex);
};

export function SpreadsheetView() {
  const [gridData, setGridData] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [numRows, setNumRows] = useState(ROWS);
  const [numCols, setNumCols] = useState(COLS);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellChange = (row: number, col: number, value: string) => {
    const newGridData = [...gridData];
    newGridData[row][col] = value;
    setGridData(newGridData);
  };
  
  const addRow = () => {
    setGridData(prev => [...prev, Array(numCols).fill('')]);
    setNumRows(prev => prev + 1);
  };
  
  const addCol = () => {
    setGridData(prev => prev.map(row => [...row, '']));
    setNumCols(prev => prev + 1);
  };

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
                            {/* Corner cell */}
                            <th className="sticky left-0 bg-muted w-14 h-8 border-b border-r z-20"></th>
                            {Array.from({ length: numCols }).map((_, colIndex) => (
                                <th key={colIndex} className="w-32 border p-1 text-center font-medium text-muted-foreground text-sm">
                                    {colToLetter(colIndex)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numRows }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {/* Row number cell */}
                                <td className="sticky left-0 bg-muted w-14 border-r border-b p-1 text-center text-sm text-muted-foreground">{rowIndex + 1}</td>
                                {Array.from({ length: numCols }).map((_, colIndex) => (
                                    <td key={`${rowIndex}-${colIndex}`} className="border p-0">
                                        <Input
                                            type="text"
                                            value={gridData[rowIndex][colIndex]}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
                                            onBlur={() => setActiveCell(null)}
                                            className={cn(
                                                "w-full h-full p-1.5 text-sm bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
                                                activeCell?.row === rowIndex && activeCell?.col === colIndex && "ring-1 ring-ring ring-inset"
                                            )}
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
