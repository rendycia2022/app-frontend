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
const productsRaw = ref(null);
const years = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: "All",
            status: "All",
            project: "All",
        }
    });
    originalProducts.value = response.data.charts;
    products.value = originalProducts.value;

    productsRaw.value = response.data;
    years.value = productsRaw.value.optionYears;

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
    return 'Rp '+value?.toLocaleString('en-US');
    // return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
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
const props = defineProps(['status', 'year', 'project']);
const parameters = ref({
    year: "All",
    status: "All",
    project: "All",
});

watch(() => props.year, (newValue, oldValue) => {
    parameters.value.year = newValue;
    filterData(parameters.value);
});

watch(() => props.status, (newValue, oldValue) => {
    parameters.value.status = newValue;
    filterData(parameters.value);
});

watch(() => props.project, (newValue, oldValue) => {
    parameters.value.project = newValue;
    filterData(parameters.value);
});

const filterData = async (params) =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: params.year,
            status: params.status,
            project: params.project,
        }
    });
    products.value = response.data.charts;

    productsRaw.value = response.data;
}

// calculation
const calculateExpectedRemaining = (year, title) => {
    let total = 0;

    let datas = productsRaw.value.raw;

    var getYear = new Date(year),
        yearParams = getYear.getFullYear();

    for(let item in datas){

        var projectCode = datas[item].project.code;
        if(projectCode == title){

            var date = new Date(datas[item].date),
            yearRaw = date.getFullYear();

            if(yearRaw == yearParams){
                let revenue = datas[item].revenue.total;
                let bast = datas[item].bast.total;

                let subtotal = revenue - bast;
                // if(title == 'SLB_IOH'){
                //     let bast = datas[item].bast.total;
                //     subtotal = revenue - bast;
                // }

                total = total + subtotal;
            }
        }
        
    }

    return total;
};
    
</script>

<template>
    <div class="card p-fluid">
        <Carousel :value="products" :numVisible="3" :numScroll="1" :responsiveOptions="responsiveOptions">
            <template #item="slotProps">
                <div class="mr-2">
                    <div class="p-3 flex flex-column border-200 pricing-card border-2 hover:border-green-500 transition-duration-300 transition-all" style="border-radius: 10px">
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
                        <table class="text-left mb-3" style="width:60%;"> 
                            <tr>
                                <td>
                                    <small v-if="(slotProps.data.raw.revenue - slotProps.data.raw.bast) < 0" >Extra Revenue:</small>
                                    <small v-else >Expected Revenue's left:</small>
                                </td>
                                <td>
                                    <small v-if="(slotProps.data.raw.revenue - slotProps.data.raw.bast) < 0" class="font-bold" :style="{ color: slotProps.data.color }">
                                        +{{ formatCurrency((slotProps.data.raw.revenue - slotProps.data.raw.bast)*-1) }}
                                    </small>
                                    <small v-else class="font-bold" :style="{ color: slotProps.data.color }">
                                        {{ formatCurrency((slotProps.data.raw.revenue - slotProps.data.raw.bast)) }}
                                    </small>
                                </td>
                            </tr>
                            <tr>
                                <td><small>BAST:</small></td>
                                <td>
                                    <small class="font-bold">{{ formatCurrency(slotProps.data.raw.bast) }}</small>
                                </td>
                            </tr>
                        </table>
                        <small>Expected Revenue's left in each year:</small>
                        <div class="mb-3">
                            <table v-for="year in years" class="" style="width:55%;"> 
                                <tr>
                                    <td>
                                        <small>
                                            <b :style="{ color: slotProps.data.color }">{{ year }}</b>: 
                                            <span v-if="calculateExpectedRemaining(year, slotProps.data.title) < 0">+{{ formatCurrency(calculateExpectedRemaining(year, slotProps.data.title)*-1) }}</span>
                                            <span v-else>{{ formatCurrency(calculateExpectedRemaining(year, slotProps.data.title)) }}</span>
                                        </small>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                    </div>
                </div>
            </template>
        </Carousel>
    </div>
</template>