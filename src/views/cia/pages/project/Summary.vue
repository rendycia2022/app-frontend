<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../service/axios';

import History from './components/History.vue';
import ChartRevenue from './components/ChartRevenue.vue';
import Sites from './Sites.vue';

const display = ref({
    height: screen.height+'px',
});

</script>

<template>
    
    <div class="grid">
        <div class="col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12">
            <ChartRevenue />
        </div>
        <div class="col-12 sm:col-12 md:col-6 lg:col-4 xl:col-4">
            <History />
        </div>
    </div>

</template>
