<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const products = ref(null);
const fetching = async () =>{
    const response = await axiosManagement.get('/project/chart/revenue',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;
    // console.log(products.value);
}

onMounted( () => {
    fetching();
});

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

// data formulas
const margin = (revenue, cost) =>{
    var percent = 0;

    var totalMargin = revenue - cost;
    if(totalMargin > 0){
        percent = (totalMargin / revenue) * 100;
    }

    return Math.round(percent);
}
    
</script>

<template>
    <div class="card">
        
        <DataTable
            :value="products"
            dataKey="title"
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
            <Column header="#" style="min-width: 10px">
                <template #body="slotProps">
                    <small>{{ slotProps.index + 1 }}</small>
                </template>
            </Column>
            <Column field="title" header="Project" style="min-width: 50px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Project</small></span>
                    <small>{{ slotProps.data.title }}</small>
                </template>
            </Column>
            <Column field="dataRaw.po_value" header="Nilai PO" style="min-width: 100px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Nilai PO</small></span>
                    <small>{{ formatCurrency(slotProps.data.dataRaw.po_value) }}</small>
                </template>
            </Column>
            <Column field="dataRaw.revenue" header="Revenue" style="min-width: 100px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Revenue</small></span>
                    <small>{{ formatCurrency(slotProps.data.dataRaw.revenue) }}</small>
                </template>
            </Column>
            <Column field="dataRaw.af_total" header="Cost" style="min-width: 100px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Cost</small></span>
                    <small>{{ formatCurrency(slotProps.data.dataRaw.af_total) }}</small>
                </template>
            </Column>
            <Column field="margin" header="Margin" style="min-width: 10px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Margin</small></span>
                    <small>{{ margin(slotProps.data.dataRaw.revenue, slotProps.data.dataRaw.af_total) }}%</small>
                </template>
            </Column>
            <Column field="status.total_po" header="Total PO" style="min-width: 10px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Total PO</small></span>
                    <small>{{ slotProps.data.dataRaw.status.total_po }}</small>
                </template>
            </Column>
            <Column field="status.Open" header="Open PO" style="min-width: 10px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Open PO</small></span>
                    <small v-if="slotProps.data.dataRaw.status.Open" >{{ slotProps.data.dataRaw.status.Open }}</small>
                    <small v-else>0</small>
                </template>
            </Column>
            <Column field="status.Close" header="Close PO" style="min-width: 10px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Close PO</small></span>
                    <small v-if="slotProps.data.dataRaw.status.Close" >{{ slotProps.data.dataRaw.status.Close }}</small>
                    <small v-else>0</small>
                </template>
            </Column>
        </DataTable>
        
    </div>
</template>