<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// config
const handleEnterKey = (event) =>{
    // Prevents Enter key from submitting the form and instead adds a new line
    event.stopPropagation();
};

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// define
const props = defineProps(['code', 'completed']); 
watch(() => props.completed, async (newValue, oldValue) => {
    fetching();  
});

// data
const products = ref(null);
const customers = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects/'+props.code,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data;

    const responseCustomer = await axiosProject.get('/v2/projects/customer',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    customers.value = responseCustomer.data;
}

onMounted(() => {
    fetching();
});

// edit data
const emit = defineEmits(['completeTodo']);
const product = ref({});
const onCellEditComplete = async (event) => {
    product.value = event.newData;
    product.value.date = formatDate(product.value.date);
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;

    const response = await axiosProject.put('/v2/projects/'+product.value.code,product.value);
    if(response.data.status == 200){
        fetching();
        product.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated', life: 3000 });
        
        let date = new Date();
        emit('completeTodo', date);
    }
};

// formating data
const formatDate = (date) => {
    if(date === null){
        return null;
    }

    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const formatCurrency = (value) => {
    return value?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

</script>

<template>
    <Toast />
    <DataTable 
        :value="products"
        dataKey="code"
        editMode="cell" 
        @cell-edit-complete="onCellEditComplete"
        tableClass="editable-cells-table"
        class="p-fluid"
    >
        <Column field="po_number" header="PO Number" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>PO Number</small></span>
                <small>{{ slotProps.data.po_number }}</small>
            </template>
        </Column>
        <Column field="name" header="Project's name" headerStyle="width: 20%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Project's name</small></span>
                <small>{{ slotProps.data.name }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="type" header="Project's type" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Project's type</small></span>
                <small>{{ slotProps.data.type }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="customer" header="Customer" headerStyle="width: 15%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Customer</small></span>
                <small>{{ slotProps.data.customer }}</small>
            </template>
            <template #editor="{ data, field }">
                <Dropdown v-model="data['project']" :options="customers" optionLabel="code" >
                    <template #option="slotProps">
                        <div class="flex items-center">
                            <span>{{ slotProps.option.code }}, {{ slotProps.option.label }}</span>
                        </div>
                    </template>
                </Dropdown>
            </template>
        </Column>
        <Column field="ref" header="Assign ref" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Assign ref</small></span>
                <small>{{ slotProps.data.ref }}</small>
            </template>
            <template #editor="{ data, field }">
                <Textarea v-model="data[field]" rows="5" @keydown.enter="handleEnterKey" />
            </template>
        </Column>
        <Column field="date" header="Assign date" headerStyle="width: 10%" >
            <template #body="slotProps">
                <span class="p-column-title text-xs"><small>Assign date</small></span>
                <small>{{ slotProps.data.date }}</small>
            </template>
            <template #editor="{ data, field }">
                <Calendar v-model="data[field]" :selectOtherMonths="true" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" ></Calendar>
            </template>
        </Column>
    </DataTable>
</template>
