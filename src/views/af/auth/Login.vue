<script setup>
import { ref, onBeforeMount } from 'vue';
import { axiosHR, axiosProject, axiosAf } from '../../../service/axios';
import { useRouter } from 'vue-router';

const router = useRouter()
const form = ref({});
const message = ref(null);
const submitted = ref(false);

const local = ref({
    userId: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

onBeforeMount( async() => {
    const token = localStorage.getItem('token');
    if(token){
        const auth = await axiosAf.get('/auth/token',{ 
                params:{
                    token: local.value.token,
                    user_id: local.value.userId,
                }
            })
        if(auth.data.status == 200){
            router.push({ path: '/af/dashboard' })
        }
    }  
});

const handleSubmit = async () => {
    submitted.value = true;

    const data = form.value;
    const response = await axiosHR.post('/auth/login', data);
    if(response.data.status == 200){
        localStorage.setItem('role', response.data.metadata.role)
        localStorage.setItem('token', response.data.metadata.token)
        localStorage.setItem('email', response.data.metadata.email)
        localStorage.setItem('id', response.data.metadata.id) 
        router.push({ path: '/af/dashboard' })
    }else{
        message.value = 'Wrong email or password!';
    }  
};

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Welcome, to AF system!</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" v-model="form.email" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="form.password" placeholder="Password" toggleMask :feedback="false" class="w-full mb-3" inputClass="w-full" />
                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center p-error">
                                <label for="rememberme1">{{ message }}</label>
                            </div>
                            <router-link to="/hr/auth/forgot" class="text-orange-500 font-medium no-underline ml-2 text-right cursor-pointer">Forgot password?</router-link>
                        </div>
                        
                        <Button label="Sign In" class="w-full p-3 text-xl" @click="handleSubmit"></Button>
                    </div>  
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
