<template>
  <aside
      class="h-full flex flex-col overflow-hidden shadow-[0px_4px_6px_0px_rgba(0,9,54,0.25)] relative bg-white text-black">
    <div class="shrink-0 bg-secondary text-white text-center py-8">
      <span class="text-40px font-bold">LOGO</span>
    </div>
    <h3 class="shrink-0 text-32px font-bold pt-10 pb-3 px-9 2xl:px-12">Menu</h3>
    <div class="grow overflow-y-auto">
      <div class="pb-10 px-5">
        <ul class="text-24px 2xl:text-28px space-y-3">
          <li
              v-for="cate in categoryList"
              :key="cate.id"
              class="flex items-center py-3 px-4 2xl:px-7 rounded-xl cursor-pointer"
              :id="`menu-${cate.id}`"
              :class="{ 'bg-primary text-white font-bold': route.params.categoryId === cate.id.toString() }"
              @click="handleSelect(cate.id)"
          >
            <span>{{ cate.name }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="shrink-0 px-5 py-7 2xl:pb-9">
      <button
          class="btn w-full bg-transparent border-transparent 2xl:text-28px h-auto"
          @click="handleShowModalConnect"
      >
        <img class="shrink-0 w-[30px] h-auto" src="@/assets/images/icon-config.svg" alt="">
        Devices manager
      </button>
    </div>
    <modal-connect ref="modalConnectRef"/>
  </aside>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRouter, useRoute} from "vue-router";
import ModalConnect from "@/components/modal/ModalConnect.vue";
import {type Category, useOrderStore} from "@/stores/order";

const orderStore = useOrderStore();

const categoryList = computed(() => orderStore.categoryList);

const router = useRouter();
const route = useRoute();
const handleSelect = (newCategoryId: number) => {
  router.push({
    params: {
      categoryId: newCategoryId
    }
  })
}

const handleScrollToMenu = () => {
  setTimeout(() => {
    const li = document.querySelector(`#menu-${route.params.categoryId}`);
    li && li.scrollIntoView({
      behavior: 'smooth'
    })
  }, 1000)
}
watch(categoryList, (newCategory: Category[]) => {
  if (!newCategory?.length) return;
  if (route.params.categoryId && newCategory.find(item => item.id)) {
    handleScrollToMenu();
    return;
  }
  router.replace({
    params: {
      categoryId: newCategory[0].id
    }
  });
  handleScrollToMenu();
}, {
  immediate: true,
});

const modalConnectRef = ref<InstanceType<typeof ModalConnect> | null>(null);
const handleShowModalConnect = () => {
  modalConnectRef.value?.show();
}
</script>