<script setup>
import { ref, onMounted } from "vue";
import { axiosProject } from '../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const products = ref();
const purchasing = ref();
onMounted( async() => {
    const response = await axiosProject.get('project/summary',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    products.value = response.data.metadata;
    const responsePurchasing = await axiosProject.get('project/summary/purchasing/counter',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    purchasing.value = responsePurchasing.data.metadata.toLocaleString();
});

// management data start
const product = ref({});
const productDialog = ref(false);
const submitted = ref(false);
const created = ref(true);

const openNew = async () => {
    product.value = {};
    submitted.value = false;
    created.value = true;
    productDialog.value = true;
    const createId = await axiosProject.get('project/summary/createid',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    product.value.id = createId.data.metadata;
};

const saveProduct = async () => {
    submitted.value = true;
    product.value.token = local.value.token;
    product.value.user_id = local.value.user_id;
    if(product.value.id && product.value.name && product.value.type){
        if(!product.value.document){
            product.value.document = null;
        }
        if(!product.value.customer){
            product.value.customer = null;
        }
        if(!product.value.references){
            product.value.references = null;
        }
        if(product.value.date){
            product.value.date = format_date(product.value.date);
        }else{
            product.value.date = null;
        }
        
        const data = product.value;
        const response = await axiosProject.post('project/summary',data);
        if(response.data.status == 200){
            product.value = response.data.metadata;
            if(response.data.store == 'create'){
                products.value.push(product.value);
            }else{
                products.value[findIndexById(product.value.project.id)] = product.value;
            }
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
            productDialog.value = false;
            product.value = {};
        }else{
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
        }
    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    created.value = false;
    productDialog.value = true;
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].project.id === id) {
            index = i;
            break;
        }
    }
    return index;
};

function format_date(date) {
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
// management data end

const layout = ref('grid');

const display = ref({
    height: screen.height+'px',
});

</script>

<template>
    <div class="card">
        <Toast />
        <Toolbar class="mb-2">
            <template v-slot:start>
                <Button label="New" icon="pi pi-plus" class="p-button-success mr-2 " @click="openNew" />
            </template>
            <template v-slot:end>
                <!-- <router-link class="text-xl text-blue-400 font-bold" :to="'/project/summary/purchasing'">
                    <Button type="button" label="PO" icon="pi pi-list" :badge="purchasing" badgeClass="p-badge-danger" outlined />
                </router-link> -->
            </template>
        </Toolbar>
        <ScrollPanel :style="{ width: '100%', height: display.height }" >
            <DataView :value="products" :layout="layout">
                <template #grid="slotProps">
                    <div class="col-12 sm:col-12 lg:col-6 xl:col-4 p-2">
                        <div class="p-4 border-1 surface-border surface-card border-round">
                            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                                <Button v-if="slotProps.data.user.collaborator_value == 'owner'" @click="editProduct(slotProps.data.project)" icon="pi pi-pencil" severity="success" text rounded aria-label="User" />
                                <div v-else class="flex align-items-center gap-2">
                                    <span class="font-semibold">{{ slotProps.data.owner.user_name }}</span>
                                </div>
                            </div>
                            <div class="flex flex-column gap-1 py-1">
                                <div>
                                    <table class="text-left">
                                        <tr>
                                            <th>PO Number:</th>
                                            <th><label class="text-1xl font-bold">{{ slotProps.data.project.document }}</label></th>
                                        </tr>
                                        <tr>
                                            <th>Project's Name:</th>
                                            <th><router-link class="text-xl text-blue-400 font-bold" :to="'/project/summary/'+slotProps.data.project.id+'/detail'">{{ formatCurrency(slotProps.data.project.name) }}</router-link></th>
                                        </tr>
                                        <tr>
                                            <th>Project's Type:</th>
                                            <th><label class="text-1xl font-bold">{{ slotProps.data.project.type }}</label></th>
                                        </tr>
                                        <tr>
                                            <th>Customer:</th>
                                            <th><label class="text-1xl font-bold">{{ slotProps.data.project.customer }}</label></th>
                                        </tr>
                                        <tr>
                                            <th>Assignment References:</th>
                                            <th><label class="text-1xl font-bold">{{ slotProps.data.project.references }}</label></th>
                                        </tr>
                                        <tr>
                                            <th>Assignment Date:</th>
                                            <th><label class="text-1xl font-bold">{{ slotProps.data.project.date }}</label></th>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <div class="flex flex-column gap-3 py-2">
                                        <div class="text-xl font-bold">Proposed Budget <label class="text-yellow-400">{{ formatCurrency(slotProps.data.budget.proposed) }}</label></div>
                                    </div>
                                    <div class="flex flex-column gap-3 py-1">
                                        <div class="text-1xl font-bold">Indirect Cost <label class="text-yellow-400">{{ formatCurrency(slotProps.data.budget.indirect.total) }}</label></div>
                                    </div>
                                    <table class="py-2">
                                        <tr>
                                            <td>
                                                Resources:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.indirect.subtotal.resources) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Overhead:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.indirect.subtotal.overhead) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Tax 3%:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.indirect.subtotal.tax) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Cost of Fund:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.indirect.subtotal.cost_of_fund) }}
                                            </td>
                                        </tr>
                                    </table>
                                    <div class="flex flex-column gap-3 py-1">
                                        <div class="text-1xl font-bold">Direct Cost <label class="text-yellow-400">{{ formatCurrency(slotProps.data.budget.direct.total) }}</label></div>
                                    </div>
                                    <table class="py-2">
                                        <tr>
                                            <td>
                                                Consultants:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.direct.subtotal.consultants) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Material Purchasing:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.direct.subtotal.material) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Sub-Contracting:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.direct.subtotal.subcontracting) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Other:
                                            </td>
                                            <td>
                                                {{ formatCurrency(slotProps.data.budget.direct.subtotal.other) }}
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div>
                                    <div class="flex flex-column gap-3 py-3">
                                        <div class="text-xl font-bold">Expected Revenue: <label class="text-blue-400" >{{ formatCurrency(slotProps.data.revenue.total) }} / {{ slotProps.data.revenue.qty }} Sites</label></div>
                                    </div>
                                    <div class="text-xl font-bold">Expected Margin: 
                                        <label v-if="slotProps.data.margin.percent < 0" class="text-red-400">{{ formatCurrency(slotProps.data.margin.total) }} | {{ slotProps.data.margin.percent }}%</label>
                                        <label v-else-if="slotProps.data.margin.percent < 30" class="text-orange-400">{{ formatCurrency(slotProps.data.margin.total) }} | {{ slotProps.data.margin.percent }}%</label>
                                        <label v-else class="text-green-400">{{ formatCurrency(slotProps.data.margin.total) }} | {{ slotProps.data.margin.percent }}%</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                                <div class="flex align-items-center gap-2">
                                    <!-- <span class="text-1xl font-semibold">Inv: 0 / PO: 0</span> -->
                                </div>
                                <!-- <span class="text-1xl font-semibold">Total Site: 0/<router-link class="text-blue-400" :to="'/project/summary/'+slotProps.data.project.id+'/cost/direct'">{{ slotProps.data.revenue.total.qty }}</router-link></span> -->
                            </div>
                            
                        </div>
                    </div>
                </template>
            </DataView>
        </ScrollPanel>
    </div>

    <Dialog v-model:visible="productDialog" :style="{ width: '50vw' }" header="Project" :modal="true" maximizable modal class="p-fluid">
        <div class="field">
            <label for="id">ID</label>
            <InputText id="id" v-model="product.id" readonly/>
        </div>
        <div class="field">
            <label for="name">Project's Name</label>
            <InputText id="name" v-model="product.name" :class="{ 'p-invalid': submitted && !product.name }" required="true" autofocus  />
            <small class="p-invalid" v-if="submitted && !product.name">Project's name is required.</small>
        </div>
        <div class="field">
            <label for="document">PO Number</label>
            <InputText id="document" v-model="product.document" autofocus  />
        </div>
        <div class="field">
            <label for="type">Project's Type</label>
            <InputText id="type" v-model="product.type" :class="{ 'p-invalid': submitted && !product.type }" required="true" autofocus  />
            <small class="p-invalid" v-if="submitted && !product.type">Project's type is required.</small>
        </div>
        <div class="field">
            <label for="customer">Project's Customer</label>
            <InputText id="customer" v-model="product.customer" autofocus  />
        </div>
        <div class="field">
            <label for="references">Assignment References</label>
            <InputText id="references" v-model="product.references" />
        </div>
        <div class="field">
            <label for="date">Assignment Date</label>
            <Calendar id="date" :showIcon="true" :showButtonBar="true" v-model="product.date" :selectOtherMonths="true" :manualInput="false" dateFormat="yy-mm-dd" timeZone="Indonesia/Jakarta" autofocus ></Calendar>
        </div>

        

        <template #footer>
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
        </template>
    </Dialog>

</template>

<style scoped lang="scss">
@import '@/assets/demo/styles/badges.scss';
</style>
