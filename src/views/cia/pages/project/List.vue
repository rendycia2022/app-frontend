<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../service/axios';

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
}
onMounted( () => {
    fetching();
});

</script>

<template>
    
    <div class="card">
        List data
    </div>

</template>
