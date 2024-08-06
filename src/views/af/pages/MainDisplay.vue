<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import DataApproval from './af/approval/Data.vue';
import ChartAF from './af/approval/ChartAF.vue';
import ChartOverhead from './af/approval/ChartOverhead.vue';
import ChartProject from './af/approval/ChartProject.vue';

const newDataChart = ref(null)
const updateChart = (dataChart) => {
    newDataChart.value = dataChart;
};

const newSelectedDataChart = ref(null);
const selectedChart = (selectedData) =>{
    newSelectedDataChart.value = selectedData;
};
const newSelectedDataChartStack = ref(null);
const selectedChartStack = (selectedDataStack) =>{
    newSelectedDataChartStack.value = selectedDataStack;
};
const newSelectedDataChartStackProject = ref(null);
const selectedChartStackProject = (selectedDataStackProject) =>{
    newSelectedDataChartStackProject.value = selectedDataStackProject;
};
</script>

<template>
    <div class="grid">
        <div class="col-12 sm:col-12 md:col-12 lg:col-6 xl:col-6">
            <ChartAF menuType="0" :updateChart="newDataChart" @selectedData="selectedChart" />
        </div>
        <div class="col-12 sm:col-12 md:col-12 lg:col-6 xl:col-6">
            <ChartOverhead menuType="0" :updateChart="newDataChart" @selectedDataStack="selectedChartStack" />
        </div>
    </div>
    
    <div class="mb-4">
        <ChartProject menuType="0" :updateChart="newDataChart" @selectedDataStackProject="selectedChartStackProject" />
    </div>

    <Toolbar class="mb-4">
        <template v-slot:start>
            <router-link class="mr-2" to="/af/approval">
                <Button label="Approval Form" />
            </router-link>
            <router-link to="/af/items">
                <Button label="Report"  severity="success"/>
            </router-link>
            
        </template>
        <template v-slot:end>
            <!-- <router-link to="/af/access">
                <Button label="Access" icon="pi pi-verified" class="p-button-info" />
            </router-link> -->
        </template>
    </Toolbar>

    <DataApproval 
        menuType="0" 
        sortList="submission_date" 
        @dataChart="updateChart" 
        :selectedChart="newSelectedDataChart" 
        :selectedChartStack="newSelectedDataChartStack" 
        :selectedChartStackProject="newSelectedDataChartStackProject"
    />
</template>
