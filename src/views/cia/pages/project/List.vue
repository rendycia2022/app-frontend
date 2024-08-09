<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosManagement } from '../../../../service/axios';

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
    console.log(response.data);
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

// formating data
const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatNumber = (value) => {
    return value?.toLocaleString('en-US');
};

// link
const seeMore = (detail) =>{
    const target = detail.revenue_link;
    window.open(target, '_blank').focus();
}

</script>

<template>
    
    <div class="card">
        <DataTable
            :value="products"
            dataKey="no_document"
            :filters="filters"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            responsiveLayout="scroll"
            size="small"
            scrollable scrollHeight="450px"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <h5 class="m-0">Project by Purchase Order</h5>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>

            <Column field="no_document" header="Purchase Order" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Purchase Order</small></span>
                    <span>
                        <Button severity="info" :label="slotProps.data.no_document" class="small-padding-button" @click="seeMore(slotProps.data)" rounded text size="small" />
                    </span>
                </template>
            </Column>
            <Column field="revenue_price" header="Price" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Price</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue_price) }}</small>
                </template>
            </Column>
            <Column 
                field="revenue_total" header="Expected Revenue"
                :sortable="true" headerStyle="width:14%; min-width:10rem;"
            >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Expected Revenue</small></span>
                    <small 
                    v-tooltip="'qty '+formatNumber(slotProps.data.revenue_qty)"
                    >{{ formatCurrency(slotProps.data.revenue_price * slotProps.data.revenue_qty) }}</small>
                </template>
            </Column>
            <Column field="af_total" header="Total AF" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Total AF</small></span>
                    <small>{{ formatCurrency(slotProps.data.af_total) }}</small>
                </template>
            </Column>
            <Column field="af_total" header="Progress" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Progress</small></span>
                    <small 
                    v-tooltip="'Workorders: '+formatNumber(slotProps.data.count_workorders)"
                    >{{ formatCurrency(slotProps.data.count_workorders * slotProps.data.revenue_price) }}</small>
                </template>
            </Column>
            
        </DataTable>
    </div>

</template>
<style lang="scss" scoped>
.small-padding-button {
    padding: 2px 4px !important; /* Sesuaikan nilai padding sesuai kebutuhan Anda */
}
</style>
