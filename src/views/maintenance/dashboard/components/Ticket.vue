
<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, defineProps } from 'vue';
import { useToast } from 'primevue/usetoast';
import Carousel from 'primevue/carousel';
import { axiosMaintenance } from '../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('user_id'),
    token: localStorage.getItem('token'),
});

// props
const props = defineProps(['code','ticket']);

const toast = useToast();

const products = ref(null);
const product = ref({});


const fetching = async() =>{
    // products
    const response = await axiosMaintenance.get('/workorders/detail/'+props.code);
    products.value = response.data.metadata.ticket;
}

// getting data
onMounted(async () => {
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

// // create data
// const create = async () => {
//     const payload = local.value;
//     // const response = await axiosProject.post('/project/summary/revenue',payload);
//     fetching();
//     toast.add({ severity: 'success', summary: 'Successful', detail: 'Data created', life: 5000 });
// };

// // edit data
// const onCellEditComplete = async (event) => {
//     product.value = event.newData;

//     product.value.token = local.value.token;
//     product.value.user_id = local.value.user_id;

//     const data = product.value;
//     const response = await axiosMaintenance.put('/workorders',data);
//     product.value = {};
//     fetching();
//     toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

// };

// // deleting
// const selectedProduct = ref(null);
// const deleteSelectedDialog = ref(false);

// const confirmDeleteSelected = () => {
//     deleteSelectedDialog.value = true;
// };
// const deleteSelectedProducts = async () => {
//     product.value = products.value.filter((val) => selectedProduct.value.includes(val));
//     const data = product.value;
//     const response = await axiosMaintenance.delete('/workorders',{data: {data},
//         params: local.value
//     });
//     if(response.data.status == 200){
//         deleteSelectedDialog.value = false;
//         selectedProduct.value = null;
//         fetching();
//         product.value = {}; 
//         toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 5000 });

//     }  
// };


</script>

<template>
    <div class="mb-2">
        <DataTable 
            :value="products" 
            editMode="cell" 
            tableStyle="min-width: 50rem"
            resizableColumns 
            columnResizeMode="fit" 
            removableSort
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <h6>{{ props.ticket }}</h6>
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <!-- <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." class="mr-2" /> -->
                    </span>
                </div>
            </template>
            <Column field="date_taken" header="Date" sortable ></Column>
            <Column field="message" header="Caption" sortable ></Column>
            <Column field="value" header="Photo" sortable >
                <template #body="slotProps">
                    <Image v-if="slotProps.data.value" :src="slotProps.data.value" :alt="slotProps.data.value" width="55" preview />
                </template>
            </Column>
        </DataTable>
    </div>

</template>