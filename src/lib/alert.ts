import { toast } from '@zerodevx/svelte-toast';

export class Alert {
    public static success(msg: string) {
        toast.push(msg, {
            theme: {
                '--toastBackground': '#16a34a',
                '--toastBarBackground': '#166534'
            }
        })
    }

    public static warning(msg: string) {
        toast.push(msg, {
            theme: {
                '--toastBackground': '#ea580c',
                '--toastBarBackground': '#9a3412'
            }
        })
    }

    public static error(msg: string) {
        toast.push(msg, {
            theme: {
                '--toastBackground': '#dc2626',
                '--toastBarBackground': '#991b1b'
            }
        })
    }
}