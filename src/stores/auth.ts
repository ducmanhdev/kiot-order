import {defineStore} from 'pinia'
import {baseSdk, gapMiniAppController, userSdk} from '@/sdk';
import type {
  GetDnsInfoRequest,
  GetDnsInfoResponse,
  GetUserInfoRequest,
  LoginRequest,
  LoginResponse
} from 'gap-nodejs-sdk';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    userInfo: null as LoginResponse['user_info'] | null,
    reloadSdkCount: 0,
  }),
  getters: {
    isLoggedIn: state => state.userInfo,
  },
  actions: {
    login(data?: LoginRequest & { remember_me?: boolean }) {
      return new Promise<void>(async (resolve, reject) => {
        try {
          const response: LoginResponse = await baseSdk.auth.login(data);
          this.userInfo = response.user_info;
          this.accessToken = response.access_token;
          localStorage.setItem("accessToken", response.access_token!);
          this.reloadSdkCount++;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    logout() {
      this.userInfo = null;
      this.accessToken = null;
      ['accessToken', 'id', 'domain'].forEach((key: string) => localStorage.removeItem(key));
      // (this as any).router?.push({name: 'login'});
      gapMiniAppController.closeApp();
    },
    getUserInfo(data?: GetUserInfoRequest) {
      return new Promise(async (resolve, reject) => {
        try {
          this.userInfo = await userSdk.auth.getUserInfo(data);
          resolve(true);
        } catch (error: any) {
          if (error?.response?.code === 401) {
            await this.logout();
          }
          reject(error);
        }
      });
    },
    getDnsInfo(data?: GetDnsInfoRequest & { remember_me?: boolean }) {
      return new Promise<GetDnsInfoResponse>(async (resolve, reject) => {
        try {
          const response: GetDnsInfoResponse = await baseSdk.auth.getDnsInfo(data);
          localStorage.setItem("domain", response.domain!);
          localStorage.setItem("id", response.client_id!);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    },
  },
})
