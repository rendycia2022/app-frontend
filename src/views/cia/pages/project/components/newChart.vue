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
const originalProducts = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: false,
        }
    });
    originalProducts.value = response.data;
    products.value = originalProducts.value;

    years.value = response.data.optionYears;
    years.value.unshift("ALL")
}

onMounted( () => {
    fetching();
});

// chart
const setChartData = (labelArray, dataArray, dataColor) => {
    return {
        labels: labelArray,
        datasets: [
            {
                data: dataArray,
                backgroundColor: dataColor,
                hoverBackgroundColor: dataColor
            }
        ],
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        cutout: '60%', // Mengatur ukuran tengah doughnut
        maintainAspectRatio: false,
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

// data formulas
const margin = (revenue, cost) =>{
    var percent = 0;

    var totalMargin = revenue - cost;
    if(totalMargin > 0){
        percent = (totalMargin / revenue) * 100;
    }

    return Math.round(percent);
}

// Carousel
const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

// selected year
const selectedYear = ref(2024);
const years = ref([]);
watch(() => selectedYear.value, async (newValue, oldValue) => {
    if(newValue == "ALL"){
        products.value = originalProducts.value;
    }else{
        const response = await axiosManagement.get('/project/new/chart',{ 
            params:{
                token: local.value.token,
                user_id: local.value.user_id,
                year: newValue,
            }
        });
        products.value = response.data;
    }
    
});
    
</script>

<template>
    {{ products?.filtered_data.length }}
    {{ products?.year }}
    {{ products?.optionYears }}
    <div class="card p-fluid">
        <div class="field grid">
            <label for="name3" class="ml-5 mr-2"><b>Data periode:</b></label>
            <div class="">
                <Dropdown v-model="selectedYear" :options="years" placeholder="Select a year" class="w-100"></Dropdown>
            </div>
        </div>
    </div>
</template>