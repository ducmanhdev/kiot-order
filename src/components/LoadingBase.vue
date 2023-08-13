<template>
    <div class="loading-base" :class="{'full': fullBackground}" :style="`background-color: ${backgroundColor}`">
        <span class="loading loading-infinity loading-lg"></span>
        <!-- <span class="loading loading-ring loading-xs"></span> -->
    </div>
</template>

<script lang="ts" setup>

    interface Props {
        fullBackground?: boolean
        backgroundColor?: string
    }

    const props = withDefaults(defineProps<Props>(), {
        fullBackground: false,
        backgroundColor: 'transparent'
    }) 

</script>

<style lang="scss" scoped>
.loading-base{
    &.full{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .loading{
        width: 60px;
        background-color: #FF7731;
    }
}
</style>