<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { axiosHR } from '../../../service/axios';

const toast = useToast();

const items = ref(null);
const filters = ref({});
const unlocked_date = ref(false);
const category = ref('General');

onBeforeMount(() => {
    initFilters();
});

// new plafon data for items in dashboard
onMounted(async () => {
    const result = await axiosHR.get('/setting/general',{
                params:{
                    token: localStorage.getItem('token'),
                    category: category.value,
                }
            });
    items.value = result.data.metadata.data;
    if(items.value.unlocked_date.value == 1){
        unlocked_date.value = true
    }
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const handle_unlocked_date = async () => {
    items.value.unlocked_date.value = unlocked_date.value;
    items.value.unlocked_date.category = category.value;
    items.value.unlocked_date.user_id = localStorage.getItem('id');
    const data = items.value.unlocked_date;
    const result = await axiosHR.put('/setting/general',data);
    if(result.status == 200){
        if(result.data.metadata.data.unlocked_date.value == 1){
            unlocked_date.value = true;
        }else{
            unlocked_date.value = false;
        }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data updated', life: 3000 });
    }else{
        toast.add({ severity: 'error', summary: 'Failed', detail: 'Update failed', life: 3000 });
    }
    
};

</script>

<template>
    <div class="card">
        <div>
            <h5>Date reimbursement detail</h5>
            <ToggleButton v-model="unlocked_date" @change="handle_unlocked_date" onLabel="Unlocked" offLabel="Locked" :style="{ width: '10em' }"  />
        </div>
    </div>
</template>
