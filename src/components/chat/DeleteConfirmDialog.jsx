import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmDialog({ isOpen, title, onConfirm, onCancel, language = 'en' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">
              {language === 'hi' ? 'बातचीत मिटाएं?' : 'Delete Conversation?'}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              "{title}"
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {language === 'hi'
            ? 'यह बातचीत इस डिवाइस से हमेशा के लिए हटा दी जाएगी। क्या आप सुनिश्चित हैं?'
            : 'This conversation session will be permanently removed from this device. Are you sure?'}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-8 text-xs font-semibold"
          >
            {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            className="h-8 text-xs font-bold gap-1.5 shadow-sm"
          >
            <Trash2 size={13} />
            {language === 'hi' ? 'मिटाएं (Delete)' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
