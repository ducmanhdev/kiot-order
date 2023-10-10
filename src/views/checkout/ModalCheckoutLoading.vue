<template>
  <modal-base
      ref="modalRef"
      title="Waiting"
      :width="1370"
      :closable="false"
  >
    <div class="min-h-[600px] 2xl:min-h-[750px] p-10 2xl:p-[60px] flex flex-col justify-center text-center">
      <div class="">
        <p class="text-[66px] 2xl:text-[96px] font-bold text-secondary mb-2">{{ FormatHelper.formatShownPrice(priceTotal) }}</p>
        <loading class="mb-3"/>
        <p class="text-32px 2xl:text-36px text-gray3 font-medium mb-10">Waiting...</p>
        <p class="text-32px 2xl:text-36px font-semibold">Please follow instructions displayed <br>on credit card terminal bellow</p>
      </div>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import ModalBase from "@/components/modal/ModalBase.vue";
import Loading from '@/components/Loading.vue';
import FormatHelper from "@/utils/formatHelper";
import {useOrderStore} from "@/stores/order";

interface Emits {
  (e: 'cancel'): void;
}
const emits = defineEmits<Emits>()

const orderStore = useOrderStore();
const priceTotal = computed(() => (orderStore as any).priceTotal);
const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const show = () => {
  modalRef.value?.show();
}

const hide = () => {
  modalRef.value?.hide();
}
const handleCancel = () => {
  emits('cancel');
  hide();
}
defineExpose({
  show,
  hide
})
</script>

<style scoped>

</style>