
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR } from '../../../service/axios';

const local = ref({
    userId: (new URL(window.location.href)).pathname.split('/')[3],
});

const toast = useToast();

const headers = ref(null);
const header = ref({});
const types = ref([]);

// getting product header's data
onMounted(async () => {
    // product's headers
    const headerData = await axiosHR.get('/development/products/header',{
    params:{
            user_id: local.value.userId,
        }
    });
    headers.value = headerData.data.metadata.result;

    // product's type header
    const typeData = await axiosHR.get('/development/products/header/type');
    types.value = typeData.data.metadata.type;
});

const columns = ref([
    { field: 'title', display:'title', header: 'Title' },
    { field: 'placeholder', display:'placeholder', header: 'Placeholder' },
    { field: 'type', display:'type_name', header: 'Type' }
]);

// Data builder
// create data
const create = async () => {
    const payload = local.value;
    const result = await axiosHR.post('/development/products/header',payload);
    headers.value = result.data.metadata.result;
};

// manipulate data
const onCellEditComplete = async (event) => {
    const payload = event.newData;
    const updateHeader = await axiosHR.put('/development/products/header',payload);
    header.value = updateHeader.data.metadata.result;
    headers.value[findIndexById(header.value.id)] = header.value;
    var date = new Date();
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated at '+date, life: 5000 });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < headers.value.length; i++) {
        if (headers.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

// delete data
const selectedHeaders = ref(null);
const deleteHeadersDialog = ref(false);

const confirmDeleteSelected = () => {
    deleteHeadersDialog.value = true;
};
const deleteSelectedProducts = async () => {
    header.value = headers.value.filter((val) => selectedHeaders.value.includes(val));
    const data = header.value;
    const result = await axiosHR.delete('/development/products/header',{data: {data},
        params:{
            user_id: local.value.userId,
        }
    });
    if(result.data.status == 200){
        headers.value = headers.value.filter((val) => !selectedHeaders.value.includes(val));
        deleteHeadersDialog.value = false;
        selectedHeaders.value = null;
    }   
    toast.add({ severity: result.data.metadata.message.severity, summary: result.data.metadata.message.summary, detail: result.data.metadata.message.detail, life: 5000 });
};

</script>

<template>
    <Toast />
    <Toolbar class="mb-4">
        <template v-slot:start>
            <div class="my-2">
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger mr-2" @click="confirmDeleteSelected" :disabled="!selectedHeaders || !selectedHeaders.length" />
                <Button label="New" icon="pi pi-plus" class="p-button-success " @click="create" />
            </div>
        </template>
    </Toolbar>
    <div class="card p-fluid">
        <DataTable 
            :value="headers"
            v-model:selection="selectedHeaders" 
            editMode="cell" 
            @cell-edit-complete="onCellEditComplete" 
            tableClass="editable-cells-table" 
            tableStyle="min-width: 50rem"
        >
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column v-for="col of columns" :key="col.field" :field="col.display" :header="col.header" style="width: 25%">
                <template v-if="col.field !=='index'" #editor="{ data, field }">
                    <template v-if="field !== 'index'">
                        <InputText v-model="data[field]" autofocus />
                    </template>
                </template>
                <template v-if="col.field == 'type'" #editor="{ data, field }">
                    <Dropdown v-model="data['type_options']['value']" :options="types" optionLabel="label" optionValue="value" placeholder="Select a Type">
                    </Dropdown>
                </template>
            </Column>
        </DataTable>
    </div>

    <!-- Delete selected dialog -->
    <Dialog v-model:visible="deleteHeadersDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="header">Are you sure you want to delete the selected products?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteHeadersDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped>
::v-deep(.editable-cells-table td.p-cell-editing) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>