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
const fetching = async () =>{
    const response = await axiosManagement.get('/project/chart/revenue',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    
    products.value = response.data;
    console.log(products.value)

    
}
onMounted( () => {
    fetching();
});

// chart
const setChartData = (labelArray, dataArray) => {
    return {
        labels: labelArray,
        datasets: [
            {
                data: dataArray,
                backgroundColor: ['#88B04B', '#cccccc'],
                hoverBackgroundColor: ['#88B04B', '#cccccc']
            }
        ],
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        cutout: '70%', // Mengatur ukuran tengah doughnut
        plugins: {
            legend: {
                display: false // Menonaktifkan tampilan legenda
            },
            tooltip: {
                enabled: true // Tooltip tetap aktif jika diperlukan
            },
        }
    };
};

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};
    
</script>

<template>
    <div class="card">
        
        <div class="grid">
            <div v-for="n in products" class="col-6 sm:col-6 md:col-4 lg:col-3 xl:col-3 text-center" >
                <span>{{ n.title+' '+n.margin+'%' }}</span>
                <br/>
                <small 
                    v-tooltip="'Nilai PO'"
                >
                    {{ formatCurrency(n.dataRaw.po_value) }}
                </small>
                <Chart type="doughnut" :data="setChartData(n.labels, n.dataset)" :options="setChartOptions()" class="w-full md:w-[10rem]" />
            </div>
        </div>
        
    </div>
</template>