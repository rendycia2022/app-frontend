<script setup>
import { onMounted, ref, } from 'vue';
import { axiosWDua } from '../../../service/axios';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const toast = useToast();

// local data
const local = ref({
    user_id: localStorage.getItem('user_id'),
    token: localStorage.getItem('token'),
    role_id: localStorage.getItem('role_id'),
});

const product = ref({});
const submitted = ref(false);

// getting data
const fetching = async () =>{
    const response = await axiosWDua.get('/public/users/id',{ 
        params: local.value
    });
    product.value = response.data.metadata;
};

onMounted( () => {
    fetching();
});

// go back
const router = useRouter();
const goBack = () => {
    router.go(-1)
}

// reset password
const password = ref({});
const resetPassword = async () => {
    submitted.value = true;
    password.value.local = local.value;
    if(password.value.current && password.value.new && password.value.confirm){
        if(password.value.new == password.value.confirm){
            const data = password.value;
            const response = await axiosWDua.put('/public/users/id/password',data);
            if(response.data.status == 200){
                password.value = {};
                submitted.value = false;
            }
            toast.add({ severity: response.data.toast.severity, summary: response.data.toast.summary, detail: response.data.toast.detail, life: 6000 });
            
        }else{
            toast.add({ severity: 'error', summary: 'Warning', detail: 'New password and confirm password not match', life: 60000 });
        }

        
    }
};

</script>

<template>
    <Toolbar class="mb-5" style="background: linear-gradient(0deg, #57C5B6,#57C5B6), linear-gradient(92.54deg, #57C5B6 47.88%, #ffffff 100.01%)">
        <template v-slot:start>
            <Button icon="pi pi-chevron-left" @click="goBack" class="text-white" text rounded aria-label="Back" title="Back to previously page" />
            <div class="text-white font-medium text-xl"><i class="pi pi-user text-white text-xl"></i> Personal Info</div>
        </template>
        <template #center>
            
        </template>
        <template v-slot:end>
            
        </template>
    </Toolbar>

    <div class="card">
        <Toast />
        
        <div class="field" hidden>
            <label for="id">ID</label>
            <InputText id="id" v-model="product.id" readonly/>
        </div>
        <Fieldset legend="Account" class="mb-3">
            <div class="p-fluid">
                <div class="field">
                    <label for="account">Email</label>
                    <InputText id="account" v-model="product.account" required="true" autofocus readonly />
                </div>
            </div>
        </Fieldset>
        <Fieldset legend="Reset Password" class="mb-3">
            <div class="p-fluid">
                <div class="field">
                    <label for="current">Current password</label>
                    <Password id="current" v-model="password.current" :required="true" :class="{ 'p-invalid': submitted && !password.current }" toggleMask autofocus />
                    <small class="p-invalid" v-if="submitted && !password.current">Current password is required.</small>
                </div>
                <div class="field">
                    <label for="new">New password</label>
                    <Password id="new" v-model="password.new" :required="true" :class="{ 'p-invalid': submitted && !password.new }" toggleMask autofocus />
                    <small class="p-invalid" v-if="submitted && !password.new">New password is required.</small>
                </div>
                <div class="field">
                    <label for="confirm">Confirm new password</label>
                    <Password id="confirm" v-model="password.confirm" :required="true" :class="{ 'p-invalid': submitted && !password.confirm }" toggleMask autofocus />
                    <small class="p-invalid" v-if="submitted && !password.confirm">Confirm new assword is required.</small>
                </div>
            </div>
            
            <div class="flex justify-content-end">
                <Button label="Reset Password" icon="pi pi-refresh" severity="warning" @click="resetPassword" />
            </div>
        </Fieldset>
        <Fieldset legend="Personal Info">
            <div class="p-fluid">
                <div class="field">
                    <label for="user_name">Full Name</label>
                    <InputText id="user_name" v-model="product.user_name" required="true" autofocus readonly />
                </div>
            </div>
        </Fieldset>
        
    </div>
</template>
