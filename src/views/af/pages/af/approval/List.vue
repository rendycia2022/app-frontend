<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { axiosAf } from '../../../../../service/axios';
import Data from './Data.vue';

//utilities
const router = useRouter();
const toast = useToast();
const display = ref({
    height: (screen.height*0.9)+'px',
});

// local data
const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    access_id: localStorage.getItem('access_id'),
});

// create document
const payload = ref({});
const createDocument = async () =>{
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    const data = payload.value;
    const response = await axiosAf.post('/af/approval/document/header',data);
    if(response.status == 200){
        if(response.data.status == 200){
            payload.value = {};
            const id = response.data.metadata.id;
            router.push({path: '/af/approval/'+id})
        }else{
            toast.add({ severity: 'error', summary: 'Warning!', detail: 'Failed to create document.', life: 5000 });
        }    
    }else{
        toast.add({ severity: 'error', summary: 'Warning!', detail: response.status+'-'+response.statusText, life: 5000 });
    }
    payload.value = {};
}

</script>

<template>
    <Toast />
    <Toolbar class="mb-4">
        <template v-slot:start>
            <router-link to="/af/dashboard" class="mr-2">
                <Button label="Back" text icon="pi pi-angle-left" class="p-button-info" />
            </router-link>
        </template>
        <template #center>
            <h4>Approval Form</h4>
        </template>
        <template v-slot:end>
            <Button v-if="local.access_id <= 1" label="New" icon="pi pi-plus" class="p-button-success" @click="createDocument" />
        </template>
    </Toolbar>

    <Data menuType="1" sortList="created_at" />
</template>
