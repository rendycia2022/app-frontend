<script setup>
import { onMounted, ref, } from 'vue';
import axios from '../../service/axios';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const info = ref({});
const account = ref({});
const password = ref({});
const submitted = ref(false);

// get plafon data
onMounted(async () => {
    const result = await axios.get('/reimbursment/data/users/id',{
                params:{
                    token: localStorage.getItem('token'),
                    id: localStorage.getItem('id'),
                }
            });
    info.value = result.data.metadata.info;
    account.value = result.data.metadata.account;
    password.value.user_id = account.value.id;
});


const resetPassword = async () => {
    submitted.value = true;
    password.value.token = localStorage.getItem('token');
    if(password.value.user_id && password.value.current && password.value.new && password.value.confirm) {
        if(password.value.new != password.value.confirm){
            toast.add({ severity: 'error', summary: 'Failed', detail: 'New Password and Re-type Password not same', life: 30000 });
        }else{
            const data = password.value;
            const result = await axios.post('/reimbursment/data/users/password',data);
            if(result.data.status == 404){
                toast.add({ severity: 'error', summary: 'Failed', detail: 'Account not found', life: 30000 });
            }  
            if(result.data.status == 401){
                toast.add({ severity: 'error', summary: 'Unauthorized', detail: 'Wrong current password', life: 30000 });
            }  
            if(result.data.status == 200){
                toast.add({ severity: 'success', summary: 'Attention', detail: 'Password Changed', life: 30000 });
                password.value = {};
            }   
        }
        
    }
};

</script>

<template>
    <div class="card">
        <Toast />
        <Accordion :activeIndex="0">
            <AccordionTab header="Personal Info">
                <div class="grid">
                    <div class="col-12 md:col-12">
                        <div class="p-fluid">
                            <div class="formgrid grid">
                                <div class="field col">
                                    <label for="emp_id">EMP ID</label>
                                    <InputText id="emp_id" v-model="info.emp_id" type="text" readonly />
                                </div>
                                <div class="field col">
                                    <label for="job_level">Job Level</label>
                                    <InputText id="job_level" v-model="info.grade" type="text" readonly />
                                </div>
                                <div class="field col">
                                    <label for="date_join">Date join</label>
                                    <InputText id="date_join" v-model="info.date_join" type="text" readonly />
                                </div>
                            </div>
                            <div class="formgrid grid">
                                <div class="field col">
                                    <label for="name">Name</label>
                                    <InputText id="name" v-model="info.name" type="text" @keyup.enter="save()" readonly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTab>
            <AccordionTab header="Account">
                <div class="grid">
                    <div class="col-12 md:col-12">
                        <div class="p-fluid" hidden>
                            <div class="formgrid grid">
                                <div class="field col">
                                    <label for="id">ID</label>
                                    <InputText id="id" v-model="account.id" type="text" readonly />
                                </div>
                            </div>
                        </div>
                        <div class="p-fluid">
                            <div class="formgrid grid">
                                <div class="field col">
                                    <label for="email">Email</label>
                                    <InputText id="email" v-model="account.email" type="text" readonly />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Fieldset legend="Reset Password" :toggleable="true" :collapsed="true">
                    <div class="grid">
                        <div class="col-12 md:col-12">
                            <div class="p-fluid">
                                <div class="formgrid grid">
                                    <div class="field col-12" hidden>
                                        <label for="user_id">ID</label>
                                        <InputText id="user_id" v-model="password.user_id" type="text" readonly />
                                    </div>
                                    <div class="field col-12">
                                        <label for="current_password">Current Password</label>
                                        <Password id="current_password" v-model="password.current" :class="{ 'p-invalid': submitted && !password.current }" :required="true" toggleMask />
                                        <small class="p-invalid" v-if="submitted && !password.current">Current Password is required.</small>
                                    </div>
                                    <div class="field col-12">
                                        <label for="new_password">New Password</label>
                                        <Password id="new_password" v-model="password.new" :class="{ 'p-invalid': submitted && !password.new }" :required="true" toggleMask />
                                        <small class="p-invalid" v-if="submitted && !password.new">New Password is required.</small>
                                    </div>
                                    <div class="field col-12">
                                        <label for="confirm_password">Re-type New Password</label>
                                        <Password id="confirm_password" v-model="password.confirm" :class="{ 'p-invalid': submitted && !password.confirm }" :required="true" toggleMask />
                                        <small class="p-invalid" v-if="submitted && !password.confirm">Confirm New Password is required.</small>
                                    </div>
                                </div>
                            </div>    
                        </div>    
                    </div>
                    
                    <div class="flex justify-content-end">
                        <Button label="Reset Password" icon="pi pi-refresh" severity="warning" @click="resetPassword" />
                    </div>
                            
                </Fieldset>
                
            </AccordionTab>
        </Accordion>
    </div>
</template>
