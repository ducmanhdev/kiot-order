<template>
  <modal-base
      ref="modalRef"
      title="Connect with"
      :width="1000"
      :closable="!isConnectLoading"
  >
    <div class="p-[60px]">
      <div
          class="tabs tabs-boxed grid grid-cols-2 mb-6"
      >
        <a
            class="tab tab-lg font-bold text-24px"
            v-for="tab in LIST_TAB"
            :key="tab"
            :class="{
              'tab-active !bg-secondary': tab === tabActive
            }"
            @click="handleChangeTab(tab)"
        >
          {{ tab }}
        </a>
      </div>
      <form class="space-y-5">
        <div class="form-control">
          <label class="label">
            <span class="label-text">IP</span>
          </label>
          <input
              type="text"
              class="input input-bordered w-full"
              :class="{'input-error': errors.ip}"
              v-bind="ip"
          />
          <label class="label" v-if="errors.ip">
            <span class="label-text label-text-alt label-text-error">{{ errors.ip }}</span>
          </label>
        </div>
        <div class="form-control" v-if="tabActive === LIST_TAB.PAX">
          <label class="label">
            <span class="label-text">PORT</span>
          </label>
          <input
              type="text"
              class="input input-bordered w-full"
              :class="{'input-error': errors.port}"
              v-bind="port"
          />
          <label class="label" v-if="errors.port">
            <span class="label-text label-text-alt label-text-error">{{ errors.port }}</span>
          </label>
        </div>
        <div class="form-control grid grid-cols-2 gap-5">
          <button type="button" class="btn btn-secondary" @click="handleScan">Scan</button>
          <button
              v-if="isCurrentTabConnected"
              type="button"
              class="btn btn-primary"
              @click="handleDisconnect"
          >
            Disconnect
          </button>
          <button
              v-else
              type="button"
              class="btn btn-success"
              @click="handleConnect"
              :disabled="isConnectLoading"
          >
            <span class="loading loading-spinner" v-if="isConnectLoading"></span>
            Connect
          </button>
        </div>
      </form>
    </div>
  </modal-base>
  <modal-scan
      ref="modalScanRef"
      @select="handleSelectDevice"
  />
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useConnectStore} from '@/stores/connect';
import handleError from '@/utils/error';
import {z} from 'zod';
import {toTypedSchema} from "@vee-validate/zod";
import {useForm} from "vee-validate";
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
  tabActive.value = tab
}

const paxConfig = computed(() => connectStore.paxConfig);
const isPaxConnected = computed(() => connectStore.isPaxConnected);

const printerConfig = computed(() => connectStore.printerConfig);
const isPrintDeviceConnected = computed(() => connectStore.isPrintDeviceConnected);

const validationSchema = computed(() => {
  const schema: any = {
    ip: z.string().ip('IP address is invalid').nonempty('IP address is required'),
  }
  if (tabActive.value === LIST_TAB.PAX) {
    schema.port = z.string().nonempty('PORT is required');
  }
  return toTypedSchema(z.object(schema))
})
const {errors, handleSubmit, setFieldValue, resetForm, defineInputBinds, handleReset} = useForm({
  validationSchema: validationSchema,
});
const ip = defineInputBinds('ip');
const port = defineInputBinds('port');

watch(tabActive, async (newValue) => {
  let _values;
  switch (newValue) {
    case LIST_TAB.PAX: {
      if (paxConfig.value && isPaxConnected.value) {
        _values = {
          ip: paxConfig.value.ip,
          port: `${paxConfig.value.port}`,
        }
      } else {
        _values = {
          ip: '',
          port: '10009'
        };
      }
      break;
    }
    case LIST_TAB.PRINT: {
      if (printerConfig.value && isPrintDeviceConnected.value) {
        _values = {
          ip: printerConfig.value.ip,
          port: `${printerConfig.value.port}`,
        }
      } else {
        _values = {
          ip: '',
          port: '9100'
        };
      }
      break;
    }
  }
  resetForm({
    values: _values,
    errors: {
      ip: undefined,
      port: undefined
    }
  })
}, {
  immediate: true,
});

const isCurrentTabConnected = computed(() => {
  switch (tabActive.value) {
    case LIST_TAB.PAX: {
      return Boolean(
          paxConfig.value &&
          isPaxConnected.value &&
          ip.value.value === paxConfig.value.ip &&
          Number(port.value.value) === Number(paxConfig.value.port)
      )
    }
    case LIST_TAB.PRINT: {
      return Boolean(
          printerConfig.value &&
          isPrintDeviceConnected.value &&
          ip.value.value === printerConfig.value.ip
      )
    }
    default:
      return false;
  }
});

const PORT_PRINTER = 9100;
const isConnectLoading = ref(false);
const handleConnect = handleSubmit(async (values) => {
  try {
    isConnectLoading.value = true;
    if (tabActive.value === LIST_TAB.PAX) {
      await connectStore.connectPax({
        ip: values.ip!,
        port: Number(values.port),
      });
    } else if (tabActive.value === LIST_TAB.PRINT) {
      await connectStore.connectPrinter({
        ip: values.ip!,
        port: PORT_PRINTER,
      });
    }
    // hide();
    notification.success({
      message: 'Connect success'
    });
  } catch (error) {
    handleError({error});
  } finally {
    isConnectLoading.value = false;
  }
});
const handleDisconnect = () => {
  if (tabActive.value === 'Pax') {
    connectStore.clearPaxConfig();
  }
  if (tabActive.value === 'Print') {
    connectStore.clearPrinterConfig();
  }
  handleReset();
}
const handleSelectDevice = async (newIp: string) => {
  setFieldValue('ip', newIp);
  handleConnect();
};
const modalScanRef = ref<InstanceType<typeof ModalScan> | null>(null);
const handleScan = () => {
  const scanPort = tabActive.value === LIST_TAB.PAX ? port.value.value : PORT_PRINTER;
  modalScanRef.value?.show(Number(scanPort));
};
const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const show = () => {
  resetForm();
  tabActive.value = LIST_TAB.PAX;
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

<style lang="scss">
</style>
