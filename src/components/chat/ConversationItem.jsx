import React, { useState, useRef, useEffect } from 'react';
import { getConversationCategoryIcon } from '../../services/conversationService';
import { MessageSquare, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ConversationItem({
  conv,
  isActive,
  onSelect,
  onRename,
  onDeleteRequest,
  language = 'en'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(conv.title || '');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setTitleText(conv.title || '');
  }, [conv.title]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleSaveRename = () => {
    if (titleText.trim() && titleText.trim() !== conv.title) {
      onRename(conv.id, titleText.trim());
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const iconHint = getConversationCategoryIcon(conv.title);
  const msgCount = conv.messages?.length || 0;

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 p-1.5 rounded-xl border border-primary/50 bg-primary/5">
        <input
          type="text"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
          autoFocus
          className="flex-1 bg-transparent px-2 py-1 text-xs font-semibold text-foreground focus:outline-none"
        />
        <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={handleSaveRename}>
          <Check size={13} />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => setIsEditing(false)}>
          <X size={13} />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border text-xs',
        isActive
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
          : 'text-muted-foreground hover:bg-muted/60 border-transparent hover:border-border/40'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2 flex-1">
        <span className="text-sm shrink-0">{iconHint}</span>
        <span className="truncate font-medium text-foreground">{conv.title}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
        {msgCount > 0 && (
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-[9px] h-4 px-1.5 font-bold">
            {msgCount}
          </Badge>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(p => !p);
          }}
          title="Conversation options"
        >
          <MoreVertical size={13} />
        </Button>

        {showMenu && (
          <div className="absolute right-0 top-7 z-30 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
            <button
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2 font-medium text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
              }}
            >
              <Edit2 size={12} className="text-blue-500" />
              {language === 'hi' ? 'नाम बदलें' : 'Rename'}
            </button>
            <button
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 flex items-center gap-2 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDeleteRequest(conv);
              }}
            >
              <Trash2 size={12} />
              {language === 'hi' ? 'मिटाएं' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
