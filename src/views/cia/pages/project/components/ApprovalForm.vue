<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import { axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/approvalForm',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.response;
    // console.log(products.value)
}
onMounted( () => {
    fetching();
});

const selectedProduct = ref();

const onSelectionChange = (event) =>{
    window.open(selectedProduct.value.url);
}

// dialog
const dialog = ref(false);
const openDialog = () => {
    dialog.value = true;
    setAll();
};
const productAll = ref(null);
const setAll = async (day) =>{
    const response = await axiosManagement.get('/project/approvalForm',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    productAll.value = response.data.response;
}

</script>

<template>
    <div class="card">
        <div class="grid">
            <div class="flex col-6" >
                <h5 class="text-sm">new page</h5>
            </div>
            <div class="flex justify-content-end col-6" >
                <!-- <Button @click="openDialog" label="View All" severity="info" size="small" text /> -->
            </div> 
        </div>
        

        <Dialog 
            v-model:visible="dialog" 
            maximizable 
            :modal="true" 
            header="View All" 
            :style="{ width: '50rem' }" 
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        >
            
        </Dialog>
        
    </div>
</template>