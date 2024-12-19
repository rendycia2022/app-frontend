<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const emit = defineEmits(['completeBudget']);
const props = defineProps(['code', 'completed']);
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});
watch(() => props.code, async (newValue, oldValue) => {
    fetching();  
});


// data
const slicingText = ref(20);
const products = ref({});
const fetching = async () =>{
    const direct = await axiosProject.get('/v2/direct/total/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value.direct = direct.data;
    
    const indirect = await axiosProject.get('/v2/indirect/total/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value.indirect = indirect.data;

}

onMounted(() => {
    fetching();
});

// formating text
const formatCurrency = (value) => {
    return 'Rp '+value?.toLocaleString('en-US')+'.00';
    // return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// calculate
const calculateTotal = () =>{
    let total = 0;

    total = products.value.direct?.total + products.value.indirect?.total;

    emit('completeBudget', total);
    return total;
}

</script>

<template>
    <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-5">
        <div>
            <span class="text-900 font-small mr-2 mb-1 md:mb-0"><small><b>Proposed Budget</b></small></span>
            <div class="mt-1 text-600"><small>{{ formatCurrency(calculateTotal()) }}</small></div>
        </div>
    </div>

    <!-- indirect cost -->
    <div class="grid mb-2">
        <span class="block text-600 font-small mr-2"><small>Indirect Cost</small></span>
        <div class="text-blue-600"><small><b>{{ formatCurrency(products.indirect?.['total']) }}</b></small></div>
    </div>
    <ul class="p-0 m-0 list-none mb-5">
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Resources</small></span>
            <span class="text-blue-500"><small><b>{{ formatCurrency(products.indirect?.['Resources']) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Overhead</small></span>
            <span class="text-blue-500"><small><b>{{ formatCurrency(products.indirect?.['Overhead']) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Tax 3%</small></span>
            <span class="text-blue-500"><small><b>{{ formatCurrency(0) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Cost of Fund</small></span>
            <span class="text-blue-500"><small><b>{{ formatCurrency(0) }}</b></small></span>
        </li>
    </ul>

    <!-- direct cost -->
    <div class="grid mb-2">
        <span class="block text-600 font-small mr-2"><small>Direct Cost</small></span>
        <div class="text-cyan-600"><small><b>{{ formatCurrency(products.direct?.['total']) }}</b></small></div>
    </div>
    <ul class="p-0 m-0 list-none mb-5">
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Consultants</small></span>
            <span class="text-cyan-500"><small><b>{{ formatCurrency(products.direct?.['Consultants']) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Material Purchasing</small></span>
            <span class="text-cyan-500"><small><b>{{ formatCurrency(products.direct?.['Material-Purchasing']) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Sub-Contracting</small></span>
            <span class="text-cyan-500"><small><b>{{ formatCurrency(products.direct?.['Sub-Contracting']) }}</b></small></span>
        </li>
        <li class="flex align-items-center py-1 border-bottom-1 surface-border">
            <span class="text-900 line-height-1 mr-2"><small>Other</small></span>
            <span class="text-cyan-500"><small><b>{{ formatCurrency(products.direct?.['Other']) }}</b></small></span>
        </li>
    </ul>
</template>
