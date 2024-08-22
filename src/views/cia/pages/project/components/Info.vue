<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
const status = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/list',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
    status.value = response.data.status;
    // console.log(products.value);
}

onMounted( () => {
    fetching();
});

const calculateTotal = (meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {

            total = total + product[meta];
        }
    }

    return total;
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
    
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-5">
                    <div>
                        <span class="block text-500 font-medium mb-3">Jumlah PO</span>
                        <div class="text-900 font-medium text-xl">{{ status?.close + status?.open }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ status?.close }} Close, </span>
                <span class="text-orange-500 font-medium mr-1">{{ status?.open }} Open </span>
                <span class="text-500">dari seluruh project</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-5">
                    <div>
                        <span class="block text-500 font-medium mb-3">Total Nilai PO</span>
                        <div class="text-900 font-medium text-xl">{{ formatCurrency(calculateTotal('po_value')) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium mr-1">{{ formatCurrency(calculateTotal('revenue')) }}</span>
                <span class="text-500">revenue</span>
            </div>
        </div>
    </div>
</template>