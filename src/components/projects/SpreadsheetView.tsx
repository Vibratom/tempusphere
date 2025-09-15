
'use client';

import React, { useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Plus, Trash2 as X } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const MIN_ROWS = 1;
const MIN_COLS = 1;

export function SpreadsheetView() {
  const [gridData, setGridData] = useLocalStorage<string[][]>('projects:spreadsheet-v2', 
    () => Array(5).fill(null).map(() => Array(4).fill(''))
  );
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([]);


  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGridData = gridData.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell)
        : row
    );
    setGridData(newGridData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
        case 'Enter':
        case 'ArrowDown':
            e.preventDefault();
            nextRow = Math.min(numRows - 1, rowIndex + 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            nextRow = Math.max(0, rowIndex - 1);
            break;
        case 'ArrowLeft':
            if(e.currentTarget.selectionStart === 0) {
              e.preventDefault();
              nextCol = Math.max(0, colIndex - 1);
            }
            break;
        case 'ArrowRight':
            if(e.currentTarget.selectionStart === e.currentTarget.value.length) {
              e.preventDefault();
              nextCol = Math.min(numCols - 1, colIndex + 1);
            }
            break;
        default:
            return;
    }

    if (cellRefs.current[nextRow] && cellRefs.current[nextRow][nextCol]) {
      cellRefs.current[nextRow][nextCol]?.focus();
    }
  }

  const addRow = () => {
    const currentGrid = Array.isArray(gridData) ? gridData : [];
    const numCols = currentGrid[0]?.length || MIN_COLS;
    setGridData([...currentGrid, Array(numCols).fill('')]);
  };
  
  const addCol = () => {
    const currentGrid = Array.isArray(gridData) ? gridData : [[]];
    setGridData(currentGrid.map(row => [...(Array.isArray(row) ? row : []), '']));
  };

  const removeRow = (rowIndex: number) => {
    if (!Array.isArray(gridData) || gridData.length <= MIN_ROWS) return;
    setGridData(gridData.filter((_, rIdx) => rIdx !== rowIndex));
  }

  const removeCol = (colIndex: number) => {
    if (!Array.isArray(gridData) || !gridData[0] || gridData[0].length <= MIN_COLS) return;
    setGridData(gridData.map(row => row.filter((_, cIdx) => cIdx !== colIndex)));
  }

  const numRows = Array.isArray(gridData) ? gridData.length : 0;
  const numCols = Array.isArray(gridData) && gridData[0] ? gridData[0].length : 0;
  
  // Ensure refs array is up to date
  cellRefs.current = Array(numRows).fill(null).map(() => Array(numCols).fill(null));

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
                                            ref={el => {
                                              if (cellRefs.current[rowIndex]) {
                                                cellRefs.current[rowIndex][colIndex] = el;
                                              }
                                            }}
                                            value={gridData?.[rowIndex]?.[colIndex] || ''}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
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
