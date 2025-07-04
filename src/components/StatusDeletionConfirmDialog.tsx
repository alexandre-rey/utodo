import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface StatusDeletionConfirmDialogProps {
  isOpen: boolean;
  statusLabel: string;
  affectedTodosCount: number;
  onConfirm: (action: 'delete' | 'reassign') => void;
  onCancel: () => void;
}

export default function StatusDeletionConfirmDialog({
  isOpen,
  statusLabel,
  affectedTodosCount,
  onConfirm,
  onCancel
}: StatusDeletionConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <div>
              <DialogTitle>Delete Status Column</DialogTitle>
              <DialogDescription>
                What should happen to the todos in this status?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>{affectedTodosCount}</strong> todo{affectedTodosCount !== 1 ? 's' : ''} {affectedTodosCount !== 1 ? 'are' : 'is'} currently in the 
              <strong> "{statusLabel}"</strong> status.
            </p>
          </div>
          
          <div className="grid gap-3">
            <Button
              onClick={() => onConfirm('reassign')}
              variant="default"
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Move todos to first status</div>
                <div className="text-sm text-gray-500 mt-1">
                  All todos will be moved to your first status column
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => onConfirm('delete')}
              variant="destructive"
              className="justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Delete todos permanently</div>
                <div className="text-sm text-red-100 mt-1">
                  All todos in this status will be permanently deleted
                </div>
              </div>
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}