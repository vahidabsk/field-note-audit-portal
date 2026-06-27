import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";

export function AuditorGate({ name, onSave }: { name?: string; onSave: (name: string) => void }) {
  const [open, setOpen] = useState(!name);
  const [value, setValue] = useState(name ?? "");

  useEffect(() => {
    setOpen(!name);
    setValue(name ?? "");
  }, [name]);

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your name to continue.</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Auditor name" autoFocus />
        </DialogBody>
        <DialogFooter>
          <Button variant="accent" disabled={!value.trim()} onClick={() => { onSave(value.trim()); setOpen(false); }}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
