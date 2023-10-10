import {defineStore} from 'pinia';
import type { GetPosKeyStorageResponse } from "gap-nodejs-sdk";
import {sdk} from "@/sdk";

export const useKeyStorageStore = defineStore('keyStorage', {
    state: () => ({
        keyStorage: {} as GetPosKeyStorageResponse,
    }),
    actions: {
        getKeyStorage(): Promise<GetPosKeyStorageResponse> {
            return new Promise<GetPosKeyStorageResponse>(async (resolve, reject) => {
                try {
                    const response: GetPosKeyStorageResponse = await sdk.key_storage.getPosKeyStorage();
                    this.keyStorage = response;
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            })
        },
    }
})