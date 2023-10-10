import {defineStore} from 'pinia';
import {goCheckInSdk} from '@/sdk';
import type {
    GetBusinessSiteInfoRequest,
    GetBusinessSiteInfoResponse,
    UpdateBusinessSiteInfoRequest,
    GetBusinessWorkHourRequest,
    GetBusinessWorkHourResponse, UploadRequest, UploadResponse,
} from "gap-nodejs-sdk";

export const useBusinessStore = defineStore('businessStore', {
    state: () => ({
        businessSiteInfo: null as GetBusinessSiteInfoResponse | null,
        businessWorkHour: null as GetBusinessWorkHourResponse | null,
    }),
    actions: {
        getBusinessSiteInfo(params?: GetBusinessSiteInfoRequest): Promise<GetBusinessSiteInfoResponse> {
            return new Promise(async (resolve, reject) => {
                try {
                    this.businessSiteInfo = await goCheckInSdk.business.getBusinessSiteInfo(params);
                    resolve(this.businessSiteInfo!);
                } catch (error) {
                    reject(error);
                }
            });
        },
        updateBusinessSiteInfo(data?: UpdateBusinessSiteInfoRequest): Promise<null> {
            return new Promise(async (resolve, reject) => {
                try {
                    await goCheckInSdk.business.updateBusinessSiteInfo(data);
                    resolve(null);
                } catch (error) {
                    reject(error);
                }
            });
        },
        getBusinessWorkHour(params?: GetBusinessWorkHourRequest): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    this.businessWorkHour = await goCheckInSdk.settings.getBusinessWorkHour(params)
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        upload(params: UploadRequest): Promise<UploadResponse> {
            return new Promise(async (resolve, reject) => {
                try {
                    const res = await goCheckInSdk.business.upload(params);
                    resolve(res);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
});
