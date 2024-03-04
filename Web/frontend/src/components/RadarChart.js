import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';



const RadarChart = ({dataUser, dataAvg, name}) => {
  ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );
  
  const data = {
    labels: ['Clear', 'Concise', 'Concrete', 'Correct', 'Coherent', 'Complete', 'Courteous'],
    datasets: [
        {
          label: `${name} 님`,
          data: dataUser,
          backgroundColor: 'rgba(242, 173, 0, 0.2)', // #FAE3A9
          borderColor: 'rgba(242, 173, 0, 1)',
          pointBackgroundColor: 'rgba(236, 206, 131, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(236, 206, 131, 1)',
        },
        {
          label: '평균',
          data: dataAvg,
          backgroundColor: 'rgba(179, 181, 198, 0.2)',
          borderColor: 'rgba(179, 181, 198, 1)',
          pointBackgroundColor: 'rgba(179, 181, 198, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179, 181, 198, 1)',
        },
      ],
    };

  const maxScore = Math.ceil(Math.max(...[...dataUser, ...dataAvg]) / 10);
  const colorList = Array.from({ length: maxScore+1 }, (_, index) => index < maxScore ? '#ccc' : '#888');

  const options = {
    scales: {
      r: { // https://www.chartjs.org/docs/latest/axes/radial/
        beginAtZero: true,
        angleLines: {
          color: 'gray'
        },
        grid: {
          color: colorList
        },
        pointLabels: { // https://www.chartjs.org/docs/latest/axes/radial/#point-labels
          color: 'black',
        },
      }
    },

  };

  return <Radar data={data} options={options} />;
};

export default RadarChart;