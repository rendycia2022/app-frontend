<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement, axiosProject } from '../../../../service/axios';
import History from './components/History.vue';

// components


const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

// data
const products = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/list',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.list;
}
onMounted( () => {
    fetching();
});

// filter
const filters = ref({});
onBeforeMount(() => {
    initFilters();
});
const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

</script>

<template>
    <div class="grid">
        <div class="col-8">
            <span>Content test</span>
        </div>
        <div class="col-4">
            <History />
        </div>
        
    </div>
</template>

<style lang="scss" scoped>
</style>
