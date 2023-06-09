import React, { useEffect, useRef , useState} from 'react'
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"
import { Grid } from '@mui/material';

const Piechartplot = ({MdsData, driverData, selectedDriver}) => {
    
    // console.log(MdsData)
    const svgref = useRef(); 
    const [nation, setNation] = useState("");

    const clearChart=()=>{
      const accessToRef = d3.select(svgref.current)
      accessToRef.selectAll("svg").remove();
  }

    useEffect(() => {
      clearChart()
      d3.filter(driverData, function(d) {
        if(d.driver_name == selectedDriver) {
          setNation(d.driver_nationality);
          // console.log(d)
        } 
       
      })
        PieChart(MdsData, {
            name: d => d.nationality? d.nationality : d.constructor_nationality,
            value: d => +d.count,
            width: window.innerHeight/3,
            height: window.innerHeight/3
          })

          
        
        
        // console.log(nation)
        
        // console.log(chart)
    
    }, [selectedDriver, nation])
    

    function PieChart(data, {
        name = ([x]) => x,  // given d in data, returns the (ordinal) label
        value = ([, y]) => y, // given d in data, returns the (quantitative) value
        title, // given d in data, returns the title text
        width = 300, // outer width, in pixels
        height = 300, // outer height, in pixels
        innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
        outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
        labelRadius = (innerRadius * 0.2 + outerRadius * 0.73), // center radius of labels
        format = ",", // a format specifier for values (in the label)
        names, // array of names (the domain of the color scale)
        colors, // array of colors for names
        stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
        strokeWidth = 1, // width of stroke separating wedges
        strokeLinejoin = "round", // line join of stroke separating wedges
        padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
      } = {}) {
         
        // Compute values.
        const N = d3.map(data, name);
        const V = d3.map(data, value);
        const I = d3.range(N.length).filter(i => !isNaN(V[i]));
      
        // Unique the names.
        if (names === undefined) names = N;
        names = new d3.InternSet(names);
      
        // Chose a default color scheme based on cardinality.
        if (colors === undefined) colors = d3.schemeSpectral[names.size];
        if (colors === undefined) colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);
      
        // Construct scales.
        const color = d3.scaleOrdinal(names, colors);
      
        // Compute titles.
        if (title === undefined) {
          const formatValue = d3.format(format);
          title = i => `${N[i]}`;
        } else {
          const O = d3.map(data, d => d);
          const T = title;
          title = i => T(O[i], i, data);
        }
       
        // Construct arcs.
        const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i]+3)(I);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
        
        const svg = d3.select(svgref.current);

        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

            svg.append("text")
            .attr("class", "axisLabel")
            .attr("text-anchor", "middle")
          .attr("x", width/2) 
          .attr("y", height+20) 
          .text("Teams")
      
        svg.append("g")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-linejoin", strokeLinejoin)
          .selectAll("path")
          .data(arcs)
          .join("path")
            .attr("fill", d => color(N[d.data]))
            
            .attr("d", arc)
            .attr("opacity", function(d) {
              if(nation === "") return 1;
              if(nation == N[d.index]) {
                // console.log(d);
                return 1
              } 
              return 0.1
              // return N[d.index] == nation ? 1 : 0.2
            } )
          .append("title")
            .text(d => title(d.data));
      
        svg.append("g")
            .attr("font-family", "Montserrat")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
          .selectAll("text")
          .data(arcs)
          .join("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
          .selectAll("tspan")
          .data(d => {
            const lines = `${title(d.data)}`.split(/\n/);
            return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
          })
          .join("tspan")
            .attr("x", 0)
            .attr("y", (_, i) => `${i * 1.1}em`)
            .attr("font-weight", (_, i) => i ? null : "bold")
            .text(d => d);


            


        
            //return Object.assign(svg.node(), {scales: {color}});
      }

    return(
        <div style={{padding: 20}}>
            <svg ref={svgref}>
            </svg>
            <div id="label">Driver Nationality</div>
        </div>
        
    );
};


export default Piechartplot;