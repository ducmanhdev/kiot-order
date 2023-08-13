<template>
  <Teleport to="body">
    <dialog class="modal" ref="dialogRef" v-bind="$attrs">
      <form
          method="dialog"
          class="modal-box overflow-y-hidden p-0"
          :style="modalStyle"
      >
        <header class="bg-primary text-white">
          <h3 class="font-bold">{{ title }}</h3>
          <div v-if="closable" class="h-full px-5 flex-center cursor-pointer" @click="hide">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z"
                  stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M37.5 22.5L22.5 37.5" stroke="white" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round"/>
              <path d="M22.5 22.5L37.5 37.5" stroke="white" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </div>
        </header>
        <main class="overflow-y-auto p-0">
          <slot></slot>
        </main>
        <footer class="p-7 shadow-[-1px_1px_8px_0_rgba(0,0,0,0.25)]" v-if="slots.footer">
          <slot name="footer"></slot>
        </footer>
      </form>
      <div class="modal-backdrop bg-[rgba(22,22,22,0.6)]"></div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, computed, onBeforeUnmount, onMounted} from 'vue';
defineOptions({
  inheritAttrs: false
})
const slots = defineSlots();

const dialogRef = ref<HTMLDialogElement | null>(null);

interface Props {
  title?: string;
  width?: any;
  height?: any;
  closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
});

const emits = defineEmits(['afterClose'])

const modalStyle = computed(() => {
  let result = '';
  if (props.width) result = result + `width: ${props.width}px; `;
  if (props.height) result = result + `height: ${props.height}px; `;
  return result
})

const removeFocus = () => {
  try {
    (document.activeElement as HTMLElement).blur();
  } catch (error) {
    console.log(error)
  }
}

const show = () => {
  dialogRef.value?.show();
  removeFocus();
}

const hide = () => {
  dialogRef.value?.close();
}

const handleAfterClose = () => {
  emits('afterClose');
}
onMounted(() => {
  dialogRef.value?.addEventListener('close', handleAfterClose);
})

onBeforeUnmount(() => {
  dialogRef.value?.removeEventListener('close', handleAfterClose);
})
defineExpose({
  show,
  hide,
})
</script>

<style lang="scss" scoped>
.modal {
  width: 100%;
  height: 100%;

  .modal-box {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    header {
      height: 70px;
      padding-left: 60px;
      padding-right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      h3 {
        color: #FFF;
        font-size: 28px;
        font-weight: 700;
        line-height: 100px;
      }

      svg {
        width: 40px;
        height: 40px;
      }
    }

    main {
      height: calc(100% - 70px);
      flex-grow: 1;
      overflow-y: auto;
    }
  }

  @media (min-width: 1990px) {
    header {
      height: 100px;
      padding-left: 60px;
      padding-right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        color: #FFF;
        font-size: 40px;
        font-weight: 700;
        line-height: 100px;
      }

      svg {
        width: 60px;
        height: 60px;
      }
    }
    main {
      height: calc(100% - 100px);
    }
  }
}
</style>