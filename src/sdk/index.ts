import {GapMiniAppSdk, type PrintInput} from "gap-miniapp-sdk";
import FormatHelper from "@/utils/formatHelper";
import {useConnectStore, DEVICE_TYPES} from "@/stores/connect";
import {type PrinterNetworkDevice} from "@/stores/connect";
import Gap, {GapApiVersion} from "gap-nodejs-sdk";
import {setAxiosInstance} from "@/plugins/axios";

const baseSdk = new Gap.BaseApi(GapApiVersion.V1);

let posSdk: any = null;
let settingsSdk: any = null;
let goCheckInSdk: any = null;
let appointmentSdk: any = null;
let userSdk: any = null;
let settingSdk: any = null;
let sdk: any = null;

type GetAccessTokenResponse = Partial<{
    token: string;
    gClientId: string;
    domain: string;
}>

class GapMiniAppController {
    instance = new GapMiniAppSdk();

    constructor() {
        this.init();
    }

    detectPlatform() {
        const platform = this.instance.detectPlatform();
        this.instance.setPlatformExecutor(platform);
    }

    getAccessToken() {
        return new Promise<GetAccessTokenResponse>(async resolve => {
            try {
                const res = await this.instance.getAccessToken();
                const {token, gClientId, domain} = FormatHelper.tryParseJson(res);
                if (!token || !gClientId || !domain) {
                    throw new Error(`GapMiniApp: Can't get access token`)
                }
                localStorage.setItem('accessToken', token);
                localStorage.setItem('id', gClientId);
                localStorage.setItem('domain', domain);
                resolve({
                    token,
                    gClientId,
                    domain,
                });
            } catch (error: any) {
                resolve({
                    token: undefined,
                    gClientId: undefined,
                    domain: undefined,
                });
            }
        })
    }

    closeApp() {
        if (!this.instance) return;
        if (!this.instance.getBridge()) return;
        this.instance.closeApp()
    }

    checkGapMiniAppSdkIsReady() {
        const isGapMiniAppSdkReady = typeof this.instance !== 'undefined' && typeof this.instance.getBridge() !== 'undefined';
        if (!isGapMiniAppSdkReady) {
            throw new Error(`GapMiniAppSdk is not ready!`);
        }
        return true;
    }

    init() {
        try {
            this.detectPlatform();
        } catch (error) {
            console.error(error)
        }
    }
}

const gapMiniAppController = new GapMiniAppController();

const sdkInit = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          token = localStorage.getItem('accessToken'),
          gClientId = localStorage.getItem('id'),
          domain = localStorage.getItem('domain'),
        } = await gapMiniAppController.getAccessToken();
        if (!domain || !gClientId || !token) {
          throw new Error('Missing params');
        }
        setAxiosInstance({
            baseURL: domain,
            gClientId,
            token,
        })
        posSdk = new Gap.PosClientApi(domain, gClientId, token, GapApiVersion.V1);
        settingsSdk = new Gap.SettingsApi(domain, gClientId, token, GapApiVersion.V1);
        goCheckInSdk = new Gap.GoCheckInApi(domain, gClientId, token, GapApiVersion.V1);
        appointmentSdk = new Gap.AppointmentApi(domain, gClientId, token, GapApiVersion.V1);
        userSdk = new Gap.UserApi(domain, gClientId, token, GapApiVersion.V1);
        settingSdk = new Gap.SettingsApi(domain, gClientId, token, GapApiVersion.V1);
        sdk = new Gap.PosClientApi(domain, gClientId, token, GapApiVersion.V1);
        resolve(true);
      } catch (error: any) {
        reject(new Error(`SDK init failed: ${error.message}`));
      }
    });
};

export const print = async (data: any) => {
    const connectStore = useConnectStore();
    return new Promise(async (resolve, reject) => {
        try {
            const input: PrintInput = {
                type: connectStore.printerConfig?.type as any,
                ip: (connectStore.printerConfig as PrinterNetworkDevice).ip,
                port: 9100,
                data: data.toString(),
            };
            if (connectStore.printerConfig?.type === DEVICE_TYPES.USB) {
                input.deviceName = connectStore.printerConfig.deviceName;
                input.productId = connectStore.printerConfig.productId;
                input.vendorId = connectStore.printerConfig.vendorId;
            }
            if (connectStore.printerConfig?.type === DEVICE_TYPES.BLUETOOTH) {
                input.address = connectStore.printerConfig.address;
            }

            if ((connectStore.printerConfig?.type === DEVICE_TYPES.NETWORK && (connectStore.printerConfig as PrinterNetworkDevice).ip === '') || !connectStore.isPrinterDeviceConnected) {
                throw new Error('No print device connected')
            }
            gapMiniAppController.checkGapMiniAppSdkIsReady();
            await gapMiniAppController.instance.printEscPos(input);
            resolve(true);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
};

export {
    baseSdk,
    posSdk,
    settingsSdk,
    goCheckInSdk,
    appointmentSdk,
    userSdk,
    settingSdk,
    sdkInit,
    sdk,
    gapMiniAppController,
};
