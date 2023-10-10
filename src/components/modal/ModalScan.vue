<template>
  <modal-base
      ref="modalRef"
      title="Scan"
      :width="1154"
      :closable="!isTestPrintLoading"
  >
    <div class="p-[60px]">
      <h3 class="text-center font-semibold text-[45px] mb-4">{{ title }}</h3>
      <div class="my-8 overflow-y-auto max-h-[40vh]">
        <div class="text-center" v-if="isScanLoading">
          <loading/>
        </div>
        <ul v-else-if="listDevice?.length" class="space-y-2">
          <li
              v-for="(device, index) in listDevice"
              :key="index"
              @click="handleSelect(device)"
              class="px-10 py-7 cursor-pointer rounded-[10px] flex items-center justify-between gap-3 group"
              :class="{
                'bg-secondary text-white active': JSON.stringify(selectedDevice) === JSON.stringify(device)
              }"
          >
            <p class="font-semibold text-3xl">
              <span class="block capitalize">{{ itemTitle }}</span>
              <span class="block text-gray3 group-[.active]:text-inherit">
                {{ (device as PrinterBluetoothDevice)?.deviceName || (device as PaxDevice | PrinterNetworkDevice)?.ip }}
              </span>
            </p>
            <span
                class="text-24px text-secondary group-[.active]:text-inherit"
                v-if="scanType === DEVICE_TYPES.PAX"
            >
              ({{ (device as PaxDevice)?.SN ? `Serial number: ${(device as PaxDevice)?.SN}` : 'N/A' }})
            </span>
            <button
                type="button"
                class="btn btn-secondary bg-white text-secondary w-[200px]"
                v-if="scanType === DEVICE_TYPES.NETWORK || scanType === DEVICE_TYPES.USB || scanType === DEVICE_TYPES.BLUETOOTH"
                @click.stop="handleTestPrint(device as PrinterDevice)"
                :disabled="isTestPrintLoading"
            >
            <span
                class="loading loading-spinner"
                v-if="currentTestPrintLoadingId === (device as PrinterBluetoothDevice)?.deviceName || currentTestPrintLoadingId === (device as PaxDevice | PrinterNetworkDevice)?.ip"
            ></span>
              Test
            </button>
          </li>
        </ul>
        <div v-else class="h-12"></div>
      </div>
      <div class="grid grid-cols-2 gap-6">
        <button
            type="button"
            class="btn btn-secondary btn-outline"
            :disabled="isScanLoading || isTestPrintLoading"
            @click="handleScan"
        >
          SCAN
        </button>
        <button
            type="button"
            class="btn btn-success disabled:btn-gray"
            :disabled="!selectedDevice || isConnectLoading || isTestPrintLoading"
            @click="handleConnect"
        >
          <span class="loading loading-spinner" v-if="isConnectLoading"></span>
          CONNECT
        </button>
      </div>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import Loading from '@/components/Loading.vue';
import ModalBase from "@/components/modal/ModalBase.vue";
import {gapMiniAppController} from '@/sdk';
import handleError from '@/utils/error';
import FormatHelper from "@/utils/formatHelper";
import Pax from "pax-ts";
import EscPosEncoder from "@manhnd/esc-pos-encoder";
import type {PrintInput} from "gap-miniapp-sdk";
import {Platform} from "gap-miniapp-sdk";
import notification from "@/utils/notification";
import type {
  Device,
  DeviceTypes,
  PaxDevice,
  PrinterBluetoothDevice,
  PrinterDevice,
  PrinterNetworkDevice
} from "@/stores/connect";
import {DEVICE_TYPES, useConnectStore} from "@/stores/connect";

const connectStore = useConnectStore();

const port = ref<number | null>(null);

const listDevice = ref<Device[]>([]);
const isScanLoading = ref(false);

const handleScanUSB = async () => {
  const networkDevice: any = await gapMiniAppController.instance.scanUsbDevice();
  listDevice.value = networkDevice?.list || [];
}

const handleScanBluetooth = async () => {
  const networkDevice: any = await gapMiniAppController.instance.scanBluetoothDevice();
  listDevice.value = networkDevice?.list || [];
}

const isGetPaxSNLoading = ref(false);
const handleGetPaxSN = async () => {
  try {
    isGetPaxSNLoading.value = true;
    for (const device of listDevice.value) {
      const pax = new Pax({
        ip: (device as PrinterNetworkDevice).ip,
        port: port.value!,
        miniApp: gapMiniAppController.instance,
        timeout: 10000,
      });
      const res = await pax.doInitialize();
      (device as PaxDevice).SN = res?.paxInfoResponse?.SN
    }
  } finally {
    isGetPaxSNLoading.value = false;
  }
}
const handleScanNetwork = async () => {
  gapMiniAppController.checkGapMiniAppSdkIsReady();
  const networkStatus = await gapMiniAppController.instance.getNetworkStatus();
  let wifiGateway = FormatHelper.tryParseJson(networkStatus)?.wifiGateway?.split('.').slice(0, -1).join('.');
  if (!wifiGateway || wifiGateway === '0.0.0') {
    wifiGateway = null;
  }

  const platform = gapMiniAppController.instance.detectPlatform();
  const networkDevice = await gapMiniAppController.instance.scanNetworkDevice({
    ip: platform === Platform.WINDOW ? '' : wifiGateway,
    port: port.value!,
  });

  listDevice.value = (FormatHelper.tryParseJson(networkDevice)?.list || []).map((item: any) => ({
    ...item,
    port: port.value
  }));
  if (scanType.value !== DEVICE_TYPES.PAX) return;
  handleGetPaxSN()
}

const handleScan = async () => {
  try {
    listDevice.value = [];
    isScanLoading.value = true;
    if (scanType.value === DEVICE_TYPES.USB) {
      await handleScanUSB();
      return;
    }
    if (scanType.value === DEVICE_TYPES.BLUETOOTH) {
      await handleScanBluetooth();
      return;
    }
    await handleScanNetwork();
  } catch (error) {
    handleError({error});
  } finally {
    isScanLoading.value = false;
    listDevice.value[0] && handleSelect(listDevice.value[0]);
  }
};

const selectedDevice = ref<Device | null>(null);
const handleSelect = (device: Device) => {
  selectedDevice.value = device;
};

const isConnectLoading = ref(false);

const handleConnect = async () => {
  try {
    if (!selectedDevice.value) {
      throw new Error('No device selected');
    }
    isConnectLoading.value = true;
    switch (scanType.value) {
      case DEVICE_TYPES.PAX: {
        await connectStore.connectPax(selectedDevice.value as PaxDevice)
        break;
      }
      case DEVICE_TYPES.NETWORK:
      case DEVICE_TYPES.USB:
      case DEVICE_TYPES.BLUETOOTH: {
        await connectStore.connectPrinter({
          ...selectedDevice.value,
          type: scanType.value,
        } as PrinterDevice)
        break;
      }
    }
    notification.success({
      message: 'Connect success'
    });
    hide();
  } catch (error) {
    handleError({error});
  } finally {
    isConnectLoading.value = false;
  }
};

const isTestPrintLoading = ref(false);
const currentTestPrintLoadingId = ref<string | null>(null);
const handleTestPrint = async (device: PrinterDevice) => {
  try {
    if (scanType.value === DEVICE_TYPES.PAX) return;
    const _device = device as any;
    isTestPrintLoading.value = true;
    currentTestPrintLoadingId.value = _device?.deviceName || _device?.ip;
    const encoder = new EscPosEncoder();
    const data = encoder
        .initialize()
        .line(`Test device ${_device?.deviceName || _device?.ip}.`)
        .cut()
        .encode();
    const input: PrintInput = {
      type: scanType.value!,
      ip: _device.ip || '',
      port: _device.port || 9100,
      data: data.toString(),
    };
    if (scanType.value === DEVICE_TYPES.USB) {
      input.deviceName = _device.deviceName;
      input.productId = _device.productId;
      input.vendorId = _device.vendorId;
    }
    if (scanType.value === DEVICE_TYPES.BLUETOOTH) {
      input.deviceName = _device.deviceName;
      input.address = _device.address;
    }
    gapMiniAppController.checkGapMiniAppSdkIsReady();
    await gapMiniAppController.instance.printEscPos(input);
  } catch (error) {
    handleError({error});
  } finally {
    isTestPrintLoading.value = false;
    currentTestPrintLoadingId.value = null;
  }
};

const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);

const scanType = ref<DeviceTypes | null>(null);

const LIST_TITLE = {
  [DEVICE_TYPES.PAX]: 'Select network pax',
  [DEVICE_TYPES.NETWORK]: 'Select network printer',
  [DEVICE_TYPES.USB]: 'Select USB printer',
  [DEVICE_TYPES.BLUETOOTH]: 'Select Bluetooth printer',
}
const title = computed(() => scanType.value ? LIST_TITLE[scanType.value] : '');

const LIST_ITEM_TITLE = {
  [DEVICE_TYPES.PAX]: 'Network pax',
  [DEVICE_TYPES.NETWORK]: 'Network printer',
  [DEVICE_TYPES.USB]: 'USB printer',
  [DEVICE_TYPES.BLUETOOTH]: 'Bluetooth printer',
}
const itemTitle = computed(() => scanType.value ? LIST_ITEM_TITLE[scanType.value] : '');
const show = (_port: number, _scanType: DeviceTypes) => {
  port.value = _port;
  scanType.value = _scanType;
  listDevice.value = [];
  selectedDevice.value = null;
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
