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
const props = defineProps(['code', 'completed']);
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});
watch(() => props.code, async (newValue, oldValue) => {
    fetching();  
});

// data
const slicingText = ref(20);
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/revenue/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;
    
}

onMounted(() => {
    fetching();
});

// formating text
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// calculation
const calculateTotal = () => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            let subtotal = product['price'] * product['qty'];
            total = total + subtotal;
        }
    }

    return total;
}
const calculateTotalMeta = (meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            
            total = total + product[meta];
        }
    }

    return total;
};

</script>

<template>
    <!-- expected revenue -->
    <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2">
        <div>
            <span class="text-900 font-small mr-2 mb-1 md:mb-0"><small>Expected Revenue</small></span>
            <div class="mt-1 text-green-600"><small><b>{{ formatCurrency(calculateTotal()) }}</b></small></div>
        </div>
    </div>
    <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-1">
        <div>
            <span class="text-900 font-small mr-2 mb-1 md:mb-0"><small>Expected Margin</small></span>
            <span class="text-green-600"><small><b>0%</b></small></span>
            <div class="mt-1 text-green-600"><small><b>{{ formatCurrency(0) }}</b></small></div>
        </div>
    </div>
</template>
