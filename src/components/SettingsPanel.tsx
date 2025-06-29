import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { StatusConfig, AppSettings } from "../services/save";

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, setSettings }: SettingsPanelProps) {
    const [editingStatus, setEditingStatus] = useState<string | null>(null);
    
    const updateStatus = (id: string, updates: Partial<StatusConfig>) => {
        const newStatuses = settings.statuses.map(status => 
            status.id === id ? { ...status, ...updates } : status
        );
        setSettings({ statuses: newStatuses });
    };

    const addStatus = () => {
        const newId = `status_${Date.now()}`;
        const newStatus: StatusConfig = {
            id: newId,
            label: "New Status",
            color: "#e5e7eb"
        };
        setSettings({ statuses: [...settings.statuses, newStatus] });
        setEditingStatus(newId);
    };

    const deleteStatus = (id: string) => {
        if (settings.statuses.length <= 1) return; // Prevent deleting all statuses
        setSettings({ statuses: settings.statuses.filter(status => status.id !== id) });
    };

    const moveStatus = (id: string, direction: 'up' | 'down') => {
        const currentIndex = settings.statuses.findIndex(status => status.id === id);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= settings.statuses.length) return;
        
        const newStatuses = [...settings.statuses];
        [newStatuses[currentIndex], newStatuses[newIndex]] = [newStatuses[newIndex], newStatuses[currentIndex]];
        setSettings({ statuses: newStatuses });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure your todo application preferences.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4 max-h-96 overflow-y-auto">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Status Columns</h3>
                            <Button onClick={addStatus} size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Status
                            </Button>
                        </div>
                        
                        <div className="grid gap-3">
                            {settings.statuses.map((status, index) => (
                                <div key={status.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    {/* Move buttons */}
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            onClick={() => moveStatus(status.id, 'up')}
                                            disabled={index === 0}
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            onClick={() => moveStatus(status.id, 'down')}
                                            disabled={index === settings.statuses.length - 1}
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Status label */}
                                    <div className="flex-1">
                                        {editingStatus === status.id ? (
                                            <Input
                                                value={status.label}
                                                onChange={(e) => updateStatus(status.id, { label: e.target.value })}
                                                onBlur={() => setEditingStatus(null)}
                                                onKeyDown={(e) => e.key === 'Enter' && setEditingStatus(null)}
                                                autoFocus
                                                className="h-8"
                                            />
                                        ) : (
                                            <div
                                                className="cursor-pointer p-1 rounded hover:bg-gray-100"
                                                onClick={() => setEditingStatus(status.id)}
                                            >
                                                {status.label}
                                            </div>
                                        )}
                                    </div>

                                    {/* Color picker */}
                                    <input
                                        type="color"
                                        value={status.color}
                                        onChange={(e) => updateStatus(status.id, { color: e.target.value })}
                                        className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                                    />

                                    {/* Delete button */}
                                    <Button
                                        onClick={() => deleteStatus(status.id)}
                                        disabled={settings.statuses.length <= 1}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}