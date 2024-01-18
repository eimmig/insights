<template>
    <div>
      <header>
        <div id="title">
          <h1>Insights</h1>
          <h1>by Files</h1>
        </div>
      </header>
      <main>
        <aside>
          <h2>Carregar arquivo</h2>
          <h4>Insira o arquivo abaixo ⬇️</h4>
          <div class="seila">
            <div class="card flex justify-content-center">
              <Toast />
              <FileUpload
                mode="basic"
                name="demo[]"
                url=""
                accept="image/*"
                :maxFileSize="1000000"
                @upload="onUpload"
              />
            </div>
            <div class="face-background">
              <div class="face">
                <div class="eyes">
                  <div class="eye"></div>
                  <div class="eye"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <article>
            <Carousel :value="charts" :numVisible="1" :numScroll="1" :responsiveOptions="responsiveOptions">
                <template #item="value">
                    {{ console.log('Value:', value) }}
                    <div class="border-1 surface-border border-round m-2 text-center py-5 px-3">
                        <div class="mb-4">
                            <img :src="value.data" alt="Chart" class="w-6 shadow-2" />
                        </div>
                    </div>
                </template>
            </Carousel>
        </article>
      </main>
    </div>
  </template>
  
  <script>
  import FileUpload from 'primevue/fileupload';
  import Carousel from 'primevue/carousel';
  import { useToast } from 'primevue/usetoast';
  import { ref } from "vue";
  import './HomePage.css';
  
  export default {
    components: { FileUpload, Carousel },
    name: 'HomePage',
    setup() {
      const toast = useToast();
  
      const onUpload = () => {
        toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
      };
  
    const charts = [
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Charts_re_5qe9.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Data_re_80ws.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Growing_re_olpi.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Setup_analytics_re_foim.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Statistic_chart_re_w0pk.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_Statistics_re_kox4.png',
        'https://github.com/eimmig/insights/blob/main/client/insights/public/images/undraw_visual_data_re_mxxo.png',
    ];
  
    const responsiveOptions = ref([
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ]);
  
      return {
        onUpload,
        charts,
        responsiveOptions,
      };
    },
  };
  </script>
  