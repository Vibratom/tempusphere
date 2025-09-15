
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Plus, Trash2 as X } from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

const MIN_ROWS = 1;
const MIN_COLS = 1;

interface CellData {
  value: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const createEmptyCell = (): CellData => ({ value: '' });
const createEmptyRow = (cols: number): CellData[] => Array(cols).fill(null).map(createEmptyCell);

export function SpreadsheetView() {
  const [gridData, setGridData] = useLocalStorage<CellData[][]>('projects:spreadsheet-v3', 
    () => Array(10).fill(null).map(() => Array(8).fill(null).map(createEmptyCell))
  );

  const [history, setHistory] = useState<CellData[][][]>([gridData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isClient, setIsClient] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selection, setSelection] = useState<{ start: { row: number; col: number }; end: { row: number; col: number } } | null>(null);
  const [clipboard, setClipboard] = useState<{ data: CellData[][]; isCut: boolean } | null>(null);

  const cellRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateGridData = (newData: CellData[][], newHistoryEntry = true) => {
    setGridData(newData);
    if (newHistoryEntry) {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newData]);
      setHistoryIndex(newHistory.length);
    }
  };
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGridData(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGridData(history[newIndex]);
    }
  }, [history, historyIndex]);


  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGridData = gridData.map((row, rIdx) => 
      rIdx === rowIndex 
        ? row.map((cell, cIdx) => cIdx === colIndex ? { ...cell, value } : cell)
        : row
    );
    updateGridData(newGridData, false); // Update without creating history entry for every keystroke
  };

  const finishEditing = () => {
    if(isEditing) {
      setIsEditing(false);
      // Create a history entry when editing is finished
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, gridData]);
      setHistoryIndex(newHistory.length);
    }
  }

  const numRows = Array.isArray(gridData) ? gridData.length : 0;
  const numCols = Array.isArray(gridData) && gridData[0] ? gridData[0].length : 0;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeCell) return;

    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'c':
                handleCopy();
                break;
            case 'x':
                handleCut();
                break;
            case 'v':
                handlePaste();
                break;
            case 'z':
                e.preventDefault();
                handleUndo();
                break;
            case 'y':
                e.preventDefault();
                handleRedo();
                break;
            case 'b':
                e.preventDefault();
                toggleFormatting('bold');
                break;
            case 'i':
                e.preventDefault();
                toggleFormatting('italic');
                break;
            case 'u':
                e.preventDefault();
                toggleFormatting('underline');
                break;
            default:
                return;
        }
        return;
    }
    
    if (isEditing) return;

    let nextRow = activeCell.row;
    let nextCol = activeCell.col;

    switch (e.key) {
        case 'Enter':
            e.preventDefault();
            nextRow = e.shiftKey ? Math.max(0, activeCell.row - 1) : Math.min(numRows - 1, activeCell.row + 1);
            break;
        case 'Tab':
            e.preventDefault();
            if (e.shiftKey) {
                if (activeCell.col > 0) nextCol = activeCell.col - 1;
                else if (activeCell.row > 0) { nextRow = activeCell.row - 1; nextCol = numCols - 1; }
            } else {
                if (activeCell.col < numCols - 1) nextCol = activeCell.col + 1;
                else if (activeCell.row < numRows - 1) { nextRow = activeCell.row + 1; nextCol = 0; }
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            nextRow = Math.min(numRows - 1, activeCell.row + 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            nextRow = Math.max(0, activeCell.row - 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            nextCol = Math.max(0, activeCell.col - 1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextCol = Math.min(numCols - 1, activeCell.col + 1);
            break;
        default:
            if(e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
              setIsEditing(true);
            }
            return;
    }

    setActiveCell({ row: nextRow, col: nextCol });
    setSelection({ start: { row: nextRow, col: nextCol }, end: { row: nextRow, col: nextCol } });
    cellRefs.current[nextRow]?.[nextCol]?.focus();
  }, [activeCell, isEditing, numRows, numCols, handleUndo, handleRedo]);

  const addRow = () => {
    if (!Array.isArray(gridData)) {
      updateGridData([createEmptyRow(MIN_COLS)]);
      return;
    }
    const currentGrid = gridData.length > 0 ? gridData : [[]];
    const numCols = currentGrid[0]?.length || MIN_COLS;
    updateGridData([...currentGrid, createEmptyRow(numCols)]);
  };
  
  const addCol = () => {
    if (!Array.isArray(gridData)) {
        updateGridData([createEmptyRow(1).map(() => createEmptyCell())]);
        return;
    }
    const currentGrid = gridData.length > 0 ? gridData : [[]];
    updateGridData(currentGrid.map(row => [...(Array.isArray(row) ? row : []), createEmptyCell()]));
  };

  const removeRow = (rowIndex: number) => {
    if (!Array.isArray(gridData) || gridData.length <= MIN_ROWS) return;
    updateGridData(gridData.filter((_, rIdx) => rIdx !== rowIndex));
  }

  const removeCol = (colIndex: number) => {
    if (!Array.isArray(gridData) || !gridData[0] || gridData[0].length <= MIN_COLS) return;
    updateGridData(gridData.map(row => row.filter((_, cIdx) => cIdx !== colIndex)));
  }

  const getSelectionRange = () => {
    if (!selection) return null;
    const minRow = Math.min(selection.start.row, selection.end.row);
    const maxRow = Math.max(selection.start.row, selection.end.row);
    const minCol = Math.min(selection.start.col, selection.end.col);
    const maxCol = Math.max(selection.start.col, selection.end.col);
    return { minRow, maxRow, minCol, maxCol };
  }

  const toggleFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const range = getSelectionRange();
    if (!range) return;

    const { minRow, maxRow, minCol, maxCol } = range;
    
    // Determine the new format state based on the active cell
    const activeCellData = gridData[activeCell!.row][activeCell!.col];
    const newFormatState = !activeCellData[format];

    const newGridData = gridData.map((row, rIdx) => {
      if (rIdx >= minRow && rIdx <= maxRow) {
        return row.map((cell, cIdx) => {
          if (cIdx >= minCol && cIdx <= maxCol) {
            return { ...cell, [format]: newFormatState };
          }
          return cell;
        });
      }
      return row;
    });
    updateGridData(newGridData);
  }
  
  const handleCopy = () => {
    const range = getSelectionRange();
    if (!range) return;

    const { minRow, maxRow, minCol, maxCol } = range;
    const copiedData = gridData.slice(minRow, maxRow + 1).map(row => row.slice(minCol, maxCol + 1));
    setClipboard({ data: copiedData, isCut: false });
  };
  
  const handleCut = () => {
    const range = getSelectionRange();
    if (!range) return;

    const { minRow, maxRow, minCol, maxCol } = range;
    const copiedData = gridData.slice(minRow, maxRow + 1).map(row => row.slice(minCol, maxCol + 1));
    setClipboard({ data: copiedData, isCut: true });
    
    const newGridData = gridData.map((row, rIdx) => {
      if (rIdx >= minRow && rIdx <= maxRow) {
        return row.map((cell, cIdx) => {
          if (cIdx >= minCol && cIdx <= maxCol) {
            return createEmptyCell();
          }
          return cell;
        });
      }
      return row;
    });
    updateGridData(newGridData);
  };
  
  const handlePaste = () => {
    if (!clipboard || !activeCell) return;
    
    const { data: clipboardData, isCut } = clipboard;
    const { row: startRow, col: startCol } = activeCell;
    
    let newGridData = [...gridData.map(row => [...row])];
    
    clipboardData.forEach((clipboardRow, rOffset) => {
      clipboardRow.forEach((clipboardCell, cOffset) => {
        const targetRow = startRow + rOffset;
        const targetCol = startCol + cOffset;
        if (targetRow < numRows && targetCol < numCols) {
          newGridData[targetRow][targetCol] = clipboardCell;
        }
      });
    });
    
    updateGridData(newGridData);
    if(isCut) {
        setClipboard(null);
    }
  };

  useEffect(() => {
    cellRefs.current = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
  }, [numRows, numCols]);

  if (!isClient) {
    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex gap-2">
                <Skeleton className="h-10 w-32"/>
                <Skeleton className="h-10 w-36"/>
            </div>
            <div className="flex-1 relative border rounded-lg overflow-hidden p-2">
                <Skeleton className="h-full w-full"/>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4" ref={containerRef} onKeyDown={handleKeyDown} tabIndex={-1}>
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
                                {Array.from({ length: numCols }).map((_, colIndex) => {
                                  const cellData = gridData?.[rowIndex]?.[colIndex] || createEmptyCell();
                                  const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;
                                  const isSelected = selection && 
                                    rowIndex >= Math.min(selection.start.row, selection.end.row) &&
                                    rowIndex <= Math.max(selection.start.row, selection.end.row) &&
                                    colIndex >= Math.min(selection.start.col, selection.end.col) &&
                                    colIndex <= Math.max(selection.start.col, selection.end.col);

                                  return (
                                    <td key={`${rowIndex}-${colIndex}`} className={cn(
                                        "p-0 border relative",
                                        isSelected && "bg-primary/20",
                                    )}>
                                        <Input
                                            type="text"
                                            ref={el => {
                                              if (cellRefs.current[rowIndex]) {
                                                cellRefs.current[rowIndex][colIndex] = el;
                                              }
                                            }}
                                            value={cellData.value}
                                            onFocus={() => {
                                              if (!isEditing) {
                                                setActiveCell({ row: rowIndex, col: colIndex });
                                                setSelection({ start: { row: rowIndex, col: colIndex }, end: { row: rowIndex, col: colIndex } });
                                              }
                                            }}
                                            onDoubleClick={() => setIsEditing(true)}
                                            onBlur={finishEditing}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            readOnly={!isEditing && isActive}
                                            className={cn(
                                              "w-full h-full p-1.5 text-sm bg-transparent border-0 rounded-none shadow-none focus-visible:ring-0",
                                              isActive && "ring-2 ring-primary z-10",
                                              cellData.bold && "font-bold",
                                              cellData.italic && "italic",
                                              cellData.underline && "underline"
                                            )}
                                        />
                                    </td>
                                  )
                                })}
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
