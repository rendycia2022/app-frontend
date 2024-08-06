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
    const labelForChart = newValue.chart.overhead.labels;
    const dataForChart = newValue.chart.overhead.datasets;
    chartData.value = setChartData(labelForChart, dataForChart);
    chartOptions.value = setChartOptions();
});

// chart
const chartData = ref();
const chartOptions = ref();
        
const setChartData = (labelArray, dataArray) => {
    return {
        labels: labelArray,
        datasets: dataArray,
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltips: {
                mode: 'index',
                intersect: true,
            },
            legend: {
                labels: {
                    color: textColor
                }
            },
            title: {
                display: true,
                text: 'Overhead (in IDR)', // judul chart
                fontSize: 16 // ukuran font judul
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                stacked: true,
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

const emit = defineEmits(['selectedDataStack']);
const dataset = ref({});
const handleChartSelect = (event) =>{
    var datasetIndex = event.element.datasetIndex;
    var index = event.element.index;

    var label = dateFormating(chartData.value.labels[index]);
    dataset.value.label = label;

    var datasetLabel = chartData.value.datasets[datasetIndex].label;
    dataset.value.datasetLabel = datasetLabel;
    emit('selectedDataStack', dataset.value);
}

// date builder
const dateFormating = (date)=>{
    var newDate = new Date(date);
    var getMonth = newDate.getMonth()+1;
    if(getMonth < 10){
        getMonth = '0'+getMonth;
    }
    var getYear =  newDate.getFullYear();
    var formatedDate = getYear+'-'+getMonth;

    return formatedDate;
}
</script>

<template>
    <!-- chart -->
    <div class="card">
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-30rem" @select="handleChartSelect"/> 
    </div>

</template>
