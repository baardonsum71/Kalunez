import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check } from 'lucide-react';

export default function MobileSelect({ value, onValueChange, options, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`select-none bg-secondary border-border text-foreground text-sm ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-secondary border-border">
          {options.map(o => <SelectItem key={o} value={o} className="text-foreground">{o}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`select-none flex items-center justify-between bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg ${className}`}
      >
        <span>{value}</span>
        <span className="text-muted-foreground ml-2">▾</span>
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-card border-border">
          <DrawerHeader>
            <DrawerTitle className="text-white text-base">Select Option</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-1">
            {options.map(o => (
              <button
                key={o}
                onClick={() => { onValueChange(o); setOpen(false); }}
                className={`select-none w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                  value === o ? 'bg-purple-600/30 text-purple-300' : 'text-foreground hover:bg-white/5'
                }`}
              >
                {o}
                {value === o && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}