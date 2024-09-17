<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import List from './project/List.vue';
import ChartRevenue from './project/components/ChartRevenue.vue';
import ChartRevenueYear from './project/components/ChartRevenueYear.vue';

</script>

<template>
    <ChartRevenue />
    <ChartRevenueYear />
    <List />
</template>
