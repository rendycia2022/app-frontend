<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { axiosHR } from '../../../service/axios';

const toast = useToast();

const products = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const deleteApprovalDialog = ref(false);
const product = ref({});
const approval = ref({});
const selectedProducts = ref();
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const dropdownValues= ref(null);
const dropdownValuesJob= ref(null);
const multiselectValues = ref(null);
const companies = ref(null);

onBeforeMount(() => {
    initFilters();
});

// get plafon data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/users',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    products.value = result.data.metadata.data;
});

// role dropdown
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/role',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    dropdownValues.value = result.data.metadata.data;
});

// approval dropdown
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/approval/options',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    multiselectValues.value = result.data.metadata.data;
});

// jobs dropdown
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/jobs',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    dropdownValuesJob.value = result.data.metadata.data;
});

// get companies data
onMounted(async () => {
    const result = await axiosHR.get('/reimbursment/data/company',{
                params:{
                    token: localStorage.getItem('token'),
                }
            });
    companies.value = result.data.metadata.data;
});

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.token = localStorage.getItem('token');
    product.value.user_local = localStorage.getItem('id');
    if (product.value.email.trim()) {
        if (product.value.id) { 
            // update data
            const data = product.value;
            const result = await axiosHR.put('/reimbursment/users',data);
            if(result.status == 200){
                product.value = result.data.metadata.data;
                products.value[findIndexById(product.value.id)] = product.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Updated', life: 3000 });
            }
        } else {
            // new data
            const data = product.value;
            const result = await axiosHR.post('/reimbursment/users',data);
            if(result.status == 200){
                product.value = result.data.metadata.data;
                products.value.push(product.value);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Created', life: 3000 });
            }
            
        }
        productDialog.value = false;
        product.value = {};

    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const confirmDeleteApproval = (editProduct) => {
    approval.value = editProduct;
    deleteApprovalDialog.value = true;
};

const deleteProduct = async () => {
    const data = product.value;
    const result = await axiosHR.delete('/reimbursment/users',{data: {data},
        params:{
            token: localStorage.getItem('token'),
        }
    });
    if(result.status == 200){
        products.value = products.value.filter((val) => val.id !== product.value.id);
        deleteProductDialog.value = false;
        product.value = {};
        toast.add({ severity: 'error', summary: 'Failed', detail: 'Data Deleted', life: 3000 });
    }
};

const deleteApproval = async () => {
    const data = approval.value;
    const result = await axiosHR.delete('/reimbursment/data/approval',{data: {data},
        params:{
            token: localStorage.getItem('token'),
            user_id: product.value.id,
        }
    });
    if(result.status == 200){
        product.value.approval_list = product.value.approval_list.filter((val) => val.id !== approval.value.id);
        deleteApprovalDialog.value = false;
        approval.value = {};
        toast.add({ severity: 'error', summary: 'Failed', detail: 'Data Deleted', life: 3000 });
    }
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = async () => {
    const data = products.value.filter((val) => selectedProducts.value.includes(val));
    const result = await axiosHR.delete('/reimbursment/users/burst',{data: {data},
        params:{
            token: localStorage.getItem('token'),
        }
    });
    if(result.status == 200){
        products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
        deleteProductsDialog.value = false;
        selectedProducts.value = null;
        toast.add({ severity: 'error', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

// autoComplete
const items = ref([]);
const search = async(event) => {
    const result = await axiosHR.get('/reimbursment/data/users/email',{
                params:{
                    token: localStorage.getItem('token'),
                    query: event.query,
                }
            });
    items.value = result.data.metadata.message;
}

// reordered
const order = ref({});
const onRowReorder = async(event) => {
    order.value.token = localStorage.getItem('token');
    order.value.user_id = product.value.id;
    order.value.event = event.value;
    const data = order.value;
    const result = await axiosHR.post('/reimbursment/data/approval/reorder',data);
    product.value.approval_list = result.data.metadata.message;
};

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <!-- <Button label="Export" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" /> -->
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Users</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="email" header="Email" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Email</span>
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="emp_id" header="Emp id" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">EMP ID</span>
                            {{ slotProps.data.emp_id }}
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="company.name" header="Company" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Company</span>
                            {{ slotProps.data.company.name }}
                        </template>
                    </Column>
                    <Column field="division" header="Division" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Division</span>
                            {{ slotProps.data.division }}
                        </template>
                    </Column>
                    <Column field="job.grade" header="Job Level" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Job Level</span>
                            {{ slotProps.data.job.grade }}
                        </template>
                    </Column>
                    <Column field="date_join" header="Date Join" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Date join</span>
                            {{ slotProps.data.date_join }}
                        </template>
                    </Column>
                    <Column field="role.name" header="Role" :sortable="true" headerStyle="width:20%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Role</span>
                            {{ slotProps.data.role.name }}
                        </template>
                    </Column>
                    
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="productDialog" :style="{ width: '720px' }" header="User Details" :modal="true" class="p-fluid mb-3">
                    <h5 class="mt-2">Account</h5>
                    <div class="field" hidden>
                        <label for="id">ID</label>
                        <InputText id="id" v-model="product.id" readonly/>
                    </div>
                    <div class="field">
                        <label for="email">Email</label>
                        <InputText id="email" v-model="product.email" :class="{ 'p-invalid': submitted && !product.email }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.email">Email is required.</small>
                    </div>
                    <div class="field">
                        <label for="role">Role Level</label>
                        <Dropdown v-if="product.role" id="role" v-model="product.role" :options="dropdownValues" :placeholder="product.role.name" :class="{ 'p-invalid': submitted && !product.role }" required="true" optionLabel="name"  />
                        <Dropdown v-else id="role" v-model="product.role" :options="dropdownValues" placeholder="Select" :class="{ 'p-invalid': submitted && !product.role }" required="true" optionLabel="name"  />
                        <small class="p-invalid" v-if="submitted && !product.role">Role is required.</small>
                    </div>

                    <h5 class="mt-2">Info</h5>
                    <div class="field">
                        <label for="emp_id">EMP ID</label>
                        <InputText id="emp_id" v-model="product.emp_id" :class="{ 'p-invalid': submitted && !product.emp_id }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.emp_id">EMP ID is required.</small>
                    </div>
                    <div class="field">
                        <label for="name">Name</label>
                        <InputText id="name" v-model="product.name" :class="{ 'p-invalid': submitted && !product.name }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.name">Name is required.</small>
                    </div>
                    <div class="field">
                        <label for="company">Company</label>
                        <Dropdown id="company" v-model="product.company" :options="companies" placeholder="Select" :class="{ 'p-invalid': submitted && !product.company }" required="true" optionLabel="name"  />
                        <small class="p-invalid" v-if="submitted && !product.company">Company Level is required.</small>
                    </div>
                    <div class="field">
                        <label for="division">Division</label>
                        <InputText id="division" v-model="product.division" :class="{ 'p-invalid': submitted && !product.division }" required="true" autofocus  />
                        <small class="p-invalid" v-if="submitted && !product.division">Division is required.</small>
                    </div>
                    <div class="field">
                        <label for="job_level">Job Level</label>
                        <Dropdown v-if="product.job" id="job_level" v-model="product.job" :options="dropdownValuesJob" :placeholder="product.job.level+' - '+product.job.grade" :class="{ 'p-invalid': submitted && !product.job }" required="true" optionLabel="name"  />
                        <Dropdown v-else id="job_level" v-model="product.job" :options="dropdownValuesJob" placeholder="Select" :class="{ 'p-invalid': submitted && !product.job }" required="true" optionLabel="name"  />
                        <small class="p-invalid" v-if="submitted && !product.job">Job Level is required.</small>
                    </div>
                    <div class="field">
                        <label for="date_join">Date Join</label>
                        <Calendar id="date_join" :showIcon="true" :showButtonBar="true" v-model="product.date_join" dateFormat="yy-mm-dd" autofocus ></Calendar>
                    </div>

                    <h5 class="mt-2">Approval</h5>
                    <div class="field">
                        <label for="entry_approval">Entry</label>
                        <AutoComplete v-model="product.approval" multiple :suggestions="items" @complete="search" placeholder="Enter email user..." autofocus />
                    </div>
                    <div class="field">
                        <DataTable :value="product.approval_list" dataKey="id" :rows="5" @rowReorder="onRowReorder" :paginator="true" responsiveLayout="scroll"> 
                            <Column header="Reorder" rowReorder style="width: 10%" :reorderableColumn="false" />
                            <Column field="sort" header="No." :sortable="true" style="width: 10%"></Column>
                            <Column field="email" header="email" :sortable="true" style="width: 35%"></Column>
                            <Column style="width: 15%">
                                <template #header> View</template>
                                <template #body="slotPropsApproval">
                                    <Button icon="pi pi-times" type="button" class="p-button-text p-button-danger"  @click="confirmDeleteApproval(slotPropsApproval.data)"></Button>
                                </template>
                            </Column>
                        </DataTable>
                    </div>   

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.item }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteApprovalDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="approval"
                            >Are you sure you want to delete <b>{{ approval.email }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteApprovalDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteApproval" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
