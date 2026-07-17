import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
}

export default function Toast({ message, show }: ToastProps) {
  return (
    <div className={`toast-box ${show ? 'show' : ''}`} id="toastBox">
      <CheckCircle2 style={{ width: '16px', height: '16px' }} />
      <span id="toastText">{message}</span>
    </div>
  );
}
