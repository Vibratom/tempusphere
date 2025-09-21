
'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTime } from '@/hooks/use-time';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

// --- Types ---
type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers: string;
  isDone: boolean;
}

interface Order {
  id: string;
  table: string;
  pax: number;
  type: 'Dine In' | 'Take Away';
  orderNumber: string;
  timestamp: string;
  status: OrderStatus;
  items: OrderItem[];
}

const createNewItem = (): OrderItem => ({ id: uuidv4(), name: '', quantity: 1, modifiers: '', isDone: false });
const createNewOrder = (): Order => ({
  id: uuidv4(),
  table: `A${Math.floor(Math.random() * 20) + 1}`,
  pax: 2,
  type: 'Dine In',
  orderNumber: `00000${Math.floor(Math.random() * 900) + 100}`.slice(-6),
  timestamp: new Date().toISOString(),
  status: 'new',
  items: [createNewItem()],
});


// --- Status Colors ---
const statusColors: Record<OrderStatus, { bg: string, text: string }> = {
  new: { bg: 'bg-red-500', text: 'text-white' },
  preparing: { bg: 'bg-yellow-400', text: 'text-black' },
  ready: { bg: 'bg-green-500', text: 'text-white' },
  completed: { bg: 'bg-gray-500', text: 'text-white' },
};


// --- Edit Order Dialog ---
const EditOrderDialog = ({ order, onSave, onCancel }: { order: Order, onSave: (updatedOrder: Order) => void, onCancel: () => void }) => {
    const [localOrder, setLocalOrder] = useState(order);

    const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
        setLocalOrder(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        }));
    };
    
    const addItem = () => setLocalOrder(prev => ({ ...prev, items: [...prev.items, createNewItem()] }));
    const removeItem = (itemId: string) => setLocalOrder(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Edit Order #{localOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Table</Label><Input value={localOrder.table} onChange={e => setLocalOrder({...localOrder, table: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Pax</Label><Input type="number" value={localOrder.pax} onChange={e => setLocalOrder({...localOrder, pax: parseInt(e.target.value) || 1})} /></div>
                    <div className="space-y-2"><Label>Type</Label><Select value={localOrder.type} onValueChange={(v) => setLocalOrder({...localOrder, type: v as any})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Dine In">Dine In</SelectItem><SelectItem value="Take Away">Take Away</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-3 pt-4">
                    <Label>Items</Label>
                    {localOrder.items.map(item => (
                        <Card key={item.id} className="p-3 bg-muted/50">
                            <div className="grid grid-cols-12 gap-2 items-start">
                                <Input placeholder="Item Name" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="col-span-5" />
                                <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)} className="col-span-2" />
                                <Textarea placeholder="Modifiers..." value={item.modifiers} onChange={e => handleItemChange(item.id, 'modifiers', e.target.value)} className="col-span-4" rows={1}/>
                                <Button size="icon" variant="ghost" className="col-span-1" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" onClick={addItem}><Plus className="mr-2 h-4 w-4"/>Add Item</Button>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <DialogClose asChild><Button onClick={() => onSave(localOrder)}>Save Order</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
};

// --- Order Card Component ---
const OrderCard = ({ order, onUpdate, onDelete, onEdit }: { order: Order; onUpdate: (updatedOrder: Order) => void; onDelete: () => void; onEdit: () => void; }) => {
    const { toast } = useToast();
    const isCompleted = order.items.every(item => item.isDone);

    const toggleItemDone = (itemId: string) => {
        const newItems = order.items.map(item => item.id === itemId ? { ...item, isDone: !item.isDone } : item);
        onUpdate({ ...order, items: newItems });
    };

    const checkAll = () => {
        const allDone = order.items.every(i => i.isDone);
        const newItems = order.items.map(item => ({ ...item, isDone: !allDone }));
        onUpdate({ ...order, items: newItems, status: !allDone ? 'completed' : 'new' });
    };
    
    const setStatus = (status: OrderStatus) => {
        onUpdate({ ...order, status });
        if (status === 'completed') {
            toast({ title: `Order #${order.orderNumber} Completed`, description: `Table ${order.table} has been marked as complete.`});
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className={cn("p-2 text-xs", statusColors[order.status].bg, statusColors[order.status].text)}>
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-bold">TABLE: {order.table} ({order.type})</span>
                        <span className="ml-4">PAX: {order.pax}</span>
                    </div>
                    <div>
                        <span>{format(new Date(order.timestamp), 'yyyy-MM-dd HH:mm')}</span>
                        <span className="font-bold ml-4">Order no. {order.orderNumber}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <table className="w-full">
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id} className={cn("border-b", item.isDone && "bg-muted/50 text-muted-foreground line-through")}>
                                <td className="p-2 align-top">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs whitespace-pre-wrap">{item.modifiers}</p>
                                </td>
                                <td className="p-2 align-top text-center font-mono">{item.quantity}x</td>
                                <td className="p-2 align-top w-20">
                                    <Button size="sm" className="w-full" onClick={() => toggleItemDone(item.id)}>Done</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
            <CardFooter className="p-1 bg-muted flex gap-1">
                <Select value={order.status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                    <SelectTrigger className="w-32 h-9 capitalize"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="h-9 flex-1" variant={isCompleted ? 'destructive' : 'default'} onClick={checkAll}>{isCompleted ? 'Uncheck All' : 'Check All'}</Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onEdit}><Edit className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button>
            </CardFooter>
        </Card>
    );
};

// --- KDS Main Page Component ---
export default function KdsPage() {
    const [orders, setOrders] = useLocalStorage<Order[]>('kds:orders-v1', []);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const time = useTime();

    const addOrder = () => {
        setOrders(prev => [createNewOrder(), ...prev]);
    };

    const updateOrder = (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const deleteOrder = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };
    
    const handleSaveEdit = (updatedOrder: Order) => {
        updateOrder(updatedOrder);
        setEditingOrder(null);
    }
    
    const activeOrders = orders.filter(o => o.status !== 'completed');

    return (
        <div className="w-full h-full flex p-4 gap-4 bg-secondary">
            {/* Order Grid */}
            <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
                    {activeOrders.map(order => (
                        <OrderCard key={order.id} order={order} onUpdate={updateOrder} onDelete={() => deleteOrder(order.id)} onEdit={() => setEditingOrder(order)} />
                    ))}
                </div>
                 {activeOrders.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                        <p>No active orders.</p>
                    </div>
                )}
            </ScrollArea>
            
            {/* Sidebar */}
            <aside className="w-48 flex-shrink-0 flex flex-col gap-4">
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold font-mono">{format(time, 'HH:mm:ss')}</p>
                    <p className="text-sm text-muted-foreground">{format(time, 'yyyy-MM-dd')}</p>
                </Card>
                <Button size="lg" onClick={addOrder}>
                    <Plus className="mr-2"/> New Order
                </Button>
                <Card className="flex-1">
                    <CardHeader className="p-2"><CardTitle className="text-sm text-center">Controls</CardTitle></CardHeader>
                    <CardContent className="p-2">
                        {/* Future controls can go here */}
                    </CardContent>
                </Card>
            </aside>
            
            {editingOrder && (
                <Dialog open={true} onOpenChange={(open) => !open && setEditingOrder(null)}>
                    <EditOrderDialog order={editingOrder} onSave={handleSaveEdit} onCancel={() => setEditingOrder(null)} />
                </Dialog>
            )}
        </div>
    );
}
