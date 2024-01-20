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
            :maxFileSize="1000000"
            @upload="onUpload()"
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

export default {
  components: { FileUpload, Toast },
  name: 'HomePage',
  setup() {
    const toast = useToast();
    const textWriting = ref(null);

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

    const onUpload = () => {
      toast.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded', life: 3000 });
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
      textWriting,
    };
  },
};
</script>

<style>

body {
    background-color: rgb(34,34,34);
    color: white;
    margin: 0 auto;
    padding: 15px;
    position: relative;
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: relative;
    top: 0;
    left: 0;
  }

  #title {
    flex-direction: column;
    line-height: 15px;
    text-align: left;
  }

  h1 {
    font-weight: 200;
  }

  main {
    display: flex;
    margin: 0 auto;
    padding: 15px;
    position: relative;
    flex-direction: row;
    margin-top: 50px;
    max-width: 1200px;
  }

  h2 {
    font-size: 56px;
    line-height: 50px;
    min-width: 500px;
  }

  h4 {
    line-height: 30px;
    margin: 15px;
  }

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
