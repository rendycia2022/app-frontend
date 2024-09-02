<script setup>
import { FilterMatchMode } from 'primevue/api';
import { onMounted, reactive, ref, watch, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { axiosProject } from '../../../service/axios';

// components
import ItemDetail from './components/ItemDetail.vue';

const local = ref({
    user_id: localStorage.getItem('id'),
    token: localStorage.getItem('token'),
});

// toast 
import { useToast } from 'primevue/usetoast';
const toast = useToast();

// products
const products = ref(null);
const fetching = async () =>{
    const response = await axiosProject.get('/v2/projects',{ 
        params:{
            token: local.value.token,
            user_id: local.value.user_id,
        }
    });
    local.value.backend = response.data.backend;
}

onMounted(() => {
    fetching();
});

// store
const onUpload = () => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    fetching();
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

</script>

<template>
    <Toast />
    <div class="card">
        <Toolbar>
            <template #start>
                <FileUpload 
                    mode="basic" name="file" class="mr-2"
                    :url="local.backend+'/projects/'+local.user_id+'?token='+local.token" 
                    accept=".xlsx,.xls" :maxFileSize="10000000" @upload="onUpload" 
                    :auto="true"
                    v-tooltip="'Create'"
                    chooseLabel="Import"
                    :class="'p-button-success'"
                />
                <Button @click="downloadTemplateProjects()" v-tooltip="'Download template'" icon="pi pi-file" class="mr-2" severity="secondary" size="small" rounded aria-label="Download" />
            </template>

            <template #center>
                <AutoComplete 
                    v-model="selectedOption" 
                    dropdown 
                    @item-select="handleSelected"  
                    :suggestions="options" 
                    @complete="search"
                    class="mr-1"
                />
                <Button icon="pi pi-times" aria-label="Clear" v-tooltip="'Clear search'" rounded severity="danger" size="small" @click="clearSelected" />
            </template>

            <template #end></template>
        </Toolbar>
    </div>
    <ScrollPanel :style="{ width: '100%', height: '90%' }" >
        <div class="grid">
            
            <div class="col-12 md:col-6 lg:col-4 xl:col-3">
                <ItemDetail />
            </div>

        </div>
    </ScrollPanel>
</template>
