
import { toast } from 'sonner';

export function useToast() {
  return {
    toast,
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast(msg),
  };
}