import {computed, ref} from 'vue';
import {defineStore} from 'pinia';
import {gapMiniAppController} from '@/sdk';
import FormatHelper from "@/utils/formatHelper";
import Pax from 'pax-ts';

export type DeviceNetwork = {
    ip: string;
    port: number;
};
export type Device = {
    name: string;
    serialNumber?: string;
    ip: string;
    port: number;
    isConnected: boolean;
};
export type SaveConfigRequest = {
    key: string;
    value: DeviceNetwork | null,
}
export const useConnectStore = defineStore('connectStore', () => {
    // UTILS
    const saveConfig = async ({key, value}: SaveConfigRequest) => {
        try {
            gapMiniAppController.checkGapMiniAppSdkIsReady();
            await gapMiniAppController.instance.setStorageItem({key, value});
        } catch (error) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
    const deleteConfig = (key: string) => {
        return saveConfig({
            key: key,
            value: null
        });
    }
    const getConfig = (key: string) => {
        return new Promise<DeviceNetwork | null>(async (resolve) => {
            try {
                const paxConfigStorageItem = FormatHelper.tryParseJson(
                    await gapMiniAppController.instance.getStorageItem({key})
                );
                const localStoragePaxConfig = FormatHelper.tryParseJson(localStorage.getItem(key));
                const config = {
                    ip: paxConfigStorageItem?.value?.ip || localStoragePaxConfig?.ip || '',
                    port: paxConfigStorageItem?.value?.port || localStoragePaxConfig?.port || '',
                }
                if (!config.ip || !config.port) {
                    resolve(null);
                }
                resolve(config);
            } catch (error) {
                resolve(null);
            }
        })
    }
    const pingNetworkDevice = (config: DeviceNetwork) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await gapMiniAppController.instance.pingNetworkDevice(config);
                const pingNetworkStatus = FormatHelper.tryParseJson(res);
                if (!pingNetworkStatus || !pingNetworkStatus?.data) {
                    throw new Error(`Can't ping network`)
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    const validateNetworkDevice = (config: DeviceNetwork) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!config.ip || !config.port) {
                    throw new Error('Config is invalid!')
                }
                await pingNetworkDevice(config);
                resolve(true);
            } catch (error) {
                reject(error)
            }
        })
    }

    // PAX
    const PAX_CONFIG_KEY = 'PAX_CONFIG';
    const pax = ref<Pax | null>();
    const paxConfig = ref<DeviceNetwork | null>(null);
    const isPaxConnected = computed(() => paxConfig.value?.ip && paxConfig.value?.port);
    const setPaxConfig = async (config: DeviceNetwork) => {
        paxConfig.value = {...config};
        await saveConfig({
            key: PAX_CONFIG_KEY,
            value: paxConfig.value,
        })
    };
    const clearPaxConfig = () => {
        paxConfig.value = null;
        deleteConfig(PAX_CONFIG_KEY);
    }
    const connectPax = (config: DeviceNetwork) => {
        return new Promise(async (resolve, reject) => {
            try {
                await validateNetworkDevice(config);
                await setPaxConfig(config);
                pax.value = new Pax({
                    ...config,
                    miniApp: gapMiniAppController.instance,
                    timeout: 10000,
                });
                resolve(true);
            } catch (error) {
                clearPaxConfig();
                reject(error);
            }
        });
    };
    const initPax = async () => {
        try {
            const config = await getConfig(PAX_CONFIG_KEY);
            config && await connectPax(config);
        } catch (error) { /* empty */ }
    };

    // PRINTER_CONFIG_KEY.
    const PRINTER_CONFIG_KEY = 'PRINTER_CONFIG';
    const printerConfig = ref<DeviceNetwork | null>(null);
    const isPrintDeviceConnected = computed(() => printerConfig.value?.ip && printerConfig.value?.port);
    const setPrinterConfig = async (config: DeviceNetwork) => {
        printerConfig.value = {...config};
        await saveConfig({
            key: PRINTER_CONFIG_KEY,
            value: printerConfig.value,
        })
    };
    const clearPrinterConfig = () => {
        printerConfig.value = null;
        deleteConfig(PRINTER_CONFIG_KEY);
    }
    const connectPrinter = (config: DeviceNetwork) => {
        return new Promise(async (resolve, reject) => {
            try {
                await pingNetworkDevice(config);
                await setPrinterConfig(config);
                pax.value = new Pax({
                    ...config,
                    miniApp: gapMiniAppController.instance,
                    timeout: 10000,
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        })
    };
    const initPrinter = async () => {
        try {
            const config = await getConfig(PRINTER_CONFIG_KEY);
            config && await connectPrinter(config);
        } catch (error) { /* empty */ }
    };
    const init = () => {
        return new Promise(async (resolve, reject) => {
            try {
                gapMiniAppController.checkGapMiniAppSdkIsReady();
                await Promise.allSettled([initPax(), initPrinter()]);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    };

    return {
        pax,
        paxConfig,
        isPaxConnected,
        connectPax,
        clearPaxConfig,
        isPrintDeviceConnected,
        connectPrinter,
        init,
        printerConfig,
        clearPrinterConfig,
    };
});