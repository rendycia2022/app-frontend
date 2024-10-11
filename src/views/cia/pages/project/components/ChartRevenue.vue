<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import { axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
const originalProducts = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/chart/revenue',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;
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
    
</script>

<template>
    <div class="card">
        <h5>Data periode tahun 2022 sampai July 2024 </h5>
        <Carousel :value="products" :numVisible="4" :numScroll="1" :responsiveOptions="responsiveOptions">
            <template #item="slotProps">
                <div class="mr-2">
                    <div class="p-3 flex flex-column border-200 pricing-card cursor-pointer border-2 hover:border-green-500 transition-duration-300 transition-all" style="border-radius: 10px">
                        <h5 class="text-center" :style="{ color: slotProps.data.color }">{{ slotProps.data.title }}</h5>
                        <div class="mb-5 text-center">
                            <span class="text-600 mr-2">Nilai PO</span>
                            <span class="text-small font-bold">{{ formatCurrency(slotProps.data.dataRaw.po_value) }}</span>
                        </div>
                        <Chart type="doughnut" :data="setChartData(slotProps.data.labels, slotProps.data.dataset, slotProps.data.datasetColor)" :options="setChartOptions()" class="h-10rem mb-2" />
                        <div class="mb-5 text-center">
                            <span class="text-small font-bold mr-2" :style="{ color: slotProps.data.color }">{{ slotProps.data.progress }}%</span>
                            <span class="text-600 ">Remaining</span>
                        </div>
                        <Divider class="w-full bg-surface-200"></Divider>
                        <ul class="mb-5 list-none p-0 flex text-900 flex-column">
                            <li class="py-2">
                                <span class="text-md line-height-3" >Margin: <b :style="{ color: slotProps.data.color }">{{ margin(slotProps.data.dataRaw.po_value, slotProps.data.dataRaw.af_total) }}%</b></span>
                            </li>
                            <li class="py-2">
                                <span class="text-md line-height-3" >Total Cost: <b :style="{ color: slotProps.data.color }">{{ formatCurrency(slotProps.data.dataRaw.af_total) }}</b></span>
                            </li>
                            <li class="py-2">
                                <span class="text-md line-height-3" >Total PO: <b :style="{ color: slotProps.data.color }">{{ slotProps.data.dataRaw.status.total_po }}</b></span>
                            </li>
                            <li class="py-2">
                                <Chip class="mr-2 text-900 bg-green-100" :label="slotProps.data.dataRaw.status.Open+' PO Open'" />
                                <Chip v-if="slotProps.data.dataRaw.status.Close" class="mr-2 text-900 bg-orange-100" :label="slotProps.data.dataRaw.status.Close+' PO Close'" />
                                <Chip v-else class="mr-2 text-900 bg-orange-100" label="0 PO Close" />
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </Carousel>
        
    </div>
</template>