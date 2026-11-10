"use client";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <DialogContent>
      <DialogHeader>{children}</DialogHeader>
    </DialogContent>
  );
};

export default Modal;
