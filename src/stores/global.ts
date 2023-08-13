import {defineStore} from 'pinia';
import ModalConfirm from "@/components/modal/ModalConfirm.vue";
export const useGlobalStore = defineStore('globalStore', {
    state: () => ({
       modalConfirmRef: null as InstanceType<typeof ModalConfirm> | null,
    }),
    actions: {
        confirm(message: string) {
            return this.modalConfirmRef?.show(message);
        }
    }
});