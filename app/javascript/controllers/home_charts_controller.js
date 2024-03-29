import { Controller } from "@hotwired/stimulus";
import * as echarts from 'echarts';
import { format, parseISO, intervalToDuration, formatDuration } from 'date-fns'

const COLOR_PALLETE = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

export default class extends Controller {
  static values = {
    daily: Array,
    range: String,
    todayTotal: Number,
    yesterdayTotal: Number,
    periodTotal: Number,
    languages: Object
  }

  connect() {
    this.setProjectColors();
    this.buildDailyTimePerProjectChart('dailyTimePerProjectChart');
    this.buildDailyTimePerLanguageChart('dailyTimePerLanguageChart');
    this.buildTotalsChart('totalsChart');
    this.buildLanguagesPieChart('languagesPieChart');
    this.buildProjectsPieChart('projectsPieChart');
  }

  setProjectColors() {
    this.projectColors = {}

    this.dailyValue.forEach(day => {
      Object.entries(day[2]).forEach(([key]) => {
        const keys = Object.keys(this.projectColors);
        if (!keys.includes(key)) {
          this.projectColors[key] = COLOR_PALLETE[keys.length];
        }
      })
    });
  }

  buildDailyTimePerProjectChart(elementId) {
    const dailyTimeChart  = echarts.init(document.getElementById(elementId));

    const totalTimeByProject = {};
    this.dailyValue.forEach(day => {
      Object.entries(day[2]).forEach(([key]) => {
        totalTimeByProject[key] = Array(this.dailyValue.length).fill(null);
      })
    });
    this.dailyValue.forEach((day, index) => {
      Object.entries(day[2]).forEach(([key, value]) => {
        totalTimeByProject[key][index] = value;
      })
    });

    dailyTimeChart.setOption({
      title: {
        text: `Total Time in ${this.rangeValue} (per project)`,
        left: 'center',
      },
      xAxis: {
        data: this.dailyValue.map((value) => format(parseISO(value[0]), 'MMM d'))
      },
      yAxis: { show: false },
      series: [
        {
          name: 'total',
          type: 'line',
          data: this.dailyValue.map((value) => value[1]),
          tooltip: {
            valueFormatter: (value) => value && this.formatDuration(value)
          }
        },
        ...Object.entries(totalTimeByProject).map(([key, value]) => ({
          type: 'bar',
          name: key,
          stack: 'total',
          data: value,
          emphasis: {
            focus: 'series'
          },
          areaStyle: {},
          tooltip: {
            valueFormatter: (value) => value && this.formatDuration(value)
          },
          connectNulls: false,
          itemStyle: { color: this.projectColors[key] }
        }))
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
      },

    })

    if (elementId !== 'fullscreenChart') {
      dailyTimeChart.on('dblclick', () => {
        echarts.dispose(document.getElementById('fullscreenChart'));
        document.getElementById('trigger-modal').click();
        this.buildDailyTimePerProjectChart('fullscreenChart');
      })
    }
  }

  buildDailyTimePerLanguageChart(elementId) {
    const dailyTimeChart  = echarts.init(document.getElementById(elementId));

    const totalTimeByLang = {};
    this.dailyValue.forEach(day => {
      Object.entries(day[3]).forEach(([key]) => {
        totalTimeByLang[key] = Array(this.dailyValue.length).fill(null);
      })
    });
    this.dailyValue.forEach((day, index) => {
      Object.entries(day[3]).forEach(([key, value]) => {
        totalTimeByLang[key][index] = value;
      })
    });

    dailyTimeChart.setOption({
      title: {
        text: `Total Time in ${this.rangeValue} (per language)`,
        left: 'center',
      },
      xAxis: {
        data: this.dailyValue.map((value) => format(parseISO(value[0]), 'MMM d'))
      },
      yAxis: { show: false },
      series: [
        {
          name: 'total',
          type: 'line',
          data: this.dailyValue.map((value) => value[1]),
          tooltip: {
            valueFormatter: (value) => value && this.formatDuration(value)
          }
        },
        ...Object.entries(totalTimeByLang).map(([key, value]) => ({
          type: 'bar',
          name: key,
          stack: 'total',
          data: value,
          emphasis: {
            focus: 'series'
          },
          areaStyle: {},
          tooltip: {
            valueFormatter: (value) => value && this.formatDuration(value)
          },
          connectNulls: false,
          itemStyle: { color: this.languagesValue[key] }
        }))
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
      },
    })

    if (elementId !== 'fullscreenChart') {
      dailyTimeChart.on('dblclick', () => {
        echarts.dispose(document.getElementById('fullscreenChart'));
        document.getElementById('trigger-modal').click();
        this.buildDailyTimePerLanguageChart('fullscreenChart');
      })
    }
  }

  buildTotalsChart(elementId) {
    const totalsChart = echarts.init(document.getElementById(elementId));
    totalsChart.setOption({
      title: {
        text: 'Total Time',
        left: 'center',
      },
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          max: Math.max(this.todayTotalValue, this.yesterdayTotalValue, this.periodTotalValue) + 1000,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: '#464646'
            }
          },
          axisLine: {
            lineStyle: { width: 40, color: [[1, 'white']] },
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          title: { fontSize: 14 },
          detail: {
            width: 50,
            height: 14,
            fontSize: 13,
            color: 'inherit',
            formatter: this.formatDuration,
          },
          data: [
            {
              name: 'Today',
              value: this.todayTotalValue,
              title: {
                offsetCenter: ['0%', '-50%'],
                fontWeight: 'bold',
                color: '#4e79a7'
              },
              detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '-40%'],
                color: '#4e79a7',
              },
              itemStyle: {
                color: '#4e79a7'
              }
            },
            {
              name: 'Yesterday',
              value: this.yesterdayTotalValue,
              title: {
                offsetCenter: ['0%', '-20%'],
                fontWeight: 'bold',
                color: '#76b7b2'
              },
              detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '-10%'],
                color: '#76b7b2'
              },
              itemStyle: {
                color: '#76b7b2'
              }
            },
            {
              name: 'Mean in Period',
              value: this.periodTotalValue,
              title: {
                offsetCenter: ['0%', '10%'],
                fontWeight: 'bold',
                color: '#9c755f'
              },
              detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '20%'],
                color: '#9c755f'
              },
              itemStyle: {
                color: '#9c755f'
              }
            },

          ]
        }
      ]
    })

    if (elementId !== 'fullscreenChart') {
      totalsChart.on('dblclick', () => {
        echarts.dispose(document.getElementById('fullscreenChart'));
        document.getElementById('trigger-modal').click();
        this.buildTotalsChart('fullscreenChart');
      })
    }
  }

  buildLanguagesPieChart(elementId) {
    const data = {};
    this.dailyValue.forEach(day => {
      const languages = day[3];
      if (!languages) return;
      Object.entries(languages).forEach(([key, value]) => {
        data[key] = (data[key] || 0) + value;
      })
    });
    const dataArray =  Object.entries(data).map(([key, value]) => ({
      name: key, value, itemStyle: { color: this.languagesValue[key] }
    }));
    const languagesPieChart  = echarts.init(document.getElementById(elementId));

    languagesPieChart.setOption({
      title: {
        text: 'Total in period (per language)',
        left: 'center',
        top: '0'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => `${params.data.name} <br/> ${this.formatDuration(params.value)} (${params.percent}%)`
      },
      legend: {
        orient: 'vertical',
        top: '10%',
        right: '10%',
        type: 'scroll',
      },
      series: [
        {
          name: 'Language',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '30',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: dataArray
        }
      ]
    })

    if (elementId !== 'fullscreenChart') {
      languagesPieChart.on('dblclick', () => {
        echarts.dispose(document.getElementById('fullscreenChart'));
        document.getElementById('trigger-modal').click();
        this.buildLanguagesPieChart('fullscreenChart');
      })
    }
  }

  buildProjectsPieChart(elementId) {
    const data = {};
    this.dailyValue.forEach(day => {
      const projects = day[2];
      if (!projects) return;
      Object.entries(projects).forEach(([key, value]) => {
        data[key] = (data[key] || 0) + value;
      })
    });
    const dataArray =  Object.entries(data).map(([key, value]) => ({
      name: key, value, itemStyle: { color: this.projectColors[key] }
    }));
    const projectsPieChart  = echarts.init(document.getElementById(elementId));

    projectsPieChart.setOption({
      title: {
        text: 'Total in period (per project)',
        left: 'center',
        top: '0'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => `${params.data.name} <br/> ${this.formatDuration(params.value)} (${params.percent}%)`
      },
      legend: {
        orient: 'vertical',
        top: '10%',
        right: '10%',
        type: 'scroll',
      },
      series: [
        {
          name: 'Language',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['30%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: dataArray
        }
      ]
    })

    if (elementId !== 'fullscreenChart') {
      projectsPieChart.on('dblclick', () => {
        echarts.dispose(document.getElementById('fullscreenChart'));
        document.getElementById('trigger-modal').click();
        this.buildProjectsPieChart('fullscreenChart');
      })
    }
  }

  formatDuration(duration) {
    return formatDuration(intervalToDuration({ start: 0, end: duration * 1000 }))
      .replace(/hour[s]*/, 'h')
      .replace(/minute[s]*/, 'm')
      .replace(/second[s]*/, 's')
  }
};
