import { useEffect, useState, useRef } from "react";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PcpPlot = ({data}) => {

    // const features = ['starting_position',
    // 'final_position', 'points', 'laps', 'fastestLap', 'Lap Time Secs',
    //  'fastestLapSpeed', 'pitstops', 'pit_duration']

     const features = ['circuit_name', 'Lap Time Secs', 'starting_position', 'fastestLapSpeed','pitstops', 'pit_duration',
    'final_position',  'points', 
       ]

       const label_features = {
        'circuit_name' : 'Circuit',
        'Lap Time Secs' : 'Lap Time(s)', 
        'starting_position' : 'Grid Position', 
        'fastestLapSpeed' : 'Fastest Lap(kmph)',
        'pitstops' : 'Pit Stops', 
        'pit_duration' : 'Pit Duration(s)',
      'final_position' : 'Finish Position',  
      'points' : 'Points'
      }


    let constructor_color_map = {
      'Toro Rosso':'#0000FF',
      'Mercedes':'#6CD3BF',
      'Red Bull':'#1E5BC6',
      'Ferrari':'#ED1C24',
      'Williams':'#37BEDD',
      'Force India':'#FF80C7',
      'Virgin':'#c82e37',
      'Renault':'#FFD800',
      'McLaren':'#F58020',
      'Sauber':'#006EFF',
      'Lotus':'#FFB800',
      'HRT':'#b2945e',
      'Caterham':'#0b361f',
      'Lotus F1':'#FFB800',
      'Marussia':'#6E0000',
      'Manor Marussia':'#6E0000',
      'Haas F1 Team':'#B6BABD',
      'Racing Point':'#F596C8',
      'Aston Martin':'#2D826D',
      'Alfa Romeo':'#B12039',
      'AlphaTauri':'#4E7C9B',
      'Alpine F1 Team':'#2293D1'
  }

    // const cluster_colors = data.color
    const width = window.innerWidth - 200, height = 700
    const margin = {top: 20, bottom: 20, left: 20, right: 20};


    const [axisNames, setAxis] = useState(features)

    const axisSpacing = width / axisNames.length;
    const xRange = [margin.left, width - margin.right];
    const yRange = [margin.top, height - margin.bottom];

    const x = d3.scalePoint().domain(axisNames).range(xRange);
    const y = new Map(Array.from(axisNames, axisName => {
      if(axisName != 'circuit_name'){
        return [axisName, d3.scaleLinear(d3.extent(data, d => +d[axisName]), yRange)]
        }
        else{
            const uniqueStates = [... new Set(data.map(e => e['circuit_name']))]
            console.log(uniqueStates)
            return [axisName, d3.scaleBand(uniqueStates, [margin.top, height - margin.bottom])]
        }
    } ));
    
    const line = d3.line()
    .defined(([, value]) => value != null) 
    .x(([axisName]) => x(axisName))
    .y(([axisName, value]) => y.get(axisName)(value));

    const brushWidth = 30;
    const unselectedColor = "#000";

    const svgRef = useRef(0);
    useEffect(() => {

    const brush = d3.brushY().extent([
        [-(brushWidth / 2), margin.top],
        [brushWidth / 2, height - margin.bottom]
        ])
        .on("start brush end", brushed);

    const svg = d3.select(svgRef.current)
        .append('svg')
        .attr("width", width - margin.left-margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .attr("viewBox", [0, 0, width, height+40])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.4)
        .attr("stroke", "white")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("stroke", function (d,i) {
          return constructor_color_map[d.name]
        })
        .attr("d", d => line(d3.cross(axisNames, [d], (axisName, d) => [axisName, d[axisName]])));
   

    svg.append("g")
        .selectAll("g")
        .data(axisNames)
        .join("g")
        .attr("transform", d => `translate(${x(d)}, 0)`)
        .attr("color", "white")
        .each(function(d) { 
            d3.select(this).call(d3.axisLeft(y.get(d))); 
        })
      .call(g => g.append("text")
        .attr("y", height)
        .attr("text-anchor", 'middle')
        .attr("font-weight", "bold")
        .attr("fill", 'white')
        .attr("stroke-width", 1.5)
        .attr("font-size", 14)
        .text(d => label_features[d]))
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "black"))
      .call(brush);

      const selections = new Map();

      function brushed({selection}, axisName) {
        if (selection === null) {
          selections.delete(axisName);
        } else {
          selections.set(axisName, selection.map(y.get(axisName).invert));
        }
        const selected = [];
        path.each(function(d,i) {
          const active = Array.from(selections).every(([axisName, [min, max]]) => d[axisName] >= min && d[axisName] <= max);
          d3.select(this).style("stroke", active ? constructor_color_map[d.name] : unselectedColor);
          if (active) {
            d3.select(this).raise();
            selected.push(d);
          }
        });
        svg.property("value", selected).dispatch("input");
    }

    },[data]) 
    // d3.select("svg").remove()

    return (
        <div
            ref={svgRef}>
        </div>
    )
}

export default PcpPlot