const METHODS_NAME = ['success', 'info', 'error', 'warning'] as const;

type NotificationType = typeof METHODS_NAME[number];

type CreateElRequest = {
    type: NotificationType;
    message: string;
    duration?: number;
}

type MethodParams = Pick<CreateElRequest, 'message' | 'duration'> | string;

type TNotification = {
    [key in NotificationType]: (params: MethodParams) => void;
}

class Notification {
    private readonly icons = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    };

    private createParentEl() {
        const existToastEl = document?.body?.querySelector('.notification-toast');
        if (existToastEl) {
            return existToastEl;
        }
        const toastEl = document?.createElement('div');
        toastEl.classList.add('notification-toast', 'toast', 'toast-top', 'toast-end');
        toastEl.style.zIndex = '99999';
        document.body.appendChild(toastEl);
        return toastEl;
    }

    private createEl({type, message, duration = 5000}: CreateElRequest) {
        const parentEl = this.createParentEl();
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="alert alert-${type} text-20px !text-white">
               ${this.icons[type]}
              <span>${message}</span>
            </div>
        `.trim();
        const toastEl = template.content.firstChild!;
        parentEl.appendChild(toastEl);
        setTimeout(() => {
            toastEl.remove();
            if (parentEl.childNodes.length === 0) {
                parentEl.remove();
            }
        }, duration);
    }

    constructor() {
        const methods = METHODS_NAME.map((method) => ({
            [method]: (params: MethodParams) => {
                if (typeof params === 'string') {
                    this.createEl({
                        type: method,
                        message: params
                    })
                    return;
                }
                this.createEl({
                    type: method,
                    ...params
                })
            }
        }));
        Object.assign(this, ...methods);
    }
}

const notification = new Notification() as unknown as TNotification;

export default notification;
