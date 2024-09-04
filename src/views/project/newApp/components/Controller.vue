<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { axiosProject } from '../../../../service/axios';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

onMounted(() => {
    fetching();
});
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects/backend/target',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });

    local.value.backend = response.data;
}

// routing
const router = useRouter();
const toDashboard = () =>{
    router.push({path: '/project/new/dashboard'});
}

// store
const emit = defineEmits(['completeTodo']);
const onUpload = () => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded, please refresh page', life: 3000 });
    let date = new Date();
    emit('completeTodo', date);
};

// selected data
const selectedOption = ref();
const options = ref([]);
const optionsOriginal = ref([]);

const search = (event) => {
    let query = event.query;
    console.log(query)
}

const handleSelected = (item) => {
    
}

const clearSelected = () =>{
    selectedOption.value = null;
    
}

// template
const downloadTemplateProjects = async () => {
    await axiosProject.get('/v2/projects/download/template', {
        params:{
            token: local.value.token,
        },
        responseType: 'blob', // Menentukan tipe respons sebagai blob (binary large object)
        
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_Projects.xlsx'); // Atur nama file sesuai kebutuhan Anda
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.error(error);
    });
};

// menu panel
const op2 = ref(null);
const toggleController = (event) => {
    op2.value.toggle(event);
};

</script>

<template>
    <Toast />
    <Button @click="toggleController" v-tooltip.left="'Controller'" icon="pi pi-th-large" severity="secondary" text rounded aria-label="toggleController" />
    <OverlayPanel ref="op2" appendTo="body" :showCloseIcon="true" id="overlay_panel" >
        <div class="flex flex-wrap gap-2 justify-end">
            <Button @click="toDashboard" v-tooltip.left="'Dashboard'" class="mr-5" icon="pi pi-desktop" severity="info" size="small" rounded aria-label="Dashboard" />
            <FileUpload 
                mode="basic" name="file"
                :url="local.backend+'/projects/'+local.user_id+'?token='+local.token" 
                accept=".xlsx,.xls" :maxFileSize="10000000" @upload="onUpload" 
                :auto="true"
                v-tooltip.left="'Create'"
                chooseLabel="Import"
                :class="'p-button-success'"
            />
            <Button @click="downloadTemplateProjects()" v-tooltip.left="'Download template'" icon="pi pi-file" severity="secondary" size="small" rounded aria-label="Download" />
        </div>
        
    </OverlayPanel>
    
</template>
