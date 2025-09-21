
'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Settings, DollarSign, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Deal {
  id: string;
  title: string;
  value: number;
}

interface Stage {
  id: string;
  title: string;
  deals: Deal[];
}

const initialStages: Stage[] = [
    { id: 'awareness', title: 'Awareness', deals: [] },
    { id: 'interest', title: 'Interest', deals: [] },
    { id: 'consideration', title: 'Consideration', deals: [] },
    { id: 'purchase', title: 'Purchase', deals: [] },
];

export function SalesFunnel() {
    const [stages, setStages] = useLocalStorage<Stage[]>('sales-funnel:stages-v2', initialStages);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const onDragEnd: OnDragEndResponder = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;
        
        if (type === 'STAGE') {
            const newStages = Array.from(stages);
            const [reorderedItem] = newStages.splice(source.index, 1);
            newStages.splice(destination.index, 0, reorderedItem);
            setStages(newStages);
        } else { // DEAL
            const sourceStage = stages.find(s => s.id === source.droppableId);
            const destStage = stages.find(s => s.id === destination.droppableId);
            if (!sourceStage || !destStage) return;

            if (source.droppableId === destination.droppableId) {
                const newDeals = Array.from(sourceStage.deals);
                const [reorderedItem] = newDeals.splice(source.index, 1);
                newDeals.splice(destination.index, 0, reorderedItem);
                const newStages = stages.map(s => s.id === sourceStage.id ? { ...s, deals: newDeals } : s);
                setStages(newStages);
            } else {
                const sourceDeals = Array.from(sourceStage.deals);
                const [movedItem] = sourceDeals.splice(source.index, 1);
                const destDeals = Array.from(destStage.deals);
                destDeals.splice(destination.index, 0, movedItem);
                
                const newStages = stages.map(s => {
                    if (s.id === sourceStage.id) return { ...s, deals: sourceDeals };
                    if (s.id === destStage.id) return { ...s, deals: destDeals };
                    return s;
                });
                setStages(newStages);
            }
        }
    };
    
    const addStage = () => {
        const newStage: Stage = {
            id: uuidv4(),
            title: 'New Stage',
            deals: [],
        };
        setStages(prev => [...prev, newStage]);
    };
    
    const updateStageTitle = (stageId: string, newTitle: string) => {
        setStages(prev => prev.map(s => s.id === stageId ? { ...s, title: newTitle } : s));
    };
    
    const removeStage = (stageId: string) => {
        setStages(prev => prev.filter(s => s.id !== stageId));
    };

    const addDeal = (stageId: string) => {
        const newDeal: Deal = {
            id: uuidv4(),
            title: 'New Deal',
            value: 1000,
        };
        setStages(prev => prev.map(s => s.id === stageId ? { ...s, deals: [...s.deals, newDeal] } : s));
    };

    const updateDeal = (stageId: string, dealId: string, updatedFields: Partial<Deal>) => {
        setStages(prev => prev.map(s => {
            if (s.id === stageId) {
                return { ...s, deals: s.deals.map(d => d.id === dealId ? { ...d, ...updatedFields } : d) };
            }
            return s;
        }));
    };

    const removeDeal = (stageId: string, dealId: string) => {
         setStages(prev => prev.map(s => {
            if (s.id === stageId) {
                return { ...s, deals: s.deals.filter(d => d.id !== dealId) };
            }
            return s;
        }));
    };
    
    const stageTotals = React.useMemo(() => {
        return stages.map(stage => {
            const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);
            return {
                id: stage.id,
                dealCount: stage.deals.length,
                totalValue
            };
        });
    }, [stages]);
    
    if (!isClient) return null;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Sales Funnel</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                    Visualize your sales pipeline and track deals from awareness to purchase.
                </p>
            </div>
            
            <div className="text-center">
                <Button variant="outline" onClick={addStage}><Plus className="mr-2 h-4 w-4"/> Add Stage</Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex flex-col items-center gap-2">
                    <Droppable droppableId="all-stages" direction="vertical" type="STAGE">
                        {(provided) => (
                             <div {...provided.droppableProps} ref={provided.innerRef} className="w-full max-w-4xl mx-auto space-y-2">
                                {stages.map((stage, index) => {
                                    const totals = stageTotals[index];
                                    return (
                                        <Draggable key={stage.id} draggableId={stage.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-2">
                                                <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground"><GripVertical className="h-5 w-5" /></div>
                                                <Card className="w-full">
                                                    <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/30">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Input value={stage.title} onChange={e => updateStageTitle(stage.id, e.target.value)} className="text-lg font-semibold border-none bg-transparent focus-visible:ring-0 p-0 h-auto"/>
                                                            <Badge variant="secondary">{totals.dealCount} deals</Badge>
                                                            <Badge variant="outline">${totals.totalValue.toLocaleString()}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addDeal(stage.id)}><Plus className="h-4 w-4"/></Button>
                                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStage(stage.id)}><Trash2 className="h-4 w-4"/></Button>
                                                        </div>
                                                    </CardHeader>
                                                    <Droppable droppableId={stage.id} type="DEAL">
                                                        {(provided, snapshot) => (
                                                            <CardContent ref={provided.innerRef} {...provided.droppableProps} className={cn("p-3 space-y-2 min-h-[50px]", snapshot.isDraggingOver && "bg-primary/10")}>
                                                                {stage.deals.map((deal, index) => (
                                                                    <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                            <Card className="bg-background">
                                                                                <CardContent className="p-2 flex items-center justify-between gap-2">
                                                                                     <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/>
                                                                                     <Input value={deal.title} onChange={e => updateDeal(stage.id, deal.id, { title: e.target.value })} className="border-none focus-visible:ring-0" />
                                                                                     <div className="flex items-center gap-1">
                                                                                        <DollarSign className="h-4 w-4 text-muted-foreground"/>
                                                                                        <Input type="number" value={deal.value} onChange={e => updateDeal(stage.id, deal.id, { value: parseInt(e.target.value) || 0 })} className="w-24 border-none focus-visible:ring-0" />
                                                                                     </div>
                                                                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeDeal(stage.id, deal.id)}><Trash2 className="h-4 w-4"/></Button>
                                                                                </CardContent>
                                                                            </Card>
                                                                        </div>
                                                                    )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </CardContent>
                                                        )}
                                                    </Droppable>
                                                </Card>
                                            </div>
                                        )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    {stages.length > 1 && <ChevronDown className="text-muted-foreground h-8 w-8"/>}
                </div>
            </DragDropContext>
        </div>
    );
}
