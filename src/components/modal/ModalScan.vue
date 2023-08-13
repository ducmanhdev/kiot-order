<template>
  <modal-scan
      ref="modalRef"
      title="Scan"
      :width="1000"
  >
    <div class="p-[60px]">
      <h3 class="text-center font-bold text-32px mb-4">List device in network</h3>
      <div class="text-center" v-if="isScanLoading">
        <loading/>
      </div>
      <ul v-else-if="listDevice?.length" class="mb-0 space-y-2">
        <li
            v-for="device in listDevice"
            :key="device.ip"
            @click="handleSelect(device.ip)"
            class="p-8 shadow rounded-[10px] border cursor-pointer hover:border-primary flex items-center justify-between gap-3"
        >
          <span class="text-24px font-medium">IP: {{ device?.ip }}</span>
          <span class="text-secondary">{{ device?.SN ? `(SN: ${device?.SN})` : '' }}</span>
        </li>
      </ul>
      <p v-else class="text-center font-semibold text-24px text-gray3">No devices detected!</p>
    </div>
  </modal-scan>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import Loading from '@/components/Loading.vue';
import ModalScan from "@/components/modal/ModalBase.vue";
import {gapMiniAppController} from '@/sdk';
import handleError from '@/utils/error';
import FormatHelper from "@/utils/formatHelper";

const emits = defineEmits<{
  (e: 'select', ip: string): void;
}>();
const listDevice = ref<any[]>([]);
const isScanLoading = ref(true);
const handleScan = async (port: number) => {
  try {
    listDevice.value = [];
    isScanLoading.value = true;
    gapMiniAppController.checkGapMiniAppSdkIsReady();
    const networkStatus: any = await gapMiniAppController.instance.getNetworkStatus();
    let wifiGateway = networkStatus?.wifiGateway?.split('.').slice(0, -1).join('.');
    if (!wifiGateway || wifiGateway === '0.0.0') {
      wifiGateway = null;
    }
    try {
      const networkDevice: any = await gapMiniAppController.instance.scanNetworkDevice({
        ip: wifiGateway,
        port: port,
      });
      listDevice.value = FormatHelper.tryParseJson(networkDevice)?.list || [];
    } catch (error) {
      console.log(error)
      listDevice.value = [];
    }

    // const PAX_PORT = 10009;
    // if (port === PAX_PORT) {
    //   const scanPromise = await Promise.allSettled(
    //       (FormatHelper.tryParseJson(networkDevice)?.list || []).map(async ({ip}: any) => {
    //         const pax = new Pax({
    //           ip: ip,
    //           port: port,
    //           miniApp: gapMiniAppController.instance,
    //           timeout: 10000,
    //         });
    //         const res = await pax.doInitialize();
    //         return {
    //           ip: ip,
    //           SN: res?.paxInfoResponse?.SN,
    //         };
    //       })
    //   );
    //   listDevice.value = scanPromise.filter((item: any) => item.status === 'fulfilled').map((item: any) => item.value);
    //   return;
    // }
  } catch (error) {
    handleError({error});
  } finally {
    isScanLoading.value = false;
  }
};
const handleSelect = (ip: string) => {
  emits('select', ip);
  hide();
};
const modalRef = ref<InstanceType<typeof ModalScan> | null>(null);
const show = (port: number) => {
  handleScan(port);
  modalRef.value?.show();
}
const hide = () => {
  modalRef.value?.hide();
}
defineExpose({
  show,
  hide,
});
</script>

<style lang="scss"></style>
