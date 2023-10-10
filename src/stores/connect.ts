import {ref} from 'vue';
import {defineStore} from 'pinia';
import {gapMiniAppController} from '@/sdk';
import FormatHelper from "@/utils/formatHelper";
import { Gap } from "gap-nodejs-sdk";
import { PaxPaymentClient } from "gap-payment-pax-provider";
import { GapPaymentClientDriver } from "gap-nodejs-sdk/dist/payment/type";

export const DEFAULT_PAX_PORT = 10009;
export const DEFAULT_PRINTER_NETWORK_PORT = 9100;

export const DEVICE_TYPES = {
    PAX: 'pax',
    NETWORK: 'network',
    USB: 'usb',
    BLUETOOTH: 'bluetooth',
} as const;
export type DeviceTypes = typeof DEVICE_TYPES[keyof typeof DEVICE_TYPES];

export type PaxDevice = {
    ip: string;
    port: number;
    SN?: string;
};
export type PrinterNetworkDevice = {
    type: 'network';
    ip: string;
    port: number;
};
export type PrinterUSBDevice = {
    type: 'usb';
    deviceName: string;
    productId: string;
    vendorId: string;
};
export type PrinterBluetoothDevice = {
    type: 'bluetooth';
    deviceName: string;
    address: string;
};
export type PrinterDevice = PrinterNetworkDevice | PrinterUSBDevice | PrinterBluetoothDevice;
export type Device = PaxDevice | PrinterDevice;
export type SaveConfigRequest = {
    key: string;
    value: Device | null,
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
        return new Promise<Device | null>(async (resolve) => {
            try {
                const configStorageItem = FormatHelper.tryParseJson(
                    await gapMiniAppController.instance.getStorageItem({key})
                );
                const localStorageConfig = FormatHelper.tryParseJson(localStorage.getItem(key));
                resolve(configStorageItem?.value || localStorageConfig);
            } catch (error) {
                resolve(null);
            }
        })
    }
    const pingNetworkDevice = (config: Device) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await gapMiniAppController.instance.pingNetworkDevice(config as PaxDevice | PrinterNetworkDevice);
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
    const validateNetworkDevice = (config: PaxDevice) => {
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
    const paxConfig = ref<PaxDevice | null>(null);
    const isPaxConnected = ref(false);
    const setPaxConfig = async (config: PaxDevice) => {
        paxConfig.value = {...config};
        isPaxConnected.value = true;
        await saveConfig({
            key: PAX_CONFIG_KEY,
            value: paxConfig.value,
        })
    };
    const clearPaxConfig = () => {
        paxConfig.value = null;
        isPaxConnected.value = false;
        Gap.Payment = null;
        deleteConfig(PAX_CONFIG_KEY);
    };
    const connectPax = (config: PaxDevice) => {
        return new Promise(async (resolve, reject) => {
            try {
                await validateNetworkDevice(config);
                await setPaxConfig(config);
                if(!Gap.Payment || !(Gap.Payment instanceof PaxPaymentClient)) {
                    Gap.Payment = new PaxPaymentClient();
                }
                Gap.Payment!.paymentClientConfiguration = {
                    driver: GapPaymentClientDriver.PAX,
                    configuration: { ip: config.ip, port: config.port }
                }
                if(gapMiniAppController.checkGapMiniAppSdkIsReady()) {
                    Gap.Payment!.initializePaymentClient?.(gapMiniAppController.instance);
                }
                resolve(true);
            } catch (error) {
                clearPaxConfig();
                reject(error);
            }
        });
    };
    const initPax = async () => {
        try {
            const config = await getConfig(PAX_CONFIG_KEY) as PaxDevice;
            if (!config) return;
            await connectPax(config);
        } catch (error) { /* empty */
        }
    };

    // PRINTER_CONFIG_KEY
    const PRINTER_CONFIG_KEY = 'PRINTER_CONFIG';
    const printerConfig = ref<PrinterDevice | null>(null);
    const isPrinterDeviceConnected = ref(false);
    const setPrinterConfig = async (config: PrinterDevice) => {
        printerConfig.value = {...config};
        isPrinterDeviceConnected.value = true;
        await saveConfig({
            key: PRINTER_CONFIG_KEY,
            value: printerConfig.value,
        });
    };
    const clearPrinterConfig = () => {
        printerConfig.value = null;
        isPrinterDeviceConnected.value = false;
        deleteConfig(PRINTER_CONFIG_KEY);
    };
    const connectPrinter = (config: PrinterDevice) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (config.type === 'network') {
                    await pingNetworkDevice(config);
                }
                await setPrinterConfig(config);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        })
    };
    const initPrinter = async () => {
        try {
            const config = await getConfig(PRINTER_CONFIG_KEY) as PrinterDevice;
            if (!config) return;
            await connectPrinter(config);
        } catch (error) {
            /* empty */
        }
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
        paxConfig,
        isPaxConnected,
        connectPax,
        clearPaxConfig,
        isPrinterDeviceConnected,
        connectPrinter,
        init,
        printerConfig,
        clearPrinterConfig,
    };
});