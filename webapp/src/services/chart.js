import { useEffect } from "react";
import styles from "assets/generic/scss/components/_variables.scss";
import moment from "moment";
import { copyDeep } from "services/utils";

export const dashboardPanelChart = {
  options: {
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    maintainAspectRatio: false,
    animation: false,
    tooltips: {
      backgroundColor: styles.chartBackground,
      titleFontColor: styles.chartTitleFontColor,
      bodyFontColor: styles.chartFontColor,
      bodySpacing: 4,
      xPadding: 12,
      mode: "nearest",
      intersect: 0,
      position: "nearest",
    },
    legend: {
      position: "chartArea",
      fillStyle: styles.chartBackground,
      display: true,
      labels: {
        boxWidth: 16,
      },
    },
    scales: {
      yAxes: [
        {
          ticks: {
            fontColor: "rgba(0,0,0,0.4)",
            fontStyle: styles.chartFontStyle,
            beginAtZero: true,
            stepSize: 1,
            maxTicksLimit: 5,
            padding: 10,
          },
          gridLines: {
            drawTicks: true,
            drawBorder: false,
            display: true,
            color: "rgba(0,0,0,0.1)",
            zeroLineColor: "transparent",
          },
        },
      ],
      xAxes: [
        {
          gridLines: {
            display: false,
          },
          ticks: {
            padding: 10,
            fontColor: "rgba(0,0,0,0.4)",
            fontStyle: styles.chartFontStyle,
          },
        },
      ],
    },
  },
};

const basicDatasetOptions = {
  pointHoverRadius: 0.5,
  pointRadius: 0.5,
  pointStyle: "line",
};

export const datasetOptions = [
  {
    borderColor: styles.primaryColor,
    backgroundColor: styles.primaryColorTransparent,
    borderWidth: 2,
    order: 0,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.orangeColor,
    backgroundColor: styles.orangeTransparentColor,
    borderWidth: 2,
    order: 1,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.transparent,
    backgroundColor: styles.fourthLineTransparent,
    offset: true,
    order: 2,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.transparent,
    backgroundColor: styles.darkenOrangeTransparent,
    offset: true,
    order: 3,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.transparent,
    backgroundColor: styles.primaryColorTransparent,
    offset: true,
    order: 4,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.transparent,
    backgroundColor: styles.darkenFirstLine,
    offset: true,
    order: 5,
    ...basicDatasetOptions,
  },
  {
    borderColor: styles.greenColor,
    borderWidth: 1,
    fill: false,
    order: 6,
    ...basicDatasetOptions,
  },
];

const i = {
  instant: {
    n: 1,
    s: "minutes",
    f: (x) => {
      return x.asMinutes();
    },
  },
  interval1: {
    n: 10,
    s: "minutes",
    f: (x) => {
      return x.asMinutes();
    },
  },
  interval2: {
    n: 1,
    s: "hour",
    f: (x) => {
      return x.asHours();
    },
  },
  interval3: {
    n: 6,
    s: "hour",
    f: (x) => {
      return x.asHours();
    },
  },
  interval4: {
    n: 6,
    s: "hour",
    f: (x) => {
      return x.asHours();
    },
  },
};

const returnMin = (interval) => {
  const timeNow = new Date();
  const i = {
    instant: { n: 1, s: "hour" },
    interval1: { n: 1, s: "day" },
    interval2: { n: 1, s: "week" },
    interval3: { n: 2, s: "week" },
    interval4: { n: 1, s: "month" },
  };
  return moment(timeNow).subtract(i[interval].n, i[interval].s).toISOString();
};

const fillDataFrontIfNeeded = (data, interval, min, maxDiff) => {
  const firstElementTime = data[0].bucket ? data[0].bucket : data[0].time;
  const diffWithMin = i[interval].f(
    moment.duration(moment(firstElementTime).diff(moment(min)))
  );
  if (diffWithMin > maxDiff) {
    let objectCopy = copyDeep(data[0]);
    for (const [key] of Object.entries(objectCopy)) {
      if (key === "bucket")
        objectCopy[key] = moment(data[0].bucket)
          .subtract(i[interval].n, i[interval].s)
          .toISOString();
      else if (key === "time")
        objectCopy[key] = moment(data[0].time)
          .subtract(i[interval].n, i[interval].s)
          .toISOString();
      else objectCopy[key] = null;
    }
    data.unshift(objectCopy);
    fillDataFrontIfNeeded(data, interval, min, maxDiff);
  }
};

const fillDataEndIfNeeded = (data, interval, max, maxDiff) => {
  const lastElementTime = data[data.length - 1].bucket
    ? data[data.length - 1].bucket
    : data[data.length - 1].time;
  const DiffWithMax = i[interval].f(
    moment.duration(moment(max).diff(moment(lastElementTime)))
  );
  if (DiffWithMax > maxDiff) {
    let objectCopy = copyDeep(data[data.length - 1]);
    for (const [key] of Object.entries(objectCopy)) {
      if (key === "bucket")
        objectCopy[key] = moment(data[data.length - 1].bucket)
          .add(i[interval].n, i[interval].s)
          .toISOString();
      else if (key === "time")
        objectCopy[key] = moment(data[data.length - 1].time)
          .add(i[interval].n, i[interval].s)
          .toISOString();
      else objectCopy[key] = null;
    }
    data.push(objectCopy);
    fillDataEndIfNeeded(data, interval, max, maxDiff);
  }
};

const fillDataMiddleIfNeeded = (data, interval, maxDiff) => {
  for (let j = 1; j < data.length; j++) {
    const currentElementTime = data[j].bucket ? data[j].bucket : data[j].time;
    const diffBetweenTwoEl = moment
      .duration(moment(currentElementTime).diff(moment(data[j - 1].bucket)))
      .asHours();
    if (diffBetweenTwoEl > maxDiff) {
      let objectCopy = copyDeep(data[j]);
      for (const [key] of Object.entries(objectCopy)) {
        if (key === "bucket") {
          objectCopy[key] = moment(data[j - 1].bucket)
            .add(i[interval].n, i[interval].s)
            .toISOString();
        } else if (key === "time")
          objectCopy[key] = moment(data[j - 1].time)
            .add(i[interval].n, i[interval].s)
            .toISOString();
        else objectCopy[key] = null;
      }
      data.splice(j, 0, objectCopy);
      fillDataMiddleIfNeeded(data, interval, maxDiff);
    }
  }
};

const fillMissingData = (data, interval) => {
  const min = returnMin(interval);
  const max = new Date();
  const maxDiff = i[interval].n;
  fillDataFrontIfNeeded(data, interval, min, maxDiff);
  fillDataEndIfNeeded(data, interval, max, maxDiff);
  fillDataMiddleIfNeeded(data, interval, maxDiff);
};

export const formatTime = (interval, data) => {
  data = new Date(data);
  let month =
    data.getMonth() < 9 ? "0" + (data.getMonth() + 1) : data.getMonth() + 1;
  let day = data.getDate() < 10 ? "0" + data.getDate() : data.getDate();
  let hours = data.getHours() < 10 ? "0" + data.getHours() : data.getHours();
  let minutes =
    data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes();
  let seconds =
    data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds();

  switch (interval) {
    case "interval2":
    case "interval3":
      return day + " " + hours + ":" + minutes;
    case "interval4":
      return month + " " + day + " " + hours + ":" + minutes;
    default:
      return hours + ":" + minutes + ":" + seconds;
  }
};

export const formDatasets = (dataLabels, interval, data) => {
  let realChartData = {};
  if (data.length > 1) fillMissingData(data, interval);
  realChartData.labels = data.map((element) =>
    formatTime(interval, element.bucket ? element.bucket : element.time)
  );
  let rawDatasets = [];
  for (let i = 0; i < dataLabels.length; i++) {
    rawDatasets[i] = [];
    data.map((dataObject) => {
      Object.keys(dataObject).forEach((key) => {
        if (key === dataLabels[i]) {
          rawDatasets[i].push(dataObject[key]);
        }
      });
    });
  }
  realChartData.datasets = [];
  rawDatasets.forEach((rawDataset, i) => {
    realChartData.datasets[i] = {};
    realChartData.datasets[i].data = rawDataset;
    realChartData.datasets[i].label = dataLabels[i];
  });
  return realChartData;
};

export const useOutsideClick = (ref, callback) => {
  const listener = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  });
};

export default {
  dashboardPanelChart,
  datasetOptions,
  formatTime,
  formDatasets,
  useOutsideClick,
};
