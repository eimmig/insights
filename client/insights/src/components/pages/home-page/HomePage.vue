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
        <h2>Upload Archive</h2>
        <h4>Click in the button to choose a file ⬇️</h4>
        <div class="text-writing" ref="textWriting"> My Archive.</div>
        <div class="card flex justify-content-center upload-file">
          <Toast />
          <FileUpload
            ref="fileUpload"
            mode="basic"
            name="file"
            url="http://localhost:3000/upload"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :auto="true"
            :multiple="false"
            :fileLimit="1"
            @upload="onUpload"
            @error="onErrorUpload"
          />
        </div>
      </aside>
      <article>
        <img src="https://raw.githubusercontent.com/eimmig/insights/main/client/insights/public/images/undraw_Charts_re_5qe9.png">
      </article>
    </main>
  </div>
</template>

<script>
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: { FileUpload, Toast },
  name: 'HomePage',
  setup() {
    const toast = useToast();
    const textWriting = ref(null);
    const router = useRouter();

    const escrever = (str, done) => {
      const char = str.split('').reverse();
      const intervalId = setInterval(() => {
        if (!char.length) {
          clearInterval(intervalId);
          setTimeout(done, 500);
          return;
        }
        const next = char.pop();
        if (textWriting.value) {
          textWriting.value.innerHTML += next;
        }
      }, 100);
    };

    const limpar = (done) => {
      const char = textWriting.value ? textWriting.value.innerHTML : '';
      let nr = char.length;
      const intervalId = setInterval(() => {
        if (nr-- === 0) {
          clearInterval(intervalId);
          done();
          return;
        }
        if (textWriting.value) {
          const slicedText = char.slice(0, nr);
          const lastChar = slicedText.charAt(slicedText.length -1);
        
          if (lastChar !== 'e') {
            textWriting.value.innerHTML = slicedText;
          } else {
            clearInterval(intervalId);
            done();
          }
        }
      }, 100);
    };

    const rodape = (conteudos) => {
      let atual = -1;
      const prox = () => {
        if (atual < conteudos.length - 1) atual++;
        else atual = 0;
        const str = conteudos[atual];
        escrever(str, () => {
          limpar(prox);
        });
      };
      prox(prox);
    };

    const onUpload = (event) => {
      const jsonResponse = event.xhr.response;
      
      sessionStorage.setItem('dataForCharts', jsonResponse);

      toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded', life: 3000 });
      router.push('/dashboard');
    };

    const onErrorUpload = () => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid file', life: 3000 });
    };


    onMounted(() => {
      rodape(textos);
    });

    const textos = [
     'xls',
     'xlsx',
    ];

    return {
      onUpload,
      onErrorUpload,
      textWriting,
    };
  },
};
</script>

<style>
  img {
    width: 100%;
    margin-left: 20%;
    border-radius: 30%;
    border-color: #333;
  }

  aside {
    width: 30%;
  }

  form{
    display: flex;
    flex-direction: column;
    width: 70%;
    margin-top: 15px
}

form [type="submit"]{
    height: 50px;
    width: 50%;
    color: white;
    font-weight: bold;
}

form [type="submit"]:hover{
    cursor: pointer;
}

.upload-file {
  margin-left: 30%;
  margin-top: 5%;
}

.text-writing {
  font-size: 15px;
  line-height: 5px;
  min-width: 500px;
  margin-left: 33%;
}

</style>
