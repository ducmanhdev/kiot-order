<template>
  <section class="h-screen grid laptop:grid-cols-[8fr_5fr] grid-cols-1 laptop:grid-rows-1 grid-rows-[7fr_6fr] overflow-hidden relative">
  <!-- <section class="h-screen grid grid-cols-[8fr_5fr] overflow-hidden relative"> -->
    <div class="relative bg-[url(@/assets/images/welcome.jpg)] bg-no-repeat bg-center bg-cover laptop:order-1 order-2"></div>
    <div class="absolute top-[35px] right-[35px] cursor-pointer " @click="handleLogout">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z" stroke="#C9202C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M37.5 22.5L22.5 37.5" stroke="#C9202C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22.5 22.5L37.5 37.5" stroke="#C9202C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="flex overflow-y-auto laptop:order-2 order-1" style="align-items: safe center">
      <div class="text-center w-full p-8 2xl:p-10">
        <img src="@/assets/images/logo.png" alt="" class="mb-6 xl:mb-10 mx-auto w-[200px] 2xl:w-[246px]">
        <h1 class="laptop:text-40px text-[64px] leading-tight font-bold mb-4">Where will you <br/> be eating today?</h1>
        <p class="text-36px 2xl:text-40px text-gray3 font-medium mb-6 2xl:mb-10">Choose options</p>
        <!-- <div class="space-y-6 2xl:space-y-8 max-w-[486px] mx-auto"> -->
        <div class="flex laptop:flex-col flex-row items-center justify-center gap-8 px-[85px] pt-[50px]">
          <button
              v-for="option in listOption"
              :key="option.value"
              class="rounded-[20px] 2xl:rounded-[24px] shadow-[1px_1px_12px_0_#00000040] p-4 min-h-[120px] 2xl:min-h-[140px] flex items-center justify-center gap-4 w-full text-left text-28px 2xl:text-36px font-semibold bg-white text-black"
              @click="handleSelectOrderType(option.value)"
              :disabled="option.disabled"
              :class="{'opacity-[0.5]': option.disabled}"
          >
            <img :src="getImageUrl(option.icon)" alt="">
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {getImageUrl} from "@/utils/path";
import {useOrderStore} from "@/stores/order";
import type {OrderType} from "@/stores/order";
import {useRouter} from 'vue-router';
import {gapMiniAppController} from "@/sdk";
import { ref } from 'vue';
import ModalLogOut from "@/components/modal/ModalLogOut.vue";
import { useAuthStore } from "@/stores/auth";
import handleError from "@/utils/error";

const router = useRouter();

const orderStore = useOrderStore();
const authStore = useAuthStore();

const listOption = [
  {
    icon: 'icon-eat-in.svg',
    label: 'Eat in',
    value: 'pick_up',
    disabled: false,
  },
  {
    icon: 'icon-take-away.svg',
    label: 'Take away',
    value: 'delivery',
    disabled: true,
  }
] as const;

const handleSelectOrderType = (orderType: OrderType) => {
  orderStore.setOrderType(orderType);
  router.push({
    name: 'order'
  })
}

// const closeApp = () => {
//   gapMiniAppController.closeApp()
// }

const modalLogOutRef = ref<InstanceType<typeof ModalLogOut> | null>(null);
const handleLogout = async () => {
    try {
        await modalLogOutRef.value?.show({
            bodyImage: 'logout.svg',
            bodyTitle: 'Oh no!',
            bodyMessage: 'You are leaving now? Are you sure?'
        });
        await authStore.logout();
        await router.push({name: 'login'});
    } catch (error) {
        if (!error) return;
        handleError({
            error: error
        })
    }
};
</script>

<style lang="scss" scoped>

</style>