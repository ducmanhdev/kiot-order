<template>
  <a-modal
    v-model:open="isVisible"
    class="modal_confirm"
    :title="headerTitle"
    :cancel-button-props="{
        danger: true,
      }"
    :footer="false"
    centered>
    <div class="text-center">
      <img :src="getImageUrl(bodyImage || '')" alt="" class="w-[186px] mx-auto mb-3">
      <p class="text-xl font-semibold mb-1">{{ bodyTitle }}</p>
      <p class="mb-0">{{ bodyMessage }}</p>
    </div>
    <div class="text-center pt-10">
        <a-button danger class="min-w-[200px] mr-4" ghost @click="hide">Cancle</a-button>
        <a-button type="primary" class="min-w-[200px]" @click="handleOk">Ok</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {onBeforeUnmount, ref} from "vue";
import {getImageUrl} from "@/utils/url";
import {useGeneralStore} from "@/stores/general";
import type {ConfirmPayload} from "@/types";

const generalStore = useGeneralStore();
const unsubscribe = generalStore.$onAction(
  ({
     name, // name of the action
     store, // store instance, same as `someStore`
     args, // array of parameters passed to the action
     after, // hook after the action returns or resolves
     onError, // hook if the action throws or rejects
   }) => {
    if (name === 'confirm') show(args[0]);
  }
)

onBeforeUnmount(() => {
  unsubscribe();
})

const isVisible = ref(false);
const headerTitle = ref<string | undefined>(undefined);
const bodyImage = ref<string | undefined>(undefined);
const bodyTitle = ref<string | undefined>('');
const bodyMessage = ref<string>('');

const handleOk = ref<any>(null);
const handleCancel = ref<any>(null);

const hide = () => {
  headerTitle.value = '';
  bodyTitle.value = '';
  bodyMessage.value = '';
  isVisible.value = false;
}

const show = (payload: ConfirmPayload) => {
  headerTitle.value = payload.headerTitle;
  bodyTitle.value = payload.bodyTitle;
  bodyImage.value = payload.bodyImage;
  bodyMessage.value = payload.bodyMessage || '';
  isVisible.value = true;

  return new Promise((resolve, reject) => {
    handleOk.value = () => {
      resolve(null);
      hide();
    };
    handleCancel.value = () => {
      reject();
      hide();
    };
  });
}

defineExpose({
  show,
  hide
});
</script>

<style lang="scss">
.modal_confirm{
  width: 552px !important;

  @media (max-width: 640px) {
    width: 350px !important;
  }

  .ant-modal-footer{
    text-align: center !important;
  }
}
</style>
