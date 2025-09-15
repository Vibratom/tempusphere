
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Plus, Sigma } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const COLS = 26;
const ROWS = 100;

// Function to convert column index to letter (0 -> A, 1 -> B)
const colToLetter = (colIndex: number) => {
  let temp, letter = '';
  while (colIndex >= 0) {
    temp = colIndex % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};


// Function to parse cell coordinates like "A1" into [row, col]
const parseCellId = (cellId: string): [number, number] | null => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return null;
    
    const colStr = match[1].toUpperCase();
    const row = parseInt(match[2], 10) - 1;
    
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64) - 1;
    }
    
    return [row, col];
}

const functionHelpers = [
  { func: 'SUM', example: '=SUM(A1:A10)', description: 'Calculates the sum of a range of cells.' },
];

export function SpreadsheetView() {
  const [gridData, setGridData] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [numRows, setNumRows] = useState(ROWS);
  const [numCols, setNumCols] = useState(COLS);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const formulaInputRef = React.useRef<HTMLInputElement>(null);


  const handleCellChange = (row: number, col: number, value: string) => {
    const newGridData = [...gridData];
    newGridData[row][col] = value;
    setGridData(newGridData);
  };

  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaBarValue(e.target.value);
    if (activeCell) {
        handleCellChange(activeCell.row, activeCell.col, e.target.value);
    }
  }

  const addRow = () => {
    setGridData(prev => [...prev, Array(numCols).fill('')]);
    setNumRows(prev => prev + 1);
  };
  
  const addCol = () => {
    setGridData(prev => prev.map(row => [...row, '']));
    setNumCols(prev => prev + 1);
  };

  const evaluateCell = (row: number, col: number): string => {
    const cellData = gridData[row][col];
    if (!cellData.startsWith('=')) {
        return cellData;
    }

    const formula = cellData.substring(1).toUpperCase();
    
    // Simple SUM formula: =SUM(A1:B10)
    const sumMatch = formula.match(/^SUM\((([A-Z]+\d+):([A-Z]+\d+))\)$/);
    if (sumMatch) {
        const startCell = parseCellId(sumMatch[2]);
        const endCell = parseCellId(sumMatch[3]);

        if (startCell && endCell) {
            let sum = 0;
            for (let r = Math.min(startCell[0], endCell[0]); r <= Math.max(startCell[0], endCell[0]); r++) {
                for (let c = Math.min(startCell[1], endCell[1]); c <= Math.max(startCell[1], endCell[1]); c++) {
                    if (r < numRows && c < numCols) {
                       const val = parseFloat(evaluateCell(r, c));
                       if(!isNaN(val)) sum += val;
                    }
                }
            }
            return sum.toString();
        }
    }

    return '#ERROR!'; // Return error if formula is not recognized
  };

  useEffect(() => {
    if (activeCell) {
        setFormulaBarValue(gridData[activeCell.row][activeCell.col]);
    } else {
        setFormulaBarValue('');
    }
  }, [activeCell, gridData]);

  const handleSumClick = () => {
    if (activeCell) {
        const newValue = '=SUM()';
        setFormulaBarValue(newValue);
        handleCellChange(activeCell.row, activeCell.col, newValue);
        setTimeout(() => {
            if (formulaInputRef.current) {
                formulaInputRef.current.focus();
                formulaInputRef.current.setSelectionRange(5, 5);
            }
        }, 0);
    }
  }

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

        <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleSumClick}>
                            <Sigma className="h-5 w-5"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="p-4 max-w-xs">
                        <h4 className="font-bold mb-2">Function Helper</h4>
                        <div className="space-y-2">
                        {functionHelpers.map(f => (
                            <div key={f.func}>
                                <p className="font-mono text-xs bg-muted p-1 rounded">{f.example}</p>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </div>
                        ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Input 
                ref={formulaInputRef}
                value={formulaBarValue}
                onChange={handleFormulaBarChange}
                placeholder={activeCell ? `${colToLetter(activeCell.col)}${activeCell.row + 1}` : 'Select a cell to edit'}
                className="font-mono text-sm"
            />
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
                                        {activeCell?.row === rowIndex && activeCell?.col === colIndex ? (
                                            <Input
                                                type="text"
                                                value={gridData[rowIndex][colIndex]}
                                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
                                                onBlur={() => setActiveCell(null)}
                                                autoFocus
                                                className={cn(
                                                    "w-full h-full p-1.5 text-sm bg-transparent border-0 rounded-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
                                                )}
                                            />
                                        ) : (
                                            <div
                                                className={cn("w-full h-full p-1.5 text-sm truncate cursor-cell",
                                                    isNaN(parseFloat(evaluateCell(rowIndex, colIndex))) ? 'text-left' : 'text-right'
                                                )}
                                                onClick={() => setActiveCell({ row: rowIndex, col: colIndex })}
                                            >
                                                {evaluateCell(rowIndex, colIndex)}
                                            </div>
                                        )}
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
