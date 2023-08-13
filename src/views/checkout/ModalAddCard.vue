<template>
  <modal-base
      ref="modalRef"
      title="Card"
      width="1400"
  >
    <div class="p-[60px]">
      <form class="grid grid-cols-2 gap-x-[60px] gap-y-8">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Name on card</span>
          </label>
          <input
              type="text"
              placeholder="Name"
              class="input input-bordered input-bg bg-[url('@/assets/images/icon-input-user.svg')] w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Expiration date (MM/YY)</span>
          </label>
          <input
              type="text"
              placeholder="Name"
              class="input input-bordered input-bg bg-[url('@/assets/images/icon-input-user.svg')] w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Security code (CVV)</span>
          </label>
          <input
              type="text"
              placeholder="Name"
              class="input input-bordered input-bg bg-[url('@/assets/images/icon-input-user.svg')] w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Type of card</span>
          </label>
          <input
              type="text"
              placeholder="Name"
              class="input input-bordered input-bg bg-[url('@/assets/images/icon-input-user.svg')] w-full"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Bank</span>
          </label>
          <input
              type="text"
              placeholder="Name"
              class="input input-bordered input-bg bg-[url('@/assets/images/icon-input-user.svg')] w-full"
          />
        </div>
        <div class="form-control block col-span-2 text-center">
          <button type="submit" class="btn btn-success w-[433px]">CONFIRM</button>
        </div>
      </form>
    </div>
  </modal-base>
</template>

<script setup lang="ts">
import {ref} from "vue";
import ModalBase from "@/components/modal/ModalBase.vue";

interface Emits {
  (e: 'success'): void
}
const emits = defineEmits<Emits>();

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