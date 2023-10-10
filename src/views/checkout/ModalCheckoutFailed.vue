<template>
  <modal-base
      ref="modalRef"
      title="Payment failed"
      :width="1370"
  >
    <div class="min-h-[600px] 2xl:min-h-[750px] p-10 2xl:p-[60px] flex flex-col justify-center text-center">
      <div class="">
        <img class="mx-auto w-[100px] 2xl:w-[134px] h-auto mb-8" src="@/assets/images/icon-payment-failed.svg" alt="">
        <p class="text-32px 2xl:text-36px font-medium text-gray3 mb-2">Payment Failed</p>
        <p class="text-32px 2xl:text-36px font-medium text-gray3 mb-2">Order ID: {{ orderStore.failedOrderId }}</p>
        <p class="text-32px 2xl:text-36px font-semibold">Please contact staff for assistance</p>
        <button
            type="button"
            class="btn btn-success mt-10 2xl:mt-20 w-[380px] 2xl:w-[430px]"
            @click="hide"
        >
          OK
        </button>
      </div>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {ref} from "vue";
import ModalBase from "@/components/modal/ModalBase.vue";
import {useOrderStore} from "@/stores/order";

const orderStore = useOrderStore();
const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);

const show = () => {
  modalRef.value?.show();
}

const hide = () => {
  modalRef.value?.hide();
}
defineExpose({
  show,
  hide
})
</script>

<style scoped>

</style>