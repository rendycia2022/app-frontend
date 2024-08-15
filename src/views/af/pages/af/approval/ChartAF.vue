<script setup>
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosAf } from '../../../../../service/axios';

// local data
const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    access_id: localStorage.getItem('access_id'), 
    sign_id: localStorage.getItem('sign_id'),
});

const props = defineProps(['menuType','updateChart']);
watch(() => props.updateChart, async (newValue, oldValue) => {
    // console.log(newValue);
    const labelForChart = newValue.chart.af.labels;
    const dataForChart = newValue.chart.af.datasets;
    chartData.value = setChartData(labelForChart, dataForChart);
});

// chart
onMounted(() => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const chartData = ref();
const chartOptions = ref();
        
const setChartData = (labelArray, dataArray) => {

    return {
        labels: labelArray,
        datasets: dataArray
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        onClick: HandlingEvent,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            title: {
                display: true,
                text: 'Jumlah AF Submission', // judul chart
                fontSize: 16 // ukuran font judul
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

const emit = defineEmits(['selectedData']);
const HandlingEvent = (event, array) =>{
    var title = event.chart.tooltip.title[0];
    emit('selectedData', title);
}

</script>

<template>
    <!-- chart -->
    <div class="card">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" />
    </div>

</template>
