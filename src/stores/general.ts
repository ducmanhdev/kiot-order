import {defineStore} from 'pinia';
import type {ConfirmPayload} from "@/types";

export const useGeneralStore = defineStore('generalStore', {
  state: () => ({
    isShowAside: true,
    devicePlatform: "",
    isNumPad: false,
  }),
  actions: {
    confirm(payload: ConfirmPayload) {},
  }
});
