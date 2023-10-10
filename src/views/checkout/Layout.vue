<template>
  <section class="h-screen flex flex-col">
    <div class="shrink-0 bg-primary text-white px-10 2xl:px-[60px] py-4 2xl:py-5 relative text-center">
      <button
          type="button"
          class="absolute top-1/2 -translate-y-1/2 left-10 2xl:left-[60px]"
          @click="handleBack"
          title="back"
      >
        <img class="w-10 h-auto 2xl:w-[50px]" src="@/assets/images/icon-arrow-left-white.svg" alt="">
      </button>
      <h2 class="font-bold text-32px 2xl:text-40px">{{ title }}</h2>
    </div>
    <div class="grow overflow-y-auto">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {RouteLocationRaw} from "vue-router";
import {useRouter} from "vue-router";

const router = useRouter();

const props = withDefaults(
    defineProps<{
      title: string;
      showBackBtn?: boolean;
      backRoute?: RouteLocationRaw;
    }>(),
    {
      showBackBtn: true,
    }
)
const handleBack = () => {
  props.backRoute ? router.push(props.backRoute) : router.back();
}
</script>

<style scoped>

</style>