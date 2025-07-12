import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus, Trash2, ChevronUp, ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import type { StatusConfig, AppSettings } from "../services/save";
import type { Todo } from "../interfaces/todo.interface";
import { useStatusDeletion } from "../hooks/useStatusDeletion";
import StatusDeletionConfirmDialog from "./StatusDeletionConfirmDialog";
import UpgradeDialog from "./UpgradeDialog";
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isPremiumFeaturesEnabled } from '../utils/env';
import { useComponentAnalytics, useAnalytics } from '@/hooks/useAnalytics';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    setSettings: (settings: AppSettings) => Promise<void>;
    todos: Todo[];
    onTodosUpdate: (todos: Todo[]) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, setSettings, todos, onTodosUpdate }: SettingsPanelProps) {
    useComponentAnalytics('SettingsPanel', { isOpen, statusCount: settings.statuses.length });
    const analytics = useAnalytics();
    const { t } = useTranslation();
    const [editingStatus, setEditingStatus] = useState<string | null>(null);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const { pendingDeletion, checkStatusDeletion, confirmDeletion, cancelDeletion } = useStatusDeletion(todos, onTodosUpdate);
    const premiumEnabled = isPremiumFeaturesEnabled();
    
    // Wrapper function that updates settings
    const updateSettingsAndRefresh = async (newSettings: AppSettings) => {
        await setSettings(newSettings);
        analytics.trackUsageAction('settings_updated', {
            statusCount: newSettings.statuses.length
        });
    };

    const updateStatus = async (id: string, updates: Partial<StatusConfig>) => {
        const newStatuses = settings.statuses.map(status => 
            status.id === id ? { ...status, ...updates } : status
        );
        await updateSettingsAndRefresh({ statuses: newStatuses });
        analytics.trackUsageAction('status_updated', {
            statusId: id,
            updatedFields: Object.keys(updates)
        });
    };

    const addStatus = async () => {
        // Check if we're at the limit
        if (settings.statuses.length >= 5) {
            if (premiumEnabled) {
                setShowUpgradeDialog(true);
            } else {
                toast.error("Maximum 5 status columns allowed.");
            }
            return;
        }

        const newId = `status_${Date.now()}`;
        const newStatus: StatusConfig = {
            id: newId,
            label: t('todo.newStatus'),
            color: "#e5e7eb"
        };
        try {
            await updateSettingsAndRefresh({ statuses: [...settings.statuses, newStatus] });
            setEditingStatus(newId);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleUpgrade = async (priceId: string) => {
        // This would handle the upgrade process in premium mode
        console.warn('Upgrade requested for price:', priceId);
        setShowUpgradeDialog(false);
    };

    const deleteStatus = async (id: string) => {
        if (settings.statuses.length <= 1) return; // Prevent deleting all statuses
        
        const statusToDelete = settings.statuses.find(status => status.id === id);
        if (!statusToDelete) return;

        const canDelete = checkStatusDeletion(id, statusToDelete.label);
        if (canDelete) {
            // Safe to delete immediately - no todos affected
            try {
                await updateSettingsAndRefresh({ statuses: settings.statuses.filter(status => status.id !== id) });
            } catch {
                // Error handling is already done in updateSettingsAndRefresh
            }
        }
        // If canDelete is false, the confirmation dialog will be shown
    };

    const moveStatus = async (id: string, direction: 'up' | 'down') => {
        const currentIndex = settings.statuses.findIndex(status => status.id === id);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= settings.statuses.length) return;
        
        const newStatuses = [...settings.statuses];
        [newStatuses[currentIndex], newStatuses[newIndex]] = [newStatuses[newIndex], newStatuses[currentIndex]];
        try {
            await updateSettingsAndRefresh({ statuses: newStatuses });
        } catch {
            // Error handling is already done in updateSettingsAndRefresh
        }
    };

    const handleConfirmDeletion = async (action: 'delete' | 'reassign') => {
        if (!pendingDeletion) return;

        // Get the first status from the remaining statuses (excluding the one being deleted)
        const remainingStatuses = settings.statuses.filter(status => status.id !== pendingDeletion.statusId);
        const firstStatusId = remainingStatuses[0]?.id;
        
        confirmDeletion(action, firstStatusId);
        
        // Remove the status from settings after handling todos
        try {
            await updateSettingsAndRefresh({ 
                statuses: remainingStatuses
            });
        } catch {
            // Error handling is already done in updateSettingsAndRefresh
        }
    };

    return (
        <>
            <StatusDeletionConfirmDialog
                isOpen={!!pendingDeletion}
                statusLabel={pendingDeletion?.statusLabel || ''}
                affectedTodosCount={pendingDeletion?.affectedTodos.length || 0}
                onConfirm={handleConfirmDeletion}
                onCancel={cancelDeletion}
            />
            {premiumEnabled && (
                <UpgradeDialog
                    isOpen={showUpgradeDialog}
                    onClose={() => setShowUpgradeDialog(false)}
                    onUpgrade={handleUpgrade}
                    currentLimit={5}
                    currentUsage={settings.statuses.length}
                />
            )}
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('dialogs.settings')}</DialogTitle>
                    <DialogDescription>
                        {t('dialogs.settingsDesc')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4 max-h-96 overflow-y-auto">
                    {premiumEnabled && (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Premium Features Enabled</h3>
                            <p className="text-sm text-yellow-700">You have access to all premium features including unlimited status columns.</p>
                        </div>
                    )}
                    
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{t('messages.statusColumns')}</h3>
                                {premiumEnabled && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        <Star className="h-3 w-3 mr-1" />
                                        Premium
                                    </Badge>
                                )}
                            </div>
                            <Button 
                                onClick={addStatus} 
                                size="sm" 
                                variant="outline"
                                disabled={settings.statuses.length >= 5}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                {t('messages.addStatus')}
                            </Button>
                        </div>

                        {/* Status count display */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                    Status Columns
                                </span>
                                <span className="text-sm text-gray-600">
                                    {settings.statuses.length} / 5
                                </span>
                            </div>
                            {settings.statuses.length >= 5 && (
                                <p className="text-xs text-amber-600 mt-2">
                                    {premiumEnabled 
                                        ? "Limit reached. Upgrade for unlimited columns." 
                                        : "Maximum 5 status columns allowed."
                                    }
                                </p>
                            )}
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
        </>
    );
}