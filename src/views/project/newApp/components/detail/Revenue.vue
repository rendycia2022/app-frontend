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
const props = defineProps(['code', 'completed', 'budget']);
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});
watch(() => props.code, async (newValue, oldValue) => {
    fetching();  
});

// budget
const budget = ref({});
watch(() => props.budget, async (newValue, oldValue) => {
    budget.value = newValue; 
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
    return 'Rp '+value?.toLocaleString('en-US')+'.00';
    // return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
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
            <span class="text-900 font-small mr-2 mb-1 md:mb-0">
                <small><b>Expected Revenue</b></small>
                <small class="ml-1">in <b class="text-green-600">{{ formatNumber(calculateTotalMeta('qty')) }}</b> Site</small>
            </span>
            <div class="mt-1 text-green-600"><small><b>{{ formatCurrency(calculateTotal()) }}</b></small></div>
        </div>
    </div>
    <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-1">
        <div>
            <span class="text-900 font-small mr-2 mb-1 md:mb-0"><small><b>Expected Margin</b></small></span>
            <span class="text-green-600"><small><b>{{ Math.round(((calculateTotal()-budget) / calculateTotal())*100) }}%</b></small></span>
            <div class="mt-1 text-green-600"><small><b>{{ formatCurrency(calculateTotal()-budget) }}</b></small></div>
        </div>
    </div>
</template>
