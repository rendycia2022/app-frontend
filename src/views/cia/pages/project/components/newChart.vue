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
const productsRaw = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: "All",
            status: "All",
        }
    });
    originalProducts.value = response.data.charts;
    products.value = originalProducts.value;

    productsRaw.value = response.data;
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
                display: false, // Menonaktifkan tampilan legenda
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

// filter
const props = defineProps(['status', 'year']);
const parameters = ref({
    year: "All",
    status: "All",
});

watch(() => props.year, (newValue, oldValue) => {
    parameters.value.year = newValue;
    filterData(parameters.value);
});

watch(() => props.status, (newValue, oldValue) => {
    parameters.value.status = newValue;
    filterData(parameters.value);
});

const filterData = async (params) =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: params.year,
            status: params.status,
        }
    });
    products.value = response.data.charts;

    productsRaw.value = response.data;
}

// calculation
const calculateQtyStatus = (projectCode, status) => {
    let total = 0;
    if (productsRaw.value.raw.length > 0) {
        for(let raw in productsRaw.value.raw){
            total++;
        }
    }
    console.log(projectCode+': '+total)

    return total;
};
    
</script>

<template>
    <div class="card p-fluid">
        <Carousel :value="products" :numVisible="3" :numScroll="1" :responsiveOptions="responsiveOptions">
            <template #item="slotProps">
                <div class="mr-2">
                    <div class="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-green-500 transition-duration-300 transition-all" style="border-radius: 10px">
                        <h5 class="text-center" :style="{ color: slotProps.data.color }">{{ slotProps.data.title }}</h5>
                        <div class="mb-5 text-center">
                            <span class="text-600 mr-2 mb-1 md:mb-0"><b>Expected Revenue</b></span>
                            <div class="mt-1 text-small font-bold"><small>{{ formatCurrency(slotProps.data.raw.revenue) }}</small></div>
                        </div>
                        <Chart type="doughnut" :data="setChartData(slotProps.data.labels, slotProps.data.dataset, slotProps.data.datasetColor)" :options="setChartOptions()" class="h-10rem mb-2" />
                        <div class="mb-5 text-center">
                            <span class="text-small font-bold mr-2" :style="{ color: slotProps.data.color }">{{ slotProps.data.progress }}%</span>
                            <span class="text-600 ">Remaining</span>
                        </div>
                        <table class="text-left mb-3 " style="width:60%;"> 
                            <tr>
                                <td><small>Expected Revenue's left:</small></td>
                                <td><small class="font-bold" :style="{ color: slotProps.data.color }">{{ formatCurrency(slotProps.data.raw.revenue - slotProps.data.raw.invoice) }}</small></td>
                            </tr>
                            <tr>
                                <td><small>Invoice:</small></td>
                                <td><small class="font-bold">{{ formatCurrency(slotProps.data.raw.invoice) }}</small></td>
                            </tr>
                        </table>
                        <!-- <ul class="mb-5 list-none p-0 flex text-900 flex-column">
                            <li class="py-2">
                                <Chip class="mr-2 text-900 bg-orange-100" :label="calculateQtyStatus(slotProps.data.title, 'Open')+' PO Open'" />
                                <Chip class="mr-2 text-900 bg-green-100" :label="calculateQtyStatus(slotProps.data.title, 'Close')+' PO Close'" />
                            </li>
                        </ul> -->
                    </div>
                </div>
            </template>
        </Carousel>
    </div>
</template>