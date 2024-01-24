# Insights
O projeto a seguir foi desenvolvido como desafio de desenvolvedor web, o mesmo utiliza Nest.js e Vue3. Esse projeto tem como intuito criar uma plataforma na qual seja possível fazer o UPLOAD de um documento XLS ou XLSX para o mesmo e ter acesso a um painel BI no qual apresenta informações como Churn e MRR. Eu decidi adicionar mais dois graficos ao painel para que se pudesse ter uma visão mais geral e com mais metricas para melhor gerenciamento do negócio.

## Objetivos do Sistema

Este projeto tem como objetivo criar um sistema no qual seja possível fazer UPLOAD de um documento XLSX e apresentar um BI sobre o mesmo.

## Tecnologias Utilizadas

- Nest.js
- Vue.js

## Como Foi Construído

O sistema foi construído seguindo os princípios da programação orientada a objetos. Por ser um sistema pequeno o qual não haverá expensão foi utilizada apenas as classes default que vieram ao inicializar o projeto. O back-end possui apenas um endpoint o qual trata todos os dados e envia para a outra parte da aplicação.

## Como Executar

Para executar o projeto localmente, siga as instruções abaixo:

```bash
git clone [https://github.com/eimmig/insights.git](https://github.com/eimmig/insights.git)

-front

cd insights/client/insights
npm install
npm num serve

-back

cd insights/server/insights-server
npm install
npm start
```

## Capturas do Projeto:

![Home Page](https://github.com/eimmig/insights/assets/91758475/0066db6d-7e81-4b2d-bf5e-e6d5baf37757)
![Implementação filtro por data](https://github.com/eimmig/insights/assets/91758475/f2ba80f7-ed14-4480-8639-5f50caa2a33b)
![Menu lateral botão voltar + redes sociais](https://github.com/eimmig/insights/assets/91758475/3ceb0230-c5b3-43b4-a208-df77969ab23a)
![Graficos de MRR e Churn](https://github.com/eimmig/insights/assets/91758475/32c744c8-81fe-4280-a314-f73ad3ecced7)
![Grafico porcentagens meses mais vendidos e vendas sobre cancelados](https://github.com/eimmig/insights/assets/91758475/3aba8c9d-df41-4104-972b-4a1e60607750)

