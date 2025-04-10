import React from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale);

function accumulateBookings(dstArray, bookingData, sum, index) {
  if (index >= dstArray.length) {
    return dstArray;
    
  }
  const threshold = new Date();
  threshold.setTime(threshold.getTime() - (6-index)*(24*60*60*1000));
  const dayBookings = new Array(0);
  const remainder = new Array(0);
  for (let i = 0; i < bookingData.length; ++i) {
    const date = new Date(bookingData[i].created_at);
    const selection = date < threshold ? 
      dayBookings : remainder;
    selection.push(bookingData[i]);
  }
  sum += dayBookings.length;
  dstArray[index] = {
    id: index,
    bookings: sum,
  };
  return accumulateBookings(dstArray, remainder, sum, index+1);;
}

// The `props` parameter contains all information necessary to 
// generate a graph.
export function Graph({ bookingData, className }) {
  const weekStatistics = accumulateBookings([...Array(7).keys()],
    bookingData, 0, 0);
  const chartConfig = {
    labels: [...Array(5).keys()].map((index) => 
      `${6-index} days ago`).concat(["Yesterday",])
      .concat(["Today",]),
    datasets: [
      {
        label: "Bookings",
        data: weekStatistics.map((data) => data.bookings),
        borderColor: "black",
        borderWidth: 2
      }
    ]
  }
  
  return <div className={className}>
    <Line
        data={chartConfig}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Bookings Over The Last Week"
            }
          },
          scales: {
            y: {
              ticks: {
                precision: 0,
                min: 0,
                max: weekStatistics.pop(),
              }
            }
          }
        }}
      />
  </div>
}