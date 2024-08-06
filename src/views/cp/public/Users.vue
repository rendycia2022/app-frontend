<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { axiosWDua } from '../../../service/axios';

// utilities
const toast = useToast();

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

// local data
const local = ref({
    user_id: localStorage.getItem('user_id'),
    token: localStorage.getItem('token'),
    role_id: localStorage.getItem('role_id'),
});
const payload = ({});

// products
const products = ref(null);
const product = ref({});
const selectedProduct = ref(null);
const productDialog = ref(false);
const submitted = ref(false);

// getting data
const fetching = async () =>{
    const response = await axiosWDua.get('/public/users',{ 
        params: local.value
    });
    products.value = response.data.metadata;
};

onMounted( () => {
    fetching();
});

// manage data
const roles = ref(null);
const openNew = async () => {
    product.value = {};
    productDialog.value = true;

    const responseRole = await axiosWDua.get('/public/users/role',{ 
        params: local.value
    });
    roles.value = responseRole.data.metadata;

};

const editProduct = async (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
    const responseRole = await axiosWDua.get('/public/users/role',{ 
        params: local.value
    });
    roles.value = responseRole.data.metadata;
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.local = local.value;
    const data = product.value;
    if(product.value.id){
        // exsiting data
        const response = await axiosWDua.put('/public/users',data);
        submitted.value = false;
        fetching();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    }else{
        // new data
        const response = await axiosWDua.post('/public/users',data);
        productDialog.value = false;
        submitted.value = false;
        fetching();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    }
};

// deleting data
const deleteSelectedDialog = ref(false);
const confirmDeleteSelected = () => {
    deleteSelectedDialog.value = true;
};
const deleteSelectedProducts = async () => {
    product.value = products.value.filter((val) => selectedProduct.value.includes(val));
    const data = product.value;
    const response = await axiosWDua.delete('/public/users',{data: {data},
        params: local.value
    });
    fetching();
    product.value = {};
    deleteSelectedDialog.value = false;
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });

};

// reset password
const resetPasswordDialog = ref(false);
const confirmResetPassword = (resetProduct) => {
    product.value = { ...resetProduct };
    resetPasswordDialog.value = true;
}
const resetingPassword = async () => {
    product.value.local = local.value;
    const data = product.value;
    const response = await axiosWDua.put('/public/users/reset',data);
    fetching();
    product.value = {};
    toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
    resetPasswordDialog.value = false;
}

// linked account
const LinkedDialog = ref(false);

const openLinkedDialog = (getProduct) => {
    product.value = { ...getProduct };
    getCustomer();
    LinkedDialog.value = true;
}

// customer
const customer = ref({});
const customerList = ref([]);
const searchCustomer = async (event) =>{
    payload.value = local.value;
    payload.value.query = event.query;
    const response = await axiosWDua.get('/fleet/customers/label',{
        params: payload.value
    });
    if(response.status == 200){
        customerList.value = response.data.metadata;
        payload.value = {};
    }
}

const customerDetail = ref({});
const handleCustomerSelected = async (item) => {
    customerDetail.value = item.value; 

    payload.value = local.value;
    payload.value.customer = customerDetail.value;
    payload.value.user = product.value;

    const data = payload.value;
    const response = await axiosWDua.post('/public/userHasCustomer',data);
    if(response.data.status == 200){
        getCustomer();
        toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
        customer.value.name = null;
        payload.value = {};
    }
}

const getCustomer = async() =>{
    payload.value = local.value;
    payload.value.user = product.value;
    const response = await axiosWDua.get('/public/userHasCustomer/user',{
        params: payload.value
    });
    if(response.status == 200){
        customerDetail.value = response.data.metadata.customer;
        payload.value = {};
    }
    
}


</script>

<template>
    <Toast />
    <Toolbar class="mb-5" style="background: linear-gradient(0deg, #57C5B6,#57C5B6), linear-gradient(92.54deg, #57C5B6 47.88%, #ffffff 100.01%)">
        <template v-slot:start>
            <router-link to="/wdua/dashboard" class="mr-2">
                <Button icon="pi pi-chevron-left" class="text-white" text rounded aria-label="Back" title="Back to home" />
            </router-link>
            <div class="text-white font-medium text-xl"><i class="pi pi-users text-white text-xl"></i> USERS</div>
        </template>
        <template v-slot:end>
            
        </template>
    </Toolbar>

    <div class="card">
        <DataTable 
            v-model:selection="selectedProduct"
            :value="products"
            resizableColumns 
            columnResizeMode="fit"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            :filters="filters"
            removableSort
            sortMode="single" 
            sortField="" 
            :sortOrder="1"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div style="text-align:left">
                        <Button icon="pi pi-trash" severity="danger" rounded aria-label="Delete" class="mr-2" title="Delete Data" @click="confirmDeleteSelected" :disabled="!selectedProduct || !selectedProduct.length"  />
                        <Button icon="pi pi-plus" severity="success" rounded aria-label="New" title="New Data" @click="openNew" />
                    </div>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </span>
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 5%"></Column>
            <Column headerStyle="width: 5%" header="Action">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-info " title="Edit Button" @click="editProduct(slotProps.data)" />
                </template>
            </Column>
            <Column field="account" header="Account" sortable></Column>
            <Column field="user_name" header="Full Name" sortable></Column>
            <Column field="role.role_name" header="Role" sortable></Column>
            <Column field="" header="Password" sortable>
                <template #body="slotProps">
                    <Button icon="pi pi-refresh" severity="warning" rounded aria-label="Reset" title="Reset Password" @click="confirmResetPassword(slotProps.data)" />
                </template>
            </Column>
            <Column field="" header="Action" sortable>
                <template #body="slotProps">
                    <Button v-if="slotProps.data.role.role_id == 3" icon="pi pi-link" severity="info" rounded aria-label="Linked" title="Linked account" @click="openLinkedDialog(slotProps.data)" />
                </template>
            </Column>
            
        </DataTable>
    </div>
    
    <Dialog v-model:visible="productDialog" :style="{ width: '50vw' }" header="Manage User" :modal="true" maximizable modal class="p-fluid">
        <div class="field" hidden>
            <label for="id">ID</label>
            <InputText id="id" v-model="product.id" readonly/>
        </div>
        <Fieldset legend="Account" class="mb-3">
            <div class="field">
                <label for="account">Email</label>
                <InputText v-if="product.id" id="account" v-model="product.account" placeholder="Enter user's email" :class="{ 'p-invalid': submitted && !product.account }" required="true" autofocus readonly />
                <InputText v-else id="account" v-model="product.account" placeholder="Enter user's email" :class="{ 'p-invalid': submitted && !product.account }" required="true" autofocus  />
                <small class="p-invalid" v-if="submitted && !product.account">Email is required.</small>
            </div>
            <div class="field">
                <label for="role">Role</label>
                <Dropdown id="role" v-model="product.role" :options="roles" optionLabel="role_name" placeholder="Select a user's role" :class="{ 'p-invalid': submitted && !product.role }" required="true"/>
                <small class="p-invalid" v-if="submitted && !product.role">Role is required.</small>
            </div>
        </Fieldset>
        <Fieldset legend="Personal Info">
            <div class="field">
                <label for="user_name">Full Name</label>
                <InputText id="user_name" v-model="product.user_name" placeholder="Enter user's name" :class="{ 'p-invalid': submitted && !product.user_name }" required="true" autofocus  />
                <small class="p-invalid" v-if="submitted && !product.user_name">User's full name is required.</small>
            </div>
        </Fieldset>

        <template #footer>
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
        </template>
    </Dialog>

    <!-- linked account -->
    <Dialog v-model:visible="LinkedDialog" :style="{ width: '50vw' }" header="Linked Account" :modal="true" maximizable modal class="p-fluid">
        <div class="field" hidden>
            <label for="id">ID</label>
            <InputText id="id" v-model="product.id" readonly/>
        </div>
        <Fieldset legend="Customer" class="mb-3">
            <div>
                <div class="grid">
                    <div class="field mt-2 col-12 sm:col-12 md:col-12 lg:col-12 xl:col-12">
                        <span class="p-float-label">
                            <AutoComplete id="customer_name" v-model="customer.name" @item-select="handleCustomerSelected" optionLabel="name" :suggestions="customerList" @complete="searchCustomer" autofocus />
                            <label for="customer_name">Update Customer</label>
                        </span>
                    </div>
                </div>
                <div v-if="customerDetail != null" class="grid">
                    <div class="field mt-2 col-6 sm:col-6 md:col-6 lg:col-4 xl:col-3">
                        <span class="p-float-label">
                            <InputText id="customer_name" v-model="customerDetail.name" readonly />
                            <label for="customer_name">Name</label>
                        </span>
                    </div>
                </div>
            </div>
        </Fieldset>
    </Dialog>

    <!-- Delete selected dialog -->
    <Dialog v-model:visible="deleteSelectedDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to delete the selected data?</span>
        </div>
        <template #footer >
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteSelectedDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
    </Dialog>

    <!-- Reset password dialog -->
    <Dialog v-model:visible="resetPasswordDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="product">Are you sure you want to reset password for account <b class="text-red-500">{{ product.account }}</b> ?</span>
        </div>
        <template #footer >
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="resetPasswordDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="resetingPassword" />
        </template>
    </Dialog>
</template>
