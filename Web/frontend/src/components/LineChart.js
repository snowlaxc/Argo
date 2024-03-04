import "./LineChart.css";
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );



const LineChart = ({data, cat}) => {
    const { user } = useContext(AuthContext);
    const [displaydata, setDisplaydata] = useState({});
    const [option, setOption] = useState({});
    const color = ['#FA9DA3', '#FAE3A9', '#BDD98E', '#9DC2ED', '#E2ACF5'];
    const catN2S = ["occupation", "communication", "commonsense", "tools", "ethic"];

    const getDictData = (nestedJsonData, dynamicPath) => {
        let value = nestedJsonData;
        for (const path of dynamicPath) {
        value = value[path];
        }
        return value
    }

    const convertTimestampToTime2 = (timestamp) => {

        const dateObject = new Date(timestamp);

        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');

        const day = dateObject.getDate().toString().padStart(2, '0');

        // 시, 분, 초를 문자열로 반환
        const formattedTime = `${year}.${month}.${day}`;

        return formattedTime;
      }

        // data[catN2S[cat], 'time'],
    useEffect(() => {
        // console.log(getDictData(data, [catN2S[cat], 'score']));
        let tempdata = {}
        if (getDictData(data, [catN2S[cat], 'score']).length > 0) {
          tempdata = {
            // labels: data[catN2S[cat], 'time'],

              labels: getDictData(data, [catN2S[cat], 'time']).map(elem => convertTimestampToTime2(elem)),
              datasets: [
                {
                  label: `${user.name} 님`,
                  data: getDictData(data, [catN2S[cat], 'score']),
                  borderColor: `${color[cat]}`,
                  backgroundColor: `${color[cat]}`,
                },
                {
                  label: 'avg',
                  data: getDictData(data, [catN2S[cat], 'avg']),
                  borderColor: '#ccc',
                  backgroundColor: '#ccc',
                },
              ],
          };
        }
        else {
          tempdata = {
            // labels: data[catN2S[cat], 'time'],

              labels: getDictData(data, [catN2S[cat], 'time']).map(elem => convertTimestampToTime2(elem)),
              datasets: [
                {
                  label: `${user.name} 님`,
                  data: getDictData(data, [catN2S[cat], 'score']),
                  borderColor: `${color[cat]}`,
                  backgroundColor: `${color[cat]}`,
                },
              ],
          };
        }



        const tempoptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white', // legend 텍스트 색상
                    },
                },
                title: {
                    display: true,
                    text: `${user.name} 님의 학습 그래프`,
                    color: 'white',
                    fontSize: 32,
                },
            },
            scales: {
                x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.8)', // x 축의 그리드 색상
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.8)', // x 축의 눈금 색상
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.8)', // y 축의 그리드 색상
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.8)', // y 축의 눈금 색상
                    },
                  },
              }
        };
        setDisplaydata(tempdata);
        setOption(tempoptions);

    }, [cat]);




    return (
        <div className="line_chart_wrapper">
            <div className="line_chart_wrapper2">{Object.keys(displaydata).length > 0 &&<Line options={option} data={displaydata} />}</div>
            {/* height={200}  */}
        </div>
    );
};

export default LineChart;