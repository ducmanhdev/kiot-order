<template>
  <modal-base
      ref="modalRef"
      title="Connect with"
      :width="1154"
      :closable="!isConnectLoading"
  >
    <div class="p-[60px]">
      <div class="btn-group w-full mb-10">
        <button
            class="btn btn-gray no-animation flex-1"
            :class="{
              'btn-active': tab === tabActive,
            }"
            v-for="tab in LIST_TAB"
            @click.prevent="handleChangeTab(tab)"
        >
          {{ tab }}
        </button>
      </div>
      <form class="space-y-8">
        <template v-if="tabActive === LIST_TAB.PAX">
          <div class="form-control">
            <label class="label">
              <span class="label-text">IP</span>
            </label>
            <div
                class="input-connect"
                :class="{
                  'input-connect--connected': isCurrentTabConnected
                }"
            >
              <input
                  type="text"
                  class="input input-bordered w-full pr-[160px]"
                  v-model="paxConfig.ip"
              />
            </div>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">PORT</span>
            </label>
            <input
                type="text"
                class="input input-bordered w-full"
                v-model="paxConfig.port"
            />
          </div>
        </template>
        <template v-if="tabActive === LIST_TAB.PRINT">
          <div class="form-control">
            <div class="flex justify-between gap-4 mx-auto w-[740px] max-w-full">
              <label class="flex items-center cursor-pointer gap-3" v-for="item in LIST_SCAN_TYPES" :key="item.value">
                <input
                    type="radio"
                    class="radio radio-primary"
                    :value="item.value"
                    v-model="printTypeSelected"
                    name="print-type"
                />
                <span class="font-semibold text-20px">{{ item.label }}</span>
              </label>
            </div>
          </div>
          <div class="form-control" v-if="printTypeSelected === DEVICE_TYPES.NETWORK">
            <label class="label">
              <span class="label-text">IP</span>
            </label>
            <div
                class="input-connect"
                :class="{
                'input-connect--connected': isCurrentTabConnected
              }"
            >
              <input
                  type="text"
                  class="input input-bordered w-full pr-[160px]"
                  v-model="printerNetworkConfig.ip"
              />
            </div>
          </div>
          <div class="form-control" v-if="printTypeSelected === DEVICE_TYPES.USB">
            <label class="label">
              <span class="label-text">Printer model</span>
            </label>
            <div
                class="input-connect"
                :class="{
                'input-connect--connected': isCurrentTabConnected
              }"
            >
              <input
                  type="text"
                  class="input input-bordered w-full pr-[160px]"
                  :value="(printerUsbConfig as unknown as PrinterUSBDevice)?.deviceName"
                  placeholder="Unknown"
                  readonly
              />
            </div>
          </div>
          <div class="form-control" v-if="printTypeSelected === DEVICE_TYPES.BLUETOOTH">
            <label class="label">
              <span class="label-text">Printer model</span>
            </label>
            <div
                class="input-connect"
                :class="{
                'input-connect--connected': isCurrentTabConnected
              }"
            >
              <input
                  type="text"
                  class="input input-bordered w-full pr-[160px]"
                  :value="printerBluetoothConfig?.deviceName"
                  placeholder="Unknown"
                  readonly
              />
            </div>
          </div>
        </template>
        <div class="form-control grid grid-cols-2 gap-6">
          <button
              type="button"
              class="btn btn-secondary btn-outline"
              @click="handleScan"
          >
            SCAN
          </button>
          <button
              v-if="isCurrentTabConnected"
              type="button"
              class="btn btn-secondary btn-outline"
              @click="handleDisconnect"
          >
            DISCONNECT
          </button>
          <button
              v-else
              type="button"
              class="btn btn-secondary btn-outline"
              @click="handleConnect"
              :disabled="isConnectLoading || !isValidConnect"
          >
            <span class="loading loading-spinner" v-if="isConnectLoading"></span>
            CONNECT
          </button>
        </div>
      </form>
    </div>
  </modal-base>
  <modal-scan ref="modalScanRef"/>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watchEffect} from 'vue';
import type {PaxDevice, PrinterNetworkDevice, PrinterUSBDevice} from "@/stores/connect";
import {DEFAULT_PAX_PORT, DEFAULT_PRINTER_NETWORK_PORT, DEVICE_TYPES, useConnectStore} from "@/stores/connect";
import handleError from '@/utils/error';
import ModalBase from "@/components/modal/ModalBase.vue";
import ModalScan from '@/components/modal/ModalScan.vue';
import notification from "@/utils/notification";

const connectStore = useConnectStore();

const LIST_TAB = {
  PAX: 'Pax',
  PRINT: 'Print',
} as const;
type TabActive = (typeof LIST_TAB)[keyof typeof LIST_TAB];
const tabActive = ref<TabActive>(LIST_TAB.PAX);
const handleChangeTab = (tab: TabActive) => {
  tabActive.value = tab;
  if (tab === LIST_TAB.PRINT) {
    printTypeSelected.value = DEVICE_TYPES.NETWORK;
  }
}

const paxStoreConfig = computed(() => connectStore.paxConfig);
const isPaxConnected = computed(() => connectStore.isPaxConnected);

const printerStoreConfig = computed(() => connectStore.printerConfig);
const isPrinterDeviceConnected = computed(() => connectStore.isPrinterDeviceConnected);

const paxConfig = ref<PaxDevice>({
  ip: connectStore.paxConfig?.ip || '',
  port: connectStore.paxConfig?.port || DEFAULT_PAX_PORT
});
const printerNetworkConfig = ref<PrinterNetworkDevice>({
  type: DEVICE_TYPES.NETWORK,
  ip: (connectStore.printerConfig as PrinterNetworkDevice)?.ip || '',
  port: (connectStore.printerConfig as PrinterNetworkDevice)?.port || DEFAULT_PRINTER_NETWORK_PORT,
});

const unsubscribe = connectStore.$onAction(
    ({
       name,
       after,
     }) => {
      switch (name) {
        case 'connectPax': {
          after(() => {
            paxConfig.value.ip = connectStore.paxConfig?.ip || '';
            paxConfig.value.port = connectStore.paxConfig?.port || DEFAULT_PAX_PORT;
          })
          break;
        }
        case 'connectPrinter': {
          after(() => {
            printerNetworkConfig.value.ip = (connectStore.printerConfig as PrinterNetworkDevice)?.ip || '';
            printerNetworkConfig.value.port = (connectStore.printerConfig as PrinterNetworkDevice)?.port || DEFAULT_PRINTER_NETWORK_PORT;
          })
          break;
        }
      }
    });

onBeforeUnmount(() => {
  unsubscribe();
})

const printerUsbConfig = computed(() => {
  if (connectStore.printerConfig?.type === DEVICE_TYPES.USB) {
    return connectStore.printerConfig;
  }
  return null
});
const printerBluetoothConfig = computed(() => {
  if (connectStore.printerConfig?.type === DEVICE_TYPES.BLUETOOTH) {
    return connectStore.printerConfig;
  }
  return null
});

const isCurrentTabConnected = computed(() => {
  switch (tabActive.value) {
    case LIST_TAB.PAX: {
      return Boolean(
          paxStoreConfig.value &&
          isPaxConnected.value &&
          paxConfig.value.ip === paxStoreConfig.value?.ip &&
          Number(paxConfig.value.port) === Number(paxStoreConfig.value?.port)
      )
    }
    case LIST_TAB.PRINT: {
      let isConnected = false;
      switch (printTypeSelected.value) {
        case DEVICE_TYPES.NETWORK: {
          isConnected =
              isPrinterDeviceConnected.value &&
              printerStoreConfig.value?.type === printerNetworkConfig.value?.type &&
              printerNetworkConfig.value.ip === (printerStoreConfig.value as PrinterNetworkDevice)?.ip &&
              Number(printerNetworkConfig.value.port) === Number((printerStoreConfig.value as PrinterNetworkDevice)?.port);
          break;
        }
        case DEVICE_TYPES.USB: {
          isConnected = isPrinterDeviceConnected.value && printerStoreConfig.value?.type === printerUsbConfig.value?.type;
          break;
        }
        case DEVICE_TYPES.BLUETOOTH: {
          isConnected = isPrinterDeviceConnected.value && printerStoreConfig.value?.type === printerBluetoothConfig.value?.type;
          break;
        }
      }
      return isConnected;
    }
    default: {
      return false;
    }
  }
});
const LIST_SCAN_TYPES = [
  {
    label: 'Network printer',
    value: DEVICE_TYPES.NETWORK,
  },
  {
    label: 'USB Printer',
    value: DEVICE_TYPES.USB,
  },
  {
    label: 'Bluetooth',
    value: DEVICE_TYPES.BLUETOOTH,
  },
];
const printTypeSelected = ref(LIST_SCAN_TYPES[0].value);

const isValidConnect = computed(() => {
  switch (tabActive.value) {
    case LIST_TAB.PAX: {
      return paxConfig.value.ip && paxConfig.value.port;
    }
    case LIST_TAB.PRINT: {
      if (printTypeSelected.value === DEVICE_TYPES.NETWORK) {
        return printerNetworkConfig.value.ip && printerNetworkConfig.value.port;
      }
      return false;
    }
    default: {
      return false;
    }
  }
});

const isConnectLoading = ref(false);
const handleConnect = async () => {
  try {
    isConnectLoading.value = true;
    switch (tabActive.value) {
      case LIST_TAB.PAX: {
        await connectStore.connectPax(paxConfig.value);
        break;
      }
      case LIST_TAB.PRINT: {
        await connectStore.connectPrinter(printerNetworkConfig.value);
        break;
      }
    }
    notification.success({
      message: 'Connect success'
    });
  } catch (error) {
    handleError({error});
  } finally {
    isConnectLoading.value = false;
  }
}
const handleDisconnect = () => {
  try {
    if (tabActive.value === LIST_TAB.PAX) {
      connectStore.clearPaxConfig();
    }
    if (tabActive.value === LIST_TAB.PRINT) {
      connectStore.clearPrinterConfig();
    }
  } catch (error) {
    handleError({error});
  }
}


const scanType = computed(() => {
  if (tabActive.value === LIST_TAB.PAX) {
    return DEVICE_TYPES.PAX;
  }
  return printTypeSelected.value;
});
const modalScanRef = ref<InstanceType<typeof ModalScan> | null>(null);
const handleScan = () => {
  const scanPort = tabActive.value === LIST_TAB.PAX ? paxConfig.value.port : printerNetworkConfig.value.port;
  modalScanRef.value?.show(scanPort, scanType.value);
};
const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const show = () => {
  tabActive.value = LIST_TAB.PAX;
  modalRef.value?.show();
};
const hide = () => {
  modalRef.value?.hide();
};
defineExpose({
  show,
  hide,
});
</script>

<style scoped lang="scss">
.input-connect {
  position: relative;

  &::after {
    content: 'Disconnect';
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: var(--error);
    height: 100%;
  }

  &--connected {
    &::after {
      content: 'Connected';
      color: var(--success);
    }
  }
}
</style>

<!-- TODO: Fix still show disconnect text -->