
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Plus, Sigma, ArrowDown } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

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

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export function SpreadsheetView() {
  const [gridData, setGridData] = useState<string[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [numRows, setNumRows] = useState(ROWS);
  const [numCols, setNumCols] = useState(COLS);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const formulaInputRef = React.useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [formulaMode, setFormulaMode] = useState(false);


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
    if (row >= gridData.length || col >= gridData[row].length) return '';
    const cellData = gridData[row][col];
    if (!cellData.startsWith('=')) {
        return cellData;
    }

    const formula = cellData.substring(1).toUpperCase();
    
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

    // Check for single cell reference
    const cellRefMatch = formula.match(/^([A-Z]+\d+)$/);
    if(cellRefMatch) {
      const refCell = parseCellId(cellRefMatch[1]);
      if (refCell && (refCell[0] !== row || refCell[1] !== col)) { // Prevent self-reference
        return evaluateCell(refCell[0], refCell[1]);
      }
    }

    return '#ERROR!';
  };

  useEffect(() => {
    if (formulaMode) {
      formulaInputRef.current?.focus();
      formulaInputRef.current?.select();
    } else if (activeCell) {
      setFormulaBarValue(gridData[activeCell.row][activeCell.col]);
    } else {
      setFormulaBarValue('');
    }
  }, [activeCell, gridData, formulaMode]);


  const handleMouseDown = (row: number, col: number) => {
    if (formulaMode) {
      handleCellChange(row, col, formulaBarValue);
      setFormulaMode(false);
      setFormulaBarValue('');
      setActiveCell({ row, col });
      setSelection(null);
      return;
    }
    
    setIsSelecting(true);
    setSelection({ startRow: row, startCol: col, endRow: row, endCol: col });
    setActiveCell({ row, col });
    
    // Deactivate editing mode when starting a new selection
    if (activeCell?.row !== row || activeCell?.col !== col) {
      setActiveCell(null);
    }
  };
  
  const handleMouseOver = (row: number, col: number) => {
    if (isSelecting) {
      setSelection(prev => prev ? { ...prev, endRow: row, endCol: col } : null);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };
  
  const handleDoubleClick = (row: number, col: number) => {
      setActiveCell({ row, col });
      setSelection(null); // Clear selection when editing
      setFormulaMode(false);
  }
  
  const isCellSelected = (row: number, col: number) => {
    if (!selection) return false;
    const { startRow, startCol, endRow, endCol } = selection;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };
  
  const isCellActiveForSelection = (row: number, col: number) => {
    if (!activeCell || selection) return false;
    return activeCell.row === row && activeCell.col === col;
  }

  const prepareSumFormula = () => {
    if (!selection) return;
    const { startRow, startCol, endRow, endCol } = selection;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const startCellId = `${colToLetter(minCol)}${minRow + 1}`;
    const endCellId = `${colToLetter(maxCol)}${maxRow + 1}`;
    const formula = `=SUM(${startCellId}:${endCellId})`;

    setFormulaBarValue(formula);
    setFormulaMode(true);
    setSelection(null);
  }
  
  const showSumButton = selection && (selection.startRow !== selection.endRow || selection.startCol !== selection.endCol);

  return (
    <div className="w-full h-full flex flex-col gap-4" onMouseUp={handleMouseUp}>
        <div className="flex gap-2">
            <Button onClick={addRow} variant="outline">
                <Plus className="mr-2 h-4 w-4"/> Add Row
            </Button>
            <Button onClick={addCol} variant="outline">
                <Plus className="mr-2 h-4 w-4"/> Add Column
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <Input 
                ref={formulaInputRef}
                value={formulaBarValue}
                onChange={handleFormulaBarChange}
                placeholder={formulaMode ? "Click a cell to place the formula" : (activeCell ? `${colToLetter(activeCell.col)}${activeCell.row + 1}` : 'Select a cell to edit')}
                className={cn(
                  "font-mono text-sm",
                  formulaMode && "bg-yellow-100 dark:bg-yellow-900/50 ring-2 ring-yellow-500"
                )}
                onFocus={() => {
                  if (activeCell) setActiveCell(activeCell) // Re-trigger focus
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeCell) {
                    handleCellChange(activeCell.row, activeCell.col, formulaBarValue);
                    setFormulaMode(false);
                    setActiveCell(null);
                  } else if (e.key === 'Escape') {
                    setFormulaMode(false);
                    setFormulaBarValue('');
                    formulaInputRef.current?.blur();
                  }
                }}
            />
        </div>

        <div className="flex-1 relative border rounded-lg overflow-hidden">
            <ScrollArea className="w-full h-full">
                <table className="border-collapse table-fixed w-full">
                    <thead className="sticky top-0 bg-muted z-10">
                        <tr>
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
                                <td className="sticky left-0 bg-muted w-14 border-r border-b p-1 text-center text-sm text-muted-foreground">{rowIndex + 1}</td>
                                {Array.from({ length: numCols }).map((_, colIndex) => (
                                    <td key={`${rowIndex}-${colIndex}`} className="p-0 border-none">
                                        {activeCell?.row === rowIndex && activeCell?.col === colIndex ? (
                                            <Input
                                                type="text"
                                                value={gridData[rowIndex][colIndex]}
                                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                onBlur={() => setActiveCell(null)}
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && setActiveCell(null)}
                                                className="w-full h-full p-1.5 text-sm bg-transparent border-2 border-primary rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                        ) : (
                                            <div
                                                className={cn("w-full h-full p-1.5 text-sm truncate cursor-cell border-t border-l",
                                                    isNaN(parseFloat(evaluateCell(rowIndex, colIndex))) ? 'text-left' : 'text-right',
                                                    isCellSelected(rowIndex, colIndex) ? 'bg-primary/20' : '',
                                                    isCellActiveForSelection(rowIndex, colIndex) ? 'ring-2 ring-primary' : '',
                                                    formulaMode ? 'cursor-crosshair' : ''
                                                )}
                                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                                                onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
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
         {showSumButton && !formulaMode && (
            <div className="flex justify-center">
                <Button onClick={prepareSumFormula} className="transition-all animate-in fade-in zoom-in-95">
                    <Sigma className="mr-2 h-4 w-4"/> Sum
                </Button>
            </div>
        )}
    </div>
  );
}

    