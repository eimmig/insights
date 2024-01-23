<template>
  <div>
    <header>
      <div id="title">
        <div class="card flex justify-content-center">
          <Sidebar
            v-model:visible="visible"
            header="Insights by Files"
            class="p-sidebar-sm"
          >
            <Button
              icon="pi pi-github"
              @click="openGitHub"
              label="GitHub"
              style="margin: 10px"
            />
            <Button
              icon="pi pi-linkedin"
              @click="openLinkedIn"
              label="LinkedIn"
              style="margin: 10px"
            />
            <Button
              icon="pi pi-arrow-left"
              @click="goToHome"
              label="Return Home"
              style="margin: 10px; margin-top: 42rem"
            />
          </Sidebar>
          <Button icon="pi pi-arrow-right" @click="visible = true" />
        </div>
      </div>
      <div class="change-date-filter">
        <Button
          label="Apply"
          @click="setFilters"
          rounded
          style="margin-right: 10px"
        />
        <div class="flex-auto">
          <Calendar
            v-model="startDate"
            showIcon
            :manualInput="false"
            style="margin-right: 10px"
            dateFormat="dd/mm/yy"
          />
          <Calendar
            v-model="endDate"
            showIcon
            :manualInput="false"
            dateFormat="dd/mm/yy"
          />
        </div>
      </div>
    </header>
    <main>
      <div class="chart-badge">
        <Card class="badge active">
          <template #title> Active Contracts </template>
          <template #content>
            <p class="m-0">R$ {{ activeContractsValue }}</p>
            <div class="inner-badge">
              <h4 title="Total clients" class="m-0">
                <i
                  class="pi pi-user"
                  style="color: #00cc00; margin-right: 10px"
                ></i
                >{{ activeClientsTotal }}
              </h4>
              <h4 title="Average value per client" class="m-0">
                <i
                  class="pi pi-chart-line"
                  style="color: #00cc00; margin-right: 10px"
                ></i
                >R$ {{ activeAverageTicketValue }}
              </h4>
            </div>
          </template>
        </Card>
        <Card class="badge cancel">
          <template #title> Canceled Contracts </template>
          <template #content>
            <p class="m-0">R$ {{ canceledContractsValue }}</p>
            <div class="inner-badge">
              <h4 title="Total clients" class="m-0">
                <i
                  class="pi pi-user"
                  style="color: #ff0000; margin-right: 10px"
                ></i
                >{{ canceledClientsTotal }}
              </h4>
              <h4 title="Average value per client" class="m-0">
                <i
                  class="pi pi-chart-line"
                  style="color: #ff0000; margin-right: 10px"
                ></i
                >R$ {{ canceledAverageTicketValue }}
              </h4>
            </div>
          </template>
        </Card>
      </div>
      <div class="container">
        <div class="charts-container">
          <div class="chart-mrr-area chart-title">
            <h3>Monthly Recurring Revenue (MRR)</h3>
            <div ref="chartMrr" class="chart-div"></div>
          </div>
          <div class="chart-churn-area chart-title">
            <h3>Churn Rate</h3>
            <div ref="chartChurn" class="chart-div"></div>
          </div>
        </div>
        <div class="charts-container">
          <div class="chart-Amv-area chart-title">
            <h3>Average Monthly Closed Value</h3>
            <div ref="chartAmv" class="chart-div"></div>
          </div>
          <div class="chart-churn-area chart-title">
            <h3>Amount sold X canceled</h3>
            <div ref="chartAsc" class="chart-div"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Card from "primevue/card";
import Sidebar from "primevue/sidebar";
import { useRouter } from "vue-router";

export default {
  name: "InsightsCharts",
  components: {
    Calendar,
    Button,
    Card,
    Sidebar,
  },
  methods: {
    openGitHub() {
      window.open("https://github.com/eimmig/insights", "_blank");
    },
    openLinkedIn() {
      window.open("https://www.linkedin.com/in/eduardoimmig/", "_blank");
    },
    goToHome() {
      this.router.push("/");
    },

    filterDataByDateRange(data, startDate, endDate) {
      const filteredData = data.filter((item) => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return itemDate >= start && itemDate <= end;
      });

      return filteredData;
    },
    setChartData() {
      const filteredMrrData = this.filterDataByDateRange(
        this.dataCharts.dataMrr,
        this.startDate,
        this.endDate
      );
      const filteredChurnData = this.filterDataByDateRange(
        this.dataCharts.dataChurn,
        this.startDate,
        this.endDate
      );
      const filteredAmvData = this.filterDataByDateRange(
        this.dataCharts.dataAmv,
        this.startDate,
        this.endDate
      );
      const filteredAscData = this.filterDataByDateRange(
        this.dataCharts.dataAsc,
        this.startDate,
        this.endDate
      );

      if (this.chartMrr.value && this.chartMrr.value.series) {
        const mrrSeries = this.chartMrr.value.series.getIndex(0);
        mrrSeries.data.setAll(filteredMrrData);
      }

      if (this.chartChurn && this.chartChurn.series) {
        const churnSeries = this.chartChurn.series.getIndex(0);
        churnSeries.data.setAll(filteredChurnData);
      }

      if (this.chartAmv && this.chartAmv.series) {
        const amvSeries = this.chartAmv.series.getIndex(0);
        amvSeries.data.setAll(filteredAmvData);
      }

      if (this.chartAsc && this.chartAsc.series) {
        const ascSeries = this.chartAsc.series.getIndex(0);
        ascSeries.data.setAll(filteredAscData);
      }
    },
  },
  setup() {
    const chartMrr = ref(null);
    const chartChurn = ref(null);
    const chartAmv = ref(null);
    const chartAsc = ref(null);
    const startDate = ref(new Date());
    const endDate = ref(new Date());
    const visible = ref(false);
    const spinnerOn = ref(false);
    const router = useRouter();

    let activeContractsValue = ref(0);
    let activeAverageTicketValue = ref(0);
    let activeClientsTotal = ref(0);
    let canceledContractsValue = ref(0);
    let canceledAverageTicketValue = ref(0);
    let canceledClientsTotal = ref(0);
    let dataCharts = ref(0);

    const getDataCharts = (type) => {
      const sessionStorageData = sessionStorage.getItem("dataForCharts");
      const parsedData = JSON.parse(sessionStorageData);

      switch (type) {
        case "mrr":
          if (sessionStorageData) {
            return parsedData.jsonData.dataMrr;
          } else {
            return [];
          }
        case "cards":
          if (sessionStorageData) {
            const cards = parsedData.jsonData.cards;
            activeContractsValue.value = cards.totalActiveTicket;
            activeAverageTicketValue.value =
              cards.averageValuePerActiveContract;
            activeClientsTotal.value = cards.totalActiveContracts;
            canceledContractsValue.value = cards.totalCanceledTicket;
            canceledAverageTicketValue.value =
              cards.averageValuePerCanceledContract;
            canceledClientsTotal.value = cards.totalCanceledContracts;
            return;
          } else {
            return;
          }
        case "amv":
          if (sessionStorageData) {
            return parsedData.jsonData.dataAvm;
          } else {
            return [];
          }
        case "asc":
          if (sessionStorageData) {
            return parsedData.jsonData.dataAsc;
          } else {
            return [];
          }
        case "churn":
          if (sessionStorageData) {
            return parsedData.jsonData.dataChurn;
          } else {
            return [];
          }
        case "charts":
          return parsedData.jsonData;
        default:
          return null;
      }
    };

    const createChartMrr = (data) => {
      const root = am5.Root.new(chartMrr.value);
      root.setThemes([am5themes_Dark.new(root)]);

      if (!data || data.length === 0) {
        console.error("Missing or empty data.");
        return;
      }

      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelY: "none",
        })
      );

      if (!chart) {
        console.error("Failed to create the chart.");
        return;
      }

      chart.zoomOutButton.set("forceHidden", true);
      chart.get("colors").set("step", 2);

      var xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: "month", count: 1 },
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 90,
            minorGridEnabled: true,
          }),
          tooltip: am5.Tooltip.new(root, {}),
          dateFormats: [
            { period: "fff", format: "MMM dd, yyyy" },
            { period: "ss", format: "MMM dd, yyyy" },
            { period: "mm", format: "MMM dd, yyyy" },
            { period: "hh", format: "MMM dd, yyyy" },
            { period: "DD", format: "MMM dd, yyyy" },
            { period: "WW", format: "MMM dd, yyyy" },
            { period: "MM", format: "MMM dd, yyyy" },
            { period: "YYYY", format: "MMM dd, yyyy" },
          ],
        })
      );

      var valorMedioAxisRenderer = am5xy.AxisRendererY.new(root, {});
      valorMedioAxisRenderer.grid.template.set("forceHidden", true);
      var valorMedioAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: valorMedioAxisRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      var valorAxisRenderer = am5xy.AxisRendererY.new(root, {
        opposite: true,
      });
      valorAxisRenderer.grid.template.set("forceHidden", true);
      var valorAxis = chart.yAxes.push(
        am5xy.DurationAxis.new(root, {
          baseUnit: "minute",
          renderer: valorAxisRenderer,
          extraMax: 0.3,
          forceHidden: true,
        })
      );

      var valorMedioSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: valorMedioAxis,
          valueYField: "value",
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "Full Value of Month R$ {valueY} ",
          }),
        })
      );

      valorMedioSeries.data.processor = am5.DataProcessor.new(root, {
        dateFields: ["date"],
        dateFormat: "MM/yyyy",
      });

      var valorSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis: xAxis,
          yAxis: valorAxis,
          valueYField: "averageValue",
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "Mid Value of Month R$ {valueY.formatNumber('#.00')}",
          }),
        })
      );

      valorSeries.strokes.template.setAll({ strokeWidth: 2 });

      valorSeries.bullets.push(function () {
        var graphics = am5.Rectangle.new(root, {
          width: 10,
          height: 10,
          centerX: am5.p50,
          centerY: am5.p50,
          fill: valorSeries.get("stroke"),
        });

        return am5.Bullet.new(root, {
          sprite: graphics,
        });
      });

      chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          xAxis: xAxis,
          yAxis: valorMedioAxis,
        })
      );

      valorMedioSeries.data.setAll(data);
      valorSeries.data.setAll(data);
      xAxis.data.setAll(data);

      valorMedioSeries.appear(1000);
      chart.appear(1000, 100);
    };

    const createChartChurn = (data) => {
      const root = am5.Root.new(chartChurn.value);
      root.setThemes([am5themes_Dark.new(root)]);

      if (!data || data.length === 0) {
        console.error("Missing or empty data.");
        return;
      }

      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelY: "none",
        })
      );

      if (!chart) {
        console.error("Failed to create the chart.");
        return;
      }

      chart.zoomOutButton.set("forceHidden", true);
      chart.get("colors").set("step", 2);

      var xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: "month", count: 1 },
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 90,
            minorGridEnabled: true,
          }),
          tooltip: am5.Tooltip.new(root, {}),
          dateFormats: [
            { period: "fff", format: "MMM dd, yyyy" },
            { period: "ss", format: "MMM dd, yyyy" },
            { period: "mm", format: "MMM dd, yyyy" },
            { period: "hh", format: "MMM dd, yyyy" },
            { period: "DD", format: "MMM dd, yyyy" },
            { period: "WW", format: "MMM dd, yyyy" },
            { period: "MM", format: "MMM dd, yyyy" },
            { period: "YYYY", format: "MMM dd, yyyy" },
          ],
        })
      );

      var valorMedioAxisRenderer = am5xy.AxisRendererY.new(root, {});
      valorMedioAxisRenderer.grid.template.set("forceHidden", true);
      var valorMedioAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: valorMedioAxisRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      var valorMedioSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: valorMedioAxis,
          valueYField: "churn",
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}% ",
          }),
        })
      );

      valorMedioSeries.data.processor = am5.DataProcessor.new(root, {
        dateFields: ["date"],
        dateFormat: "MM/yyyy",
      });

      chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          xAxis: xAxis,
          yAxis: valorMedioAxis,
        })
      );

      // Use o array de dados diretamente
      valorMedioSeries.data.setAll(data);

      chart.appear(1000, 100);
    };

    const createChartAmv = (data) => {
      const root = am5.Root.new(chartAmv.value);
      root.setThemes([am5themes_Dark.new(root)]);

      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          layout: root.verticalLayout,
          paddingLeft: 0,
        })
      );

      for (var i = 0; i < data.length - 1; i++) {
        data[i].valueNext = data[i + 1].value;
      }

      var xRenderer = am5xy.AxisRendererX.new(root, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
        minGridDistance: 80,
        minorGridEnabled: true,
      });

      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "year",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      xRenderer.grid.template.setAll({
        location: 1,
      });

      xAxis.data.setAll(data);

      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.1,
          }),
        })
      );

      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "year",
        })
      );

      series.columns.template.setAll({
        tooltipText: "R$ {valueY}",
        width: am5.percent(90),
        tooltipY: 0,
      });

      series.data.setAll(data);

      var series2 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "valueNext",
          openValueYField: "value",
          categoryXField: "year",
          fill: am5.color(0x555555),
          stroke: am5.color(0x555555),
        })
      );

      series2.columns.template.setAll({
        width: 1,
      });

      series2.data.setAll(data);

      series2.bullets.push(function () {
        var label = am5.Label.new(root, {
          text: "{valueY}",
          fontWeight: "500",
          fill: am5.color(0x00cc00),
          centerY: am5.p100,
          centerX: am5.p50,
          populateText: true,
        });

        label.adapters.add("text", function (text, target) {
          var percent = getVariancePercent(target.dataItem);
          return percent ? percent + "%" : text;
        });

        label.adapters.add("centerY", function (center, target) {
          return getVariancePercent(target.dataItem) < 0 ? 0 : center;
        });

        // Set dynamic color of the bullet
        label.adapters.add("fill", function (fill, target) {
          return getVariancePercent(target.dataItem) < 0
            ? am5.color(0xcc0000)
            : fill;
        });

        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: label,
        });
      });

      series2.bullets.push(function () {
        var arrow = am5.Graphics.new(root, {
          rotation: -90,
          centerX: am5.p50,
          centerY: am5.p50,
          dy: 3,
          fill: am5.color(0x555555),
          stroke: am5.color(0x555555),
          draw: function (display) {
            display.moveTo(0, -3);
            display.lineTo(8, 0);
            display.lineTo(0, 3);
            display.lineTo(0, -3);
          },
        });

        arrow.adapters.add("rotation", function (rotation, target) {
          return getVariancePercent(target.dataItem) < 0 ? 90 : rotation;
        });

        arrow.adapters.add("dy", function (dy, target) {
          return getVariancePercent(target.dataItem) < 0 ? -3 : dy;
        });

        return am5.Bullet.new(root, {
          locationY: 1,
          sprite: arrow,
        });
      });

      series.appear();
      chart.appear(1000, 100);

      function getVariancePercent(dataItem) {
        if (dataItem) {
          var value = dataItem.get("valueY");
          var openValue = dataItem.get("openValueY");
          var change = value - openValue;
          return Math.round((change / openValue) * 100);
        }
        return 0;
      }
    };

    const createChartAsc = (data) => {
      const root = am5.Root.new(chartAsc.value);

      root.setThemes([am5themes_Dark.new(root)]);

      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          paddingLeft: 0,
          layout: root.verticalLayout,
        })
      );

      var xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 80,
        minorGridEnabled: true,
      });

      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "date",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {
            themeTags: ["axis"],
            animationDuration: 200,
          }),
        })
      );

      xRenderer.grid.template.setAll({
        location: 1,
      });

      xAxis.data.setAll(data);

      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.1,
          }),
        })
      );

      var series0 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Income",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "canceled",
          categoryXField: "date",
          clustered: false,
          tooltip: am5.Tooltip.new(root, {
            labelText: "Canceled contracts {valueY}",
          }),
        })
      );

      series0.columns.template.setAll({
        width: am5.percent(80),
        tooltipY: 0,
        strokeOpacity: 0,
      });

      series0.data.setAll(data);

      var series1 = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Income",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "sold",
          categoryXField: "date",
          clustered: false,
          tooltip: am5.Tooltip.new(root, {
            labelText: "Sold Contracts {valueY}",
          }),
        })
      );

      series1.columns.template.setAll({
        width: am5.percent(50),
        tooltipY: 0,
        strokeOpacity: 0,
      });

      series1.data.setAll(data);

      chart.set("cursor", am5xy.XYCursor.new(root, {}));
      chart.appear(1000, 100);
      series0.appear();
      series1.appear();
    };

    onMounted(() => {
      const dataMrr = getDataCharts("mrr");
      const dataChurn = getDataCharts("churn");
      const dataAmv = getDataCharts("amv");
      const dataAsc = getDataCharts("asc");
      dataCharts.value = getDataCharts("charts");
      createChartMrr(dataMrr);
      createChartChurn(dataChurn);
      createChartAmv(dataAmv);
      createChartAsc(dataAsc);
      getDataCharts("cards");
    });

    return {
      chartMrr,
      chartChurn,
      chartAmv,
      chartAsc,
      startDate,
      endDate,
      visible,
      spinnerOn,
      router,
      activeContractsValue,
      activeAverageTicketValue,
      activeClientsTotal,
      canceledContractsValue,
      canceledAverageTicketValue,
      canceledClientsTotal,
      dataCharts,
    };
  },
};
</script>

<style scoped>
.chart-div {
  width: 100%;
  height: 350px;
  display: flex;
  flex-direction: row;
}

.chart-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}

.change-date-filter {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.chart-badge {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.badge {
  height: 180px;
  align-items: center;
  justify-content: center;
  margin: 10px;
  background-color: #5c5c5c;
  text-align: center;
}

.badge.active {
  border: 1px solid #00cc00;
  color: #00cc00;
}

.badge.cancel {
  border: 1px solid #ff0000;
  color: #ff0000;
}

.badge p {
  font-size: 25px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  margin-top: -5px;
}

.inner-badge {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.charts-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

main {
  display: flex;
  margin: 0 auto;
  padding: 15px;
  position: relative;
  flex-direction: column;
  margin-top: 50px;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  align-items: center;
}
</style>
