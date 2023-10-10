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
import {computed, ref, watch} from 'vue';
import {useConnectStore} from "@/stores/connect";
import {useGlobalStore} from "@/stores/global";
import {useOrderStore} from '@/stores/order';
import {useKeyStorageStore} from '@/stores/key-storage';
import LoadingBase from '@/components/LoadingBase.vue';
import ModalConfirm from "@/components/modal/ModalConfirm.vue";
import ModalAddCart from "@/components/modal/ModalAddCart.vue";
import { useBusinessStore } from './stores/business';
import { sdkInit } from './sdk';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const orderStore = useOrderStore();
const connectStore = useConnectStore();
const globalStore = useGlobalStore();
const businessStore = useBusinessStore();
const router = useRouter();
const route = useRoute();
const keyStorageStore = useKeyStorageStore();
const authStore = useAuthStore();

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
    try {
      await sdkInit();
      await authStore.getUserInfo();
      await Promise.allSettled([
        keyStorageStore.getKeyStorage(),
        businessStore.getBusinessSiteInfo(),
        connectStore.init(),
      ])
    } catch (error) {
      console.error(error);
    }
    const results = await Promise.allSettled([
      orderStore.getList(),
    ]);
    if (route.name === 'login') await router.push('/');
    results.forEach((result) => {
      if (result.status === 'rejected') throw result.reason;
    })
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

if(route.name !== 'home') {
  router.replace({
    name: 'home'
  })
}

watch(
    () =>  authStore.reloadSdkCount,
    getData,
    {
      immediate: true
    }
);

</script>

<style scoped>
</style>
