<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/cia/composables/layout';
import History from './components/History.vue';
import { useRoute } from 'vue-router'
import { axiosManagement, axiosProject } from '../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('userId'),
    token: localStorage.getItem('token'),
});

const user = ref({});

const getUser = async () =>{
    const response = await axiosManagement.get('/v2/auth/token/project_apps/'+local.value.token,{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    user.value.username = response.data.user.username;
    user.value.password = response.data.user.password;
}

onMounted( async () => {
    await getUser();
    var port = route.params.projectInitial;
    local.value.link = 'http://103.188.175.175:'+port+'/login/'+local.value.token+'/'+user.value.username+'/'+user.value.password;
});

const route = useRoute()
watch(() => route.params.projectInitial, async newValue => {
    await getUser();
    var port = newValue;
    local.value.link = 'http://103.188.175.175:'+port+'/login/'+local.value.token+'/'+user.value.username+'/'+user.value.password;
  }
);

</script>

<template>
    <div class="grid">
        <div class="col-9">
            <div class="container">
                <iframe class="responsive-iframe" :src="local.link"></iframe>
            </div>
        </div>
        <div class="col-3">
            <History />
        </div>
    </div>
    
</template>

<style scoped>
    .container {
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;
        padding-top: 56.25%; /* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
    }
  
  /* Then style the iframe to fit in the container div with full height and width */
  .responsive-iframe {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 870px;
  }
</style>