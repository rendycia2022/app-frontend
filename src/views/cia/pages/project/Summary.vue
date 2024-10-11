<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import { axiosManagement } from '../../../../service/axios';

import newChart from './components/newChart.vue';
import newList from './newList.vue'

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const fetching = async () =>{
    const response = await axiosManagement.get('/project/new/chart',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            year: "all",
            status: "all",
        }
    });
    years.value = response.data.optionYears;
    years.value.unshift("All")
}
onMounted( () => {
    fetching();
});

// status
const selectedStatus = ref("All");
const status = ref(["All","Open", "Close"]);

// periode
const selectedYear = ref("All");
const years = ref([]);

</script>

<template>
    <Toolbar class="mb-5">
        <template #start>
            <label for="name3" class="ml-5 mr-2"><b>Data periode:</b></label>
            <div class="">
                <Dropdown v-model="selectedYear" :options="years" class="w-100"></Dropdown>
            </div>
            <label for="name3" class="ml-5 mr-2"><b>Status:</b></label>
            <Dropdown v-model="selectedStatus" :options="status" placeholder="Select status" class="w-100 mr-1"></Dropdown>
        </template>

        <template #center>
        </template>

        <template #end></template>
    </Toolbar>
    <div class="grid">
        <div class="col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12">
            <newChart :status="selectedStatus" :year="selectedYear" />
        </div>
        <div class="col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12">
            <newList :status="selectedStatus" :year="selectedYear" />
        </div>
        <ScrollTop />
        <!-- <div class="col-12 sm:col-12 md:col-6 lg:col-4 xl:col-4">
            <History />
        </div> -->
    </div>

</template>
