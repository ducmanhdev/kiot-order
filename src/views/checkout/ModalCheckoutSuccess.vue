<template>
  <modal-base
      ref="modalRef"
      title="Payment successful"
      :width="1370"
  >
    <div class="min-h-[600px] 2xl:min-h-[750px] p-10 2xl:p-[60px] flex flex-col justify-center text-center">
      <div class="">
        <p class="text-[66px] 2xl:text-[96px] font-bold mb-8">{{ FormatHelper.formatShownPrice(priceTotal) }}</p>
        <img class="mx-auto w-[100px] 2xl:w-[134px] h-auto mb-8" src="@/assets/images/icon-payment-success.svg" alt="">
        <p class="text-32px 2xl:text-36px text-gray3 font-medium mb-2">Payment successful</p>
        <p class="text-32px 2xl:text-36px font-semibold">Your order will be ready very soon</p>
      </div>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import ModalBase from "@/components/modal/ModalBase.vue";
import FormatHelper from "@/utils/formatHelper";
import {useOrderStore} from "@/stores/order";

const orderStore = useOrderStore();
const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const priceTotal = computed(() => (orderStore as any).priceTotal);

let autoCloseTimeout: any;
const show = () => {
  modalRef.value?.show();
  autoCloseTimeout = setTimeout(hide, 10000);
}

const hide = () => {
  modalRef.value?.hide();
  clearTimeout(autoCloseTimeout);
}
defineExpose({
  show,
  hide
})
</script>

<style scoped>

</style>