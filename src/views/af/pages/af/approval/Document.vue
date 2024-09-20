<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount, computed, readonly  } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { axiosAf } from '../../../../../service/axios';
import { useRouter } from 'vue-router';

// screen
const display = ref({
    height: screen.height+'px',
});

// utilities
const toast = useToast();
const router = useRouter();

// load
onBeforeMount(() => {
    initFilters();
    getHeader();
});

// filter
const filters = ref({});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// local data
const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
    access_id: localStorage.getItem('access_id'),
    document_id: (new URL(window.location.href)).pathname.split('/')[3],
    division_code: localStorage.getItem('division_code'),
});

// getting data
onMounted( () => {
    fetch();
});
const payload = ref({});

const fetch = () =>{
    getType();
    getCompany();
    getBank();
    getFinancial();
    getItems();
    getDivisions();
}

// types
const types = ref(null);
const getType = async() =>{
    const response = await axiosAf.get('/af/types',{ 
        params: local.value
    });
    types.value = response.data.metadata.list;
}

// companies
const companies = ref(null);
const getCompany = async() =>{
    const response = await axiosAf.get('/public/hr/company',{ 
        params: local.value
    });
    companies.value = response.data.metadata.list;
}

// header
const header = ref({});
const getHeader = async() =>{
    const response = await axiosAf.get('/af/approval/document/header/id',{ 
        params: local.value
    });
    if(response.data.metadata.list){
        header.value = response.data.metadata.list[0];        
        toast.add({ severity: 'info', summary: 'Information', detail: "Document's ready.", life: 5000 });
    }else{
        router.push({path: '/af/approval/'})
    };
    
}

const divisions = ref(null);
const getDivisions = async() =>{
    const response = await axiosAf.get('/af/divisions/'+local.value.division_code,{ 
        params: local.value
    });
    divisions.value = response.data.metadata.list;
}

// bank account
const bank = ref({});
const bankAccounts = ref([]);
const searchBankAccount = async(event) => {
    payload.value = local.value;
    payload.value.query = event.query.trim();
    const response = await axiosAf.get('/af/banks/search',{
        params: payload.value
    });
    if(response.status == 200){
        bankAccounts.value = response.data.metadata.list;
        payload.value = {};
    }
}
const handleBanksSelected = async (item) => {
    bank.value = item.value;
    bank.value.display = "";
}

const getBank = async() =>{
    const response = await axiosAf.get('/af/approval/document/bank',{ 
        params: local.value
    });
    if(response.data.status == 200){
        bank.value = response.data.metadata;
    }
}

// item builder
const items = ref([]);

const getItems = async() =>{
    const response = await axiosAf.get('/af/approval/document/items',{ 
        params: local.value
    });
    if(response.data.status == 200){
        items.value = response.data.metadata.list;
    }
}

const item = ref({});
const itemDialog = ref(false);
const submittedItem = ref(false);

const costType = ref(null);
const getCostType = async() =>{
    const response = await axiosAf.get('/af/costtype',{ 
        params: local.value
    });
    costType.value = response.data.metadata.list;
}

const costEntertain = ref(false);
watch(() => item.value.cost_type, async (newValue, oldValue) => {
    if(newValue){
        if(newValue.id == '75955ebc-6d79-4297-bfb0-5b321207a2ed'){
            costEntertain.value = true;
        }else{
            costEntertain.value = false;
        }
    }else{
        costEntertain.value = false;
    }
    
})



const projects = ref(null);
const getProjects = async() =>{
    const response = await axiosAf.get('/af/project/division/'+local.value.division_code,{ 
        params: local.value
    });
    projects.value = response.data.metadata.list;
}
onMounted( () => {
    getProjects();
});

const openNew = () => {
    item.value = {};
    submittedItem.value = false;
    itemDialog.value = true;
    getCostType()
};

const hideDialog = () => {
    itemDialog.value = false;
    submittedItem.value = false;
};

const saveItem = async () => {
    submittedItem.value = true;
    if (item.value.date && item.value.purchase_order.trim() && item.value.project && item.value.cost_type && item.value.qty && item.value.price) {
        
        item.value.date = formatDate(item.value.date);
        
        payload.value.token = local.value.token;
        payload.value.user_id = local.value.user_id;
        payload.value.document_id = local.value.document_id;

        payload.value.value = item.value;
        const data = payload.value;
        const response = await axiosAf.post('/af/approval/document/items',data);
        if(response.data.status == 200){
            itemDialog.value = false;
            item.value = {};
            submittedItem.value = false;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Item created.', life: 3000 });
            getItems()
            payload.value = {};
        }

        
    }
};

const deleteItemDialog = ref(false);
const confirmDeleteItem = (editItem) => {
    item.value = editItem;
    deleteItemDialog.value = true;
};
const deleteItem = async() => {
    const data = item.value;
    const response = await axiosAf.delete('/af/approval/document/items',{data: {data},
        params: local.value
    });
    if(response.data.status == 200){
        deleteItemDialog.value = false;
        item.value = {};
        toast.add({ severity: 'error', summary: 'Warning!', detail: 'Item Deleted', life: 3000 });
        getItems();
    }
    
};

const itemTotal = computed(() => {
    let total = 0;
    if(items.value){
        for (let i = 0; i < items.value.length; i++) {
            let subtotal = items.value[i].qty * items.value[i].price;
            total = total + subtotal;
        }
    }
    financial.value.requisition_amount = total;
    return formatCurrency(total);
});

// financial
const financial = ref({});

const getFinancial = async() =>{
    const response = await axiosAf.get('/af/approval/document/financial',{ 
        params: local.value
    });
    if(response.data.status == 200){
        financial.value = response.data.metadata;

    }
}

const requisition_balance = computed(() => {
    let total = 0;
    if(financial.value.actual_balance > 0 && financial.value.requisition_amount > 0){
        total = financial.value.actual_balance - financial.value.requisition_amount;
    }
    
    return formatCurrency(total);
});

// sign start
const sign = ref({});
onMounted( () => {
    getExecutives();
    getApproves();
    getfinances();
    getSign();
});

// executive
const executives = ref(null);
const getExecutives = async() =>{
    const response = await axiosAf.get('/af/approval/document/sign/1',{ 
        params: local.value
    });
    executives.value = response.data.metadata.list;
}

// approves
const approves = ref(null);
const getApproves = async() =>{
    const response = await axiosAf.get('/af/approval/document/sign/3',{ 
        params: local.value
    });
    approves.value = response.data.metadata.list;
}

// finances
const finances = ref(null);
const getfinances = async() =>{
    const response = await axiosAf.get('/af/approval/document/sign/2',{ 
        params: local.value
    });
    finances.value = response.data.metadata.list;
}

const getSign = async() =>{
    const response = await axiosAf.get('/af/approval/document/sign',{ 
        params: local.value
    });
    if(response.data.status == 200){
        sign.value = response.data.metadata;

    }
}

// sign end

// submit
const submitDialog = ref(false);
const confirmSubmit = () => {
    submitDialog.value = true;
};
const submit = async () =>{
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.document_id = local.value.document_id;
    payload.value.header = header.value;
    payload.value.bank = bank.value;

    const data = payload.value;
    const response = await axiosAf.post('/af/approval/document',data);
    if(response.data.status == 200){
        submitDialog.value = false;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Document submited.', life: 5000 });
        payload.value = {};
        router.push({path: '/af/approval/'})
    }
}

// saving start
// header
watch(() => header.value, async (newValue, oldValue) => {
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.document_id = local.value.document_id;

    if(newValue.date){
        newValue.date = formatDate(newValue.date);
    }
    payload.value.value = newValue;
    const data = payload.value;
    const response = await axiosAf.put('/af/approval/document/header',data);
    if(response.data.status == 200){
        payload.value = {};
    }
},{ deep: true });

// bank
watch(() => bank.value, async (newValue, oldValue) => {
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.document_id = local.value.document_id;

    payload.value.value = newValue;
    const data = payload.value;
    const response = await axiosAf.post('/af/approval/document/bank',data);
    if(response.data.status == 200){
        payload.value = {};
    }
},{ deep: true });

// financial
watch(() => financial.value, async (newValue, oldValue) => {
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.document_id = local.value.document_id;

    payload.value.value = newValue;
    const data = payload.value;
    const response = await axiosAf.post('/af/approval/document/financial',data);
    if(response.data.status == 200){ 
        payload.value = {};
    }
},{ deep: true });

// sign
watch(() => sign.value, async (newValue, oldValue) => {
    payload.value.token = local.value.token;
    payload.value.user_id = local.value.user_id;
    payload.value.document_id = local.value.document_id;

    payload.value.value = newValue;
    const data = payload.value;
    const response = await axiosAf.post('/af/approval/document/sign',data);
    if(response.data.status == 200){
        payload.value = {};
    }
},{ deep: true });

// saving end

// formating
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

const formatNumber = (value) => {
    return value?.toLocaleString('id-ID');
};

</script>

<template>
    <Toolbar class="mb-4">
        <template v-slot:start>
            <router-link to="/af/approval">
                <Button label="Back" text icon="pi pi-angle-left" class="p-button-info" />
            </router-link>
            
        </template>
        <template #center>
            <h4>Approval Form</h4>
        </template>
        <template v-slot:end>
            <Button
                icon="pi pi-send"
                severity="success" 
                label="Submit" 
                raised
                @click="confirmSubmit"
                :disabled="!header.id || !header.type || !header.date"
            />
        </template>
    </Toolbar>

    <div class="card">
        <div class="field col-12 sm:col-12 md:col-4 lg:col-4 xl:col-4" hidden>
            <span class="p-float-label">
                <InputText id="id" v-model="header.id" class="w-full" readonly />
                <label for="id" >ID:</label>
            </span>
        </div>
        <Fieldset legend="Document Type" class="mt-2">
            <div class="field col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12" >
                <div class="p-float-label">
                    <Dropdown id="document_type" v-model="header.type" :options="types" optionLabel="name" placeholder="Select Document Type" class="w-full" />
                </div>
            </div>
        </Fieldset>
        
        <div class="grid mt-3">
            <div class="field col-12 sm:col-12 md:col-4 lg:col-4 xl:col-4" >
                <div class="p-float-label">
                    <Dropdown id="company" v-model="header.company" :options="companies" optionLabel="name" placeholder="Select Company" class="w-full" />
                    <label for="company" >Company:</label>
                </div>
            </div>
            <div class="field col-12 sm:col-12 md:col-4 lg:col-4 xl:col-4">
                <span class="p-float-label">
                    <Dropdown v-model="header.division" :options="divisions" optionLabel="name" placeholder="Select a divisions" class="w-full " />
                    <label for="division" >Division:</label>
                </span>
            </div>
            <div class="field col-12 sm:col-12 md:col-4 lg:col-4 xl:col-4">
                <span class="p-float-label">
                    <Calendar id="date" v-model="header.date" :selectOtherMonths="true" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" class="w-full" ></Calendar>
                    <label for="date">Date:</label>
                </span>
            </div>
        </div>

        <Fieldset legend="Bank" class="mt-2">
            <div>
                <div class="p-fluid">
                    <span class="p-float-label">
                        <AutoComplete 
                            id="bank_display" 
                            v-model.trim="bank.display" 
                            @item-select="handleBanksSelected" 
                            optionLabel="display" 
                            :suggestions="bankAccounts"
                            @complete="searchBankAccount" 
                            class="w-full"
                            style="max-width: 30rem;"  
                        />
                        <label for="bank_display">Searching...</label>
                    </span>
                </div>
            </div>
            <div class="field mt-5">
                <label for="bank_account" >Account Name:</label>
                <InputText id="bank_account" v-model="bank.account" class="w-full" :style="{ textTransform: 'uppercase' }" />
            </div>
            <div class="field mt-5">
                <label for="bank_rekening" >No. Rekening:</label>
                <InputText id="bank_rekening" v-model="bank.rekening" class="w-full" />
            </div>
            <div class="field mt-5">
                <label for="bank_name" >Bank Name</label>
                <InputText id="bank_name" v-model="bank.name" class="w-full" />
            </div>
        </Fieldset>

        <DataTable 
            v-model="items"
            :value="items"
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="5"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            class="mt-5"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justcollapseAllify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <Button icon="pi pi-plus" severity="success" rounded aria-label="New" title="New" @click="openNew" />
                    </div>
                </div>
            </template>
            <Column header="#" headerStyle="width:3rem">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>
            <Column field="date" header="Date" headerStyle="width:5rem">
                <template #body="slotProps">
                    {{ slotProps.data.date }}
                </template>
            </Column>
            <Column field="remarks" header="Remarks" headerStyle="width:30rem" >
                <template #body="slotProps">
                    <p v-html="slotProps.data.remarksDisplay"></p>
                </template>
            </Column>
            <Column field="entertainDisplay" header="Entertain" headerStyle="width:5rem">
                <template #body="slotProps">
                    {{ slotProps.data.entertainDisplay }}
                </template>
            </Column>
            <Column field="qty" header="Qty" headerStyle="width:5rem">
                <template #body="slotProps">
                    {{ formatNumber(slotProps.data.qty) }}
                </template>
            </Column>
            <Column field="price" header="Price" headerStyle="width:20rem" >
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
            </Column>
            <Column field="total_price" header="Total" headerStyle="width:30rem">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.qty * slotProps.data.price) }}
                </template>
            </Column>
            <Column headerStyle="min-width:5rem;">
                <template #body="slotProps">
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteItem(slotProps.data)" />
                </template>
            </Column>
            <ColumnGroup type="footer">
                <Row>
                    <Column footer="Grand Total:" :colspan="6" footerStyle="text-align:right"/>
                    <Column :footer="itemTotal" />
                    <!-- <Column footer="" /> -->
                </Row>
            </ColumnGroup>
        </DataTable>
        
        <Fieldset legend="Financial Bugdet v.s Actual" class="mt-5">
            <div class="field">
                <label for="financial_budget" >Budget Periode:</label>
                <InputText id="financial_budget" v-model="financial.periode" class="w-full" />
            </div>
            <Panel header="Actual Month:">
                <div class="field">
                    <label for="actual_balance">Balance: (IDR)</label>
                    <InputNumber id="actual_balance" v-model="financial.actual_balance" inputId="minmax" :min="0" class="w-full" />
                </div>
            </Panel>
            <Panel header="Requisition" class="mt-4">
                <div class="field">
                    <label for="requisition_amount">Amount: (IDR)</label>
                    <InputNumber id="actual_balance" v-model="financial.requisition_amount" inputId="minmax" :min="0" class="w-full" readonly />
                </div>
                <div class="field">
                    <label for="requisition_balance">Balance: (IDR)</label>
                    <InputText id="requisition_balance" v-model="requisition_balance" class="w-full" readonly />
                </div>
            </Panel>
        </Fieldset>

        <Fieldset legend="Approval" class="mt-5">
            <div class="p-float-label mt-4">
                <Dropdown id="Director" v-model="sign.executive" :options="executives" optionLabel="user_name" placeholder="Select Director" class="w-full" />
                <label for="Director" >Director:</label>
            </div>
            <div class="p-float-label mt-5">
                <Dropdown id="Division" v-model="sign.approved" :options="approves" optionLabel="user_name" placeholder="Select Head" class="w-full" />
                <label for="Division" >Division:</label>
            </div>
            <div class="p-float-label mt-5">
                <Dropdown id="Finance" v-model="sign.finance" :options="finances" optionLabel="user_name" placeholder="Select Finance" class="w-full" />
                <label for="Finance" >Finance:</label>
            </div>
        </Fieldset>

    </div>
    

    <Dialog v-model:visible="itemDialog" :style="{ width: '720px' }" header="New Item" :modal="true" class="p-fluid">
        <div class="field">
            <label for="po_number">*Purchase Order Number:</label>
            <InputText id="po_number" v-model.trim="item.purchase_order" required="true" autofocus :class="{ 'p-invalid': submittedItem && !item.purchase_order }" />
            <small class="p-invalid" v-if="submittedItem && !item.purchase_order">Purchase Order Number is required.</small>
        </div>
        <div class="field">
            <label for="item_date">Date:</label>
            <Calendar id="item_date" v-model="item.date" :selectOtherMonths="true" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" class="w-full" required="true" autofocus :class="{ 'p-invalid': submittedItem && !item.date }" ></Calendar>
            <small class="p-invalid" v-if="submittedItem && !item.date">Date item is required.</small>
        </div>
        <div class="field">
            <label for="project">Project:</label>
            <Dropdown id="project" v-model="item.project" :options="projects" optionLabel="name" required="true" placeholder="Select a project" class="w-full" :class="{ 'p-invalid': submittedItem && !item.project }" />
            <small class="p-invalid" v-if="submittedItem && !item.project">Project is required.</small>
        </div>
        <div class="field">
            <label for="overhead">Overhead:</label>
            <Dropdown id="overhead" v-model="item.cost_type" :options="costType" required="true" optionLabel="label" placeholder="Select Overhead" class="w-full" :class="{ 'p-invalid': submittedItem && !item.cost_type }" />
            <small class="p-invalid" v-if="submittedItem && !item.cost_type">Overhead is required.</small>
        </div>

        <Fieldset v-if="costEntertain == true" legend="Entertain" class="mt-2">
            <div class="field">
                <label for="person">Name:</label>
                <InputText id="person" v-model="item.person" placeholder="Name of person entertained" required="true" autofocus :class="{ 'p-invalid': submittedItem && !item.person }" />
                <small class="p-invalid" v-if="submittedItem && !item.person">Name is required.</small>
            </div>
            <div class="field">
                <label for="company">Company:</label>
                <InputText id="company" v-model="item.company" placeholder="Company of person entertained" required="true" autofocus :class="{ 'p-invalid': submittedItem && !item.company }" />
                <small class="p-invalid" v-if="submittedItem && !item.company">Company is required.</small>
            </div>
        </Fieldset>

        <div class="field">
            <label for="remarks">Remarks:</label>
            <Textarea id="remarks" v-model="item.remarks" required="true" rows="5" cols="30" :class="{ 'p-invalid': submittedItem && !item.remarks }" />
            <small class="p-invalid" v-if="submittedItem && !item.remarks">Purchase Order Number is required.</small>
        </div>

        <Fieldset legend="Cost" class="mt-2">
            <div class="field">
                <label for="cost_qty" >Qty:</label>
                <InputNumber id="cost_qty" v-model="item.qty" required="true" inputId="minmax" :min="0" autofocus :class="{ 'p-invalid': submittedItem && !item.qty }" />
                <small class="p-invalid" v-if="submittedItem && !item.qty">Qty is required.</small>
            </div>
            <div class="field">
                <label for="cost_price" >Price: (IDR)</label>
                <InputNumber id="cost_price" v-model="item.price" required="true" inputId="minmax" :min="0" autofocus :class="{ 'p-invalid': submittedItem && !item.price }" />
                <small class="p-invalid" v-if="submittedItem && !item.price">Qty is required.</small>
            </div>
        </Fieldset>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveItem" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteItemDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="item"
                >Are you sure you want to delete <b>{{ item.remarks }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteItemDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteItem" />
        </template>
    </Dialog>

    <Dialog v-model:visible="submitDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <span v-if="item"
                >Are you sure you want to <b class="text-green-500">submit</b>?</span
            >
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-danger" @click="submitDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-success" @click="submit" />
        </template>
    </Dialog>
</template>