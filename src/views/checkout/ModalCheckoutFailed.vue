<template>
  <modal-base
      ref="modalRef"
      title="Payment failed"
      :width="1290"
  >
    <div class="min-h-[750px] p-[60px] flex flex-col justify-center text-center">
      <div class="">
        <img class="mx-auto w-[134px] h-auto mb-8" src="@/assets/images/icon-payment-failed.svg" alt="">
        <p class="text-36px font-medium text-gray3 mb-2">Payment Failed</p>
        <p class="text-36px font-semibold">Please contact staff for assistance</p>
        <button
            type="button"
            class="btn btn-success mt-20 w-[430px]"
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