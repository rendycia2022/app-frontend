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
    // console.log(response.data);
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

// grouping
const expandedRowGroups = ref();
const getSeverity = (status) => {
    switch (status) {
         case 'Close':
            return 'success';
        case 'Open':
            return 'warning';

    }
};

const calculateTotalQty = (name) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                total++;

            }
        }
    }

    return total;
};

const calculateTotalQtyStatus = (name, meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                if(product.status == meta){
                    total++;
                }
            }
        }
    }

    return total;
};

const calculateTotal = (name, meta) => {
    let total = 0;
    if (products.value) {
        for (let product of products.value) {
            if (product.representative.cust_init === name) {
                
                total = total + product[meta];

            }
        }
    }

    return total;
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

// data formulas
const margin = (revenue, cost) =>{
    var percent = 0;

    var totalMargin = revenue - cost;
    if(totalMargin > 0){
        percent = (totalMargin / revenue) * 100;
    }

    return Math.round(percent);
}

// edit data
const onCellEditComplete = async (event) => {
    let { data, newValue, field } = event;
    data[field] = newValue;
    data['token'] = local.value.token;
    data['user_id'] = local.value.user_id;
    const response = await axiosManagement.post('/project/list/remarks', data);
    if(response.data.status == 200){
        fetching();  
    }   
};

const handleEnterKey = (event) =>{
    // Prevents Enter key from submitting the form and instead adds a new line
    event.stopPropagation();
};

</script>

<template>
    
    <div class="card">
        <DataTable
            v-model:expandedRowGroups="expandedRowGroups" 
            :value="products" 
            tableStyle="min-width: 50rem"
            expandableRowGroups rowGroupMode="subheader" groupRowsBy="representative.cust_init"
            sortMode="single" sortField="representative.cust_init" :sortOrder="1"
            scrollable scrollHeight="720px"
            :filters="filters"
            removableSort
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <template #groupheader="slotProps">
                <span class="align-middle ml-2 font-bold leading-normal">
                    <small>{{ slotProps.data.representative.cust_init }}, 
                        Total Nilai PO: {{ formatCurrency(calculateTotal(slotProps.data.representative.cust_init, 'po_value')) }}
                        | Total Revenue: {{ formatCurrency(calculateTotal(slotProps.data.representative.cust_init, 'revenue')) }}
                        | Total Cost: {{ formatCurrency(calculateTotal(slotProps.data.representative.cust_init, 'af_total')) }}
                        | Margin: {{ margin(calculateTotal(slotProps.data.representative.cust_init, 'revenue'), calculateTotal(slotProps.data.representative.cust_init, 'af_total')) }}%
                        | Total PO: {{ calculateTotalQty(slotProps.data.representative.cust_init) }}
                        | Open: {{ calculateTotalQtyStatus(slotProps.data.representative.cust_init, 'Open') }}
                        | Close: {{ calculateTotalQtyStatus(slotProps.data.representative.cust_init, 'Close') }}
                    </small>
                </span>
            </template>
            <Column field="representative.cust_init" header="Customer" :sortable="true" headerStyle="width:20%; min-width:20rem;">
            </Column>
            <Column field="po_date" header="Date" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Date</small></span>
                    <span>{{ slotProps.data.po_date }}</span>
                </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" headerStyle="width:10%; min-width:8rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Status</small></span>
                    <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column field="remarks" header="Remarks" style="min-width: 200px" :sortable="true" >
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Remarks</small></span>
                    <Textarea v-model="slotProps.data.remarks" rows="1" cols="30" readonly />
                </template>
                <template #editor="{ data, field }">
                    <Textarea v-model="data[field]" @keydown.enter="handleEnterKey" rows="5" cols="30" placeholder="Remarks..." />
                </template>
            </Column>
            <Column field="no_document" header="Purchase Order" :sortable="true" headerStyle="width:20%; min-width:20rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Purchase Order</small></span>
                    <span>{{ slotProps.data.no_document }}</span>
                </template>
            </Column>
            <Column field="po_value" header="Nilai PO" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Nilai PO</small></span>
                    <small>{{ formatCurrency(slotProps.data.po_value) }}</small>
                </template>
            </Column>
            <Column field="revenue" header="Invoice" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Invoice</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue) }}</small>
                </template>
            </Column>
            <Column field="af_total" header="Total Cost" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Total Cost</small></span>
                    <small>{{ formatCurrency(slotProps.data.af_total) }}</small>
                </template>
            </Column>
            <Column field="resources" header="Resources" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Resources</small></span>
                    <small></small>
                </template>
            </Column>
            <Column field="indirect" header="Indirect" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Indirect</small></span>
                    <small></small>
                </template>
            </Column>
            <Column field="cogs" header="COGS" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs" ><small>COGS</small></span>
                    <small>{{ formatCurrency(slotProps.data.af_total) }}</small>
                </template>
            </Column>
            <Column field="margin" header="Margin" :sortable="true" headerStyle="width:20%; min-width:15rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>Margin</small></span>
                    <small>{{ formatCurrency(slotProps.data.revenue - slotProps.data.af_total) }}</small>
                </template>
            </Column>
            <Column field="margin_percent" header="% Margin" class="text-center" :sortable="true" headerStyle="width:10%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>% Margin</small></span>
                    <small>{{ margin(slotProps.data.revenue, slotProps.data.af_total) }}%</small>
                </template>
            </Column>
            <Column field="hpp_subcon" header="HPP Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Subcon (in %)</small></span>
                    <small></small>
                </template>
            </Column>
            <Column field="hpp_nonsubcon" header="HPP Non Subcon (in %)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                <template #body="slotProps">
                    <span class="p-column-title text-xs"><small>HPP Non Subcon (in %)</small></span>
                    <small></small>
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
