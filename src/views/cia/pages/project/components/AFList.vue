<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, defineProps } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast';

import { axiosManagement } from '../../../../../service/axios';

const toast = useToast();

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// props
const props = defineProps(['params']);
onMounted(() => {
    fetching();
});

const products = ref(null);
const link = ref({});
const fetching = async () =>{
    const response = await axiosManagement.get('/project/af/po',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
            no_document: props.params.po_number,
        }
    });
    products.value = response.data.list;
    link.value = response.data.backend_af;
}

// formating
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

</script>

<template>
    
    <DataTable 
        :value="products" 
        dataKey="id"
        :paginator="true" 
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        responsiveLayout="scroll"
        removableSort
        sortMode="single"
        scrollable scrollHeight="650px"
    >
        <Column header="#" style="width: 2%">
            <template #body="slotProps">
                <small>{{ slotProps.index + 1 }}</small>
            </template>
        </Column>
        <Column field="date" header="Date" :sortable="true" style="width: 5%"></Column>
        <Column field="price" header="Price" :sortable="true" style="width: 10%">
            <template #body="slotProps">
                <small>{{ formatCurrency(slotProps.data.price) }}</small>
            </template>
        </Column>
        <Column field="qty" header="Qty" :sortable="true" style="width: 2%"></Column>
        <Column field="remarks" header="Remarks" :sortable="true" style="width: 30%"></Column>
        <Column header="" headerStyle="width:20rem" :sortable="true"  style="width: 5%" >
            <template #body="slotProps">
                <a :href="link+'/api/af/approval/pdf/'+slotProps.data.id+'?token='+local.token" target="_blank">
                    <Button icon="pi pi-file-pdf"  class="p-button-rounded p-button-danger mr-2" title="Preview" />
                </a>
            </template>
        </Column>
    </DataTable>

</template>

<style lang="scss" scoped>
</style>

