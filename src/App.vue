<template>
  <loading-base fullBackground background-color="#fff" v-if="loading"/>
  <RouterView v-else/>

  <div class="hidden">
    <div class="alert-error"></div>
    <div class="alert-info"></div>
    <div class="alert-warning"></div>
    <div class="alert-success"></div>
  </div>
  <modal-confirm ref="modalConfirmRef"/>
  <modal-add-cart ref="modalAddCartRef"/>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useConnectStore} from "@/stores/connect";
import {useGlobalStore} from "@/stores/global";
import {useOrderStore} from '@/stores/order';
import LoadingBase from '@/components/LoadingBase.vue';
import ModalConfirm from "@/components/modal/ModalConfirm.vue";
import ModalAddCart from "@/components/modal/ModalAddCart.vue";

const orderStore = useOrderStore();
const connectStore = useConnectStore();
const globalStore = useGlobalStore();
const modalConfirmRef = computed({
  get() {
    return globalStore.modalConfirmRef;
  },
  set(newValue) {
    globalStore.modalConfirmRef = newValue;
  }
});
const modalAddCartRef = computed({
  get() {
    return orderStore.modalAddCartRef;
  },
  set(newValue) {
    orderStore.modalAddCartRef = newValue;
  }
});

const loading = ref(false);
const getData = async () => {
  try {
    loading.value = true;
    const results = await Promise.allSettled([
      orderStore.getList(),
      connectStore.init(),
    ]);
    results.forEach((result) => {
      if (result.status === 'rejected') throw result.reason;
    })
  } catch (error) {
    // console.error(error);
  } finally {
    loading.value = false;
  }
}
getData();

</script>

<style scoped>
</style>
