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
    chartForProject.value = newValue.chart.po;
    if(chartForProject.value){
        for(var i=0; i<chartForProject.value.length; i++){
            chartForProject.value[i].chartOptions = setChartOptions(chartForProject.value[i].options.title.text);
            chartForProject.value[i].chartData = setChartData(chartForProject.value[i].labels, chartForProject.value[i].datasets);
        }
    }
    
});

// chart
const chartForProject = ref();
        
const setChartData = (labelArray, dataArray) => {
    return {
        labels: labelArray,
        datasets: dataArray,
    };
};

const setChartOptions = (chartTitle) => {
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
                intersect: false
            },
            legend: {
                labels: {
                    color: textColor
                }
            },
            title: {
                display: false,
                text: chartTitle, // judul chart
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

const emit = defineEmits(['selectedChartStackPO']);
const dataset = ref({});
const handleChartSelect = (chartData, chartOptions, event) =>{

    var title = chartOptions.plugins.title.text;
    dataset.value.title = title;

    var datasetIndex = event.element.datasetIndex;
    var index = event.element.index;

    var label = dateFormating(chartData.labels[index]);
    dataset.value.label = label;

    var datasetLabel = chartData.datasets[datasetIndex].label;
    dataset.value.datasetLabel = datasetLabel;
    
    emit('selectedChartStackPO', dataset.value);
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

    <ScrollPanel style="width: 100%; height: 480px">
        <div class="grid" >
            <div v-for="n in chartForProject" class="col-12 sm:col-12 md:col-3 lg:col-3 xl:col-3">
                <div class="card text-center">
                    <span>{{ n.title }}</span>
                    <Chart type="bar" :data="n.chartData" :options="n.chartOptions" class="h-30rem" @select="handleChartSelect(n.chartData, n.chartOptions, $event)" />
                </div>
            </div>
        </div>
    </ScrollPanel>
    

</template>
