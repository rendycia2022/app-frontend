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
    const response = await axiosManagement.get('/project/list',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    console.log(response.data);
    products.value = response.data.list;
}
onMounted( () => {
    fetching();
});

// chart
onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref(null);

const setChartData = () => {
    const documentStyle = getComputedStyle(document.body);

    return {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [540, 325, 702],
                backgroundColor: [documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-gray-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-gray-400')]
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};

</script>

<template>
    <div class="card">
        
        <div class="grid">
            <div class="col-12 sm:col-12 md:col-3 lg:col-3 xl:col-3" >
                <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem]" />
            </div>
        </div>
        
    </div>
</template>