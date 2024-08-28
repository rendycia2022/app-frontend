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

const options = ref([]);
const optionsOriginal = ref([]);

const props = defineProps(['menuType','updateChart']);
watch(() => props.updateChart, async (newValue, oldValue) => {
    chartForProject.value = newValue.chart.po;
    chartForProjectOriginal.value = newValue.chart.po;
    if(chartForProject.value){
        for(var i=0; i<chartForProject.value.length; i++){
            chartForProject.value[i].chartOptions = setChartOptions(chartForProject.value[i].options.title.text);
            chartForProject.value[i].chartData = setChartData(chartForProject.value[i].labels, chartForProject.value[i].datasets);
            
            options.value.push(chartForProject.value[i].options.title.text)
            optionsOriginal.value.push(chartForProject.value[i].options.title.text)
        }
    }
    
});

// chart
const chartForProject = ref();
const chartForProjectOriginal = ref();
        
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

const emit = defineEmits(['selectedDataStackPO']);
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
    
    emit('selectedDataStackPO', dataset.value); 
}

// date builder
const dateFormating = (date)=>{
    var newDate = new Date(date);
    var getMonth = newDate.getMonth()+1;
    if(getMonth < 10){
        getMonth = '0'+getMonth;
    }
    var getYear =  newDate.getFullYear();
    var formatedDate = getYear;

    return formatedDate;
}

// selected data
const selectedOption = ref();
const search = (event) => {
    let query = event.query;
    options.value = optionsOriginal.value;
    if(query){
        options.value = options.value.filter((val) => val.toLowerCase().includes(query.toLowerCase()));
    }
}

const handleSelected = (item) => {
    let selected = item.value;
    chartForProject.value = chartForProject.value.filter((val) => val.options.title.text.toLowerCase() === selected.toLowerCase());
}

const clearSelected = () =>{
    selectedOption.value = null;
    chartForProject.value = chartForProjectOriginal.value;
    if(chartForProject.value){
        for(var i=0; i<chartForProject.value.length; i++){
            chartForProject.value[i].chartOptions = setChartOptions(chartForProject.value[i].options.title.text);
            chartForProject.value[i].chartData = setChartData(chartForProject.value[i].labels, chartForProject.value[i].datasets);
        }
    }
}

</script>

<template>
    <div class="p-fluid mb-5">
        <div class="field grid">
            <label for="name3" class="ml-5 mr-2"><b>PO Number:</b></label>
            <div class="col-3">
                <AutoComplete v-model="selectedOption" dropdown @item-select="handleSelected"  :suggestions="options" @complete="search" class="w-100" />
            </div>
            <div class="col-1">
                <Button icon="pi pi-times" aria-label="Clear" v-tooltip="'Clear search'" rounded severity="danger"  @click="clearSelected" />
            </div>
        </div>
    </div>
    
    <ScrollPanel style="width: 100%; height: 480px">
        <div class="grid" >
            <div v-for="n in chartForProject" class="col-12 sm:col-12 md:col-3 lg:col-2 xl:col-2">
                <div class="card text-center">
                    <span>{{ n.title }}</span>
                    <Chart type="bar" :data="n.chartData" :options="n.chartOptions" class="h-25rem w-15rem" @select="handleChartSelect(n.chartData, n.chartOptions, $event)" />
                </div>
            </div>
        </div>
    </ScrollPanel>
    

</template>
