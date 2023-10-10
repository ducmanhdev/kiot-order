<template>
  <modal-base
      ref="modalRef"
      :title="title"
      :width="1000"
      @after-close="handleAfterClose()"
  >
    <div class="p-[60px]">
      <h4 class="text-32px lg:text-[36px] font-semibold text-center mb-6" v-text="message"></h4>
      <div class="flex justify-center gap-3">
        <button type="button" class="btn-wide" :class="cancelStyle" @click="handleCancel">{{ cancelTitle }}</button>
        <button type="button" class="btn-wide" :class="acceptStyle" @click="handleAccept">{{ acceptTitle }}</button>
      </div>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import ModalBase from "@/components/modal/ModalBase.vue";

const props = withDefaults(defineProps<{
  title?: string,
  acceptTitle?: string,
  cancelTitle?: string,
  acceptStyle?: string,
  cancelStyle?: string,
  showCloseButton?: boolean,
}>(), {
  title: 'Confirm',
  acceptTitle: 'Accept',
  cancelTitle: 'Cancel',
  acceptStyle: 'btn btn-primary',
  cancelStyle: 'btn btn-primary btn-outline',
  showCloseButton: true,
})
const emits = defineEmits(['accept'])
const handleResolve = ref<any>(null);
const handleReject = ref<any>(null);
const handleAfterClose = ref<any>(null);
const message = ref('');

const modalRef = ref<InstanceType<typeof ModalBase> | null>(null);
const show = (value: string) => {
  message.value = value;
  return new Promise((resolve, reject) => {
    handleResolve.value = resolve;
    handleReject.value = reject;
    handleAfterClose.value = reject;
    modalRef.value?.show();
  });
}
const hide = () => {
  modalRef.value?.hide();
  setTimeout(() => {
    message.value = '';
  }, 300);
};
const handleAccept = () => {
  emits('accept');
  handleAfterClose.value = handleResolve.value;
  hide();
};
const handleCancel = () => {
  hide();
};

defineExpose({
  show,
  hide,
});
</script>

<style lang="scss" scoped></style>
