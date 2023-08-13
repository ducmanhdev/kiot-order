import {GapMiniAppSdk} from "gap-miniapp-sdk";
import FormatHelper from "@/utils/formatHelper";
import {useConnectStore} from "@/stores/connect";

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

    checkGapMiniAppSdkIsReady(){
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

export const gapMiniAppController = new GapMiniAppController();

export const print = async (data: any) => {
    const connectStore = useConnectStore();
    return new Promise(async (resolve, reject) => {
        try {
            const input = {
                ip: connectStore.printerConfig?.ip!,
                port: connectStore.printerConfig?.port!,
                data: data.toString(),
            };
            gapMiniAppController.checkGapMiniAppSdkIsReady();
            await gapMiniAppController.instance.printEscPos(input);
            resolve(true);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
};
