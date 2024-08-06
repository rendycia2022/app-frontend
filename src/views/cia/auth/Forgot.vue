<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from '../../../service/axios';

const toast = useToast();
const form = ref({});

const submitted = ref(false);
const saveForm = async () => {
    submitted.value = true;

    if(form.value.email){
        
        const data = form.value;
        const result = await axios.post('/auth/forgot',data);
        toast.add({ severity: result.data.severity, summary: result.data.summary, detail: result.data.metadata.message, life: 6000 });
    }
    
};

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px">
                    <div class="grid flex flex-column align-items-center">
                        <Toast />
                        <div class="flex justify-content-center align-items-center bg-orange-500 border-circle" style="width: 3.2rem; height: 3.2rem">
                            <i class="text-50 pi pi-fw pi-lock text-2xl"></i>
                        </div>
                        <h1 class="text-900 font-bold text-4xl lg:text-5xl mb-2">Forgot Password</h1>
                        <span class="text-600 mb-5">Please enter your Account Email. We will send email <b class="text-orange-500">reset password</b>.</span>
                        <div class="grid">
                            <InputText id="email" v-model="form.email" :class="{ 'p-invalid': submitted && !form.email }" placeholder="Enter Email Account" required="true" autofocus  />
                            <Button label="Send" icon="pi pi-send" class="p-button-text text-orange-500" @click="saveForm" />
                        </div>
                        
                        <div class="col-12 mt-5 text-center">
                            <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align: center"></i>
                            <router-link to="/cia" class="text-blue-500">Go to Login</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
