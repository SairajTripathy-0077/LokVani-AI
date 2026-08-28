import React, { useState } from 'react';
import { groupConversationsByDate } from '../../services/conversationService';
import ConversationItem from './ConversationItem';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { MessageSquarePlus, MessageSquare, Gauge, Type, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ConversationSidebar({
  conversations = [],
  activeConvId,
  onSelectConversation,
  onCreateConversation,
  onRenameConversation,
  onDeleteConversation,
  onClearAllConversations,
  language = 'en',
  dialect,
  setDialect,
  dialectMap = {},
  ttsRate,
  setTtsRate,
  largeText,
  setLargeText,
  isProcessing = false,
  onStopSpeaking
}) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const grouped = groupConversationsByDate(conversations, language);

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (onStopSpeaking) onStopSpeaking();
      onDeleteConversation(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
      {/* + New Chat Session Button */}
      <Button
        className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 h-10 rounded-xl"
        disabled={isProcessing}
        onClick={() => {
          if (onStopSpeaking) onStopSpeaking();
          onCreateConversation();
        }}
      >
        <MessageSquarePlus size={17} />
        {language === 'hi' ? '+ नई बातचीत (New Chat)' : '+ New Conversation'}
      </Button>

      {/* Dialect Selection */}
      <Card className="p-0 overflow-hidden border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="px-3.5 pt-3 pb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🌐</span> {language === 'hi' ? 'भाषा / बोली (Dialect)' : 'Dialect / Accent'}
          </p>
        </div>
        <div className="px-3 pb-3">
          <Select value={dialect} onValueChange={setDialect}>
            <SelectTrigger className="h-9 text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dialectMap).map(([code, info]) => (
                <SelectItem key={code} value={code} className="text-xs">{info.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Speech Speed */}
      <Card className="p-0 overflow-hidden border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        <div className="px-3.5 py-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Gauge size={11} /> {language === 'hi' ? 'बोलने की गति' : 'Speech Speed'}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {[0.75, 1.0, 1.25].map(r => (
              <Button
                key={r}
                size="sm"
                variant={ttsRate === r ? 'default' : 'outline'}
                onClick={() => setTtsRate(r)}
                className="h-7 text-xs font-bold"
              >
                {r}×
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Large Text Toggle */}
      <Button
        variant={largeText ? 'secondary' : 'outline'}
        className="w-full gap-2 text-xs font-semibold justify-start h-9 rounded-xl border-zinc-200/80"
        onClick={() => setLargeText(p => !p)}
      >
        <Type size={14} />
        {largeText
          ? (language === 'hi' ? 'सामान्य आकार' : 'Normal Size')
          : (language === 'hi' ? 'बड़ा टेक्स्ट A+' : 'Large Text A+')}
      </Button>

      <Separator className="my-1" />

      {/* Persistent Grouped Conversations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={11} />
            {language === 'hi' ? 'आपकी बातचीत (Chat Sessions)' : 'Conversations'}
          </p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
            {conversations.length}
          </span>
        </div>

        <ScrollArea className="max-h-72 lg:max-h-[calc(100vh-580px)]">
          <div className="flex flex-col gap-3 pr-2">
            {grouped.map(group => (
              <div key={group.key} className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      onSelect={() => {
                        if (onStopSpeaking) onStopSpeaking();
                        onSelectConversation(conv.id);
                      }}
                      onRename={onRenameConversation}
                      onDeleteRequest={(target) => setDeleteTarget(target)}
                      language={language}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {conversations.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 justify-center gap-1.5 h-7 rounded-xl"
            onClick={() => {
              if (window.confirm(language === 'hi' ? 'क्या आप सभी बातचीत मिटाना चाहते हैं?' : 'Clear all conversation history?')) {
                if (onStopSpeaking) onStopSpeaking();
                onClearAllConversations();
              }
            }}
          >
            <RotateCcw size={11} />
            {language === 'hi' ? 'सभी बातचीत मिटाएं' : 'Clear All Conversations'}
          </Button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        language={language}
      />
    </aside>
  );
}
