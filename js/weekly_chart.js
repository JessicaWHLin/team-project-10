
// const CWB_API_KEY="CWB-840CF1E7-FC59-4E06-81C9-F4BB79253855";

let chartContainer1=document.querySelector(".long-box-1");
chartContainer1.classList.add("chartContainer");
let showCityName=document.createElement("span");
chartContainer1.appendChild(showCityName);

//line chart
let canvasLineChart=document.createElement("canvas");
canvasLineChart.id="lineChart";
canvasLineChart.classList.add("canvasChart");
chartContainer1.appendChild(canvasLineChart);
//bar chart UV Index
let chartContainer2=document.querySelector(".long-box-2");
chartContainer2.classList.add("chartContainer");
let canvasBarChart_UV=document.createElement("canvas");
canvasBarChart_UV.id="barChart_UV";
canvasBarChart_UV.classList.add("canvasChart");

chartContainer2.appendChild(canvasBarChart_UV);
//bar chart rain pop
let chartContainer3=document.querySelector(".long-box-3");
chartContainer3.classList.add("chartContainer");
let canvasBarChart_Rain=document.createElement("canvas");
canvasBarChart_Rain.id="barChart_Rain";
canvasBarChart_UV.classList.add("canvasChart");
chartContainer3.appendChild(canvasBarChart_Rain);


//函式區
export async function weekly_chart(cityName){
	showCityName.textContent=cityName;
	
	let url=`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${CWB_API_KEY}&locationName=${cityName}`;
 	fetch(url)

	.then(response=>{
		return response.json();
	}).then((data)=>{
		let weeklyData=data.records.locations[0].location[0].weatherElement;


		// console.log(weeklyData);

		//溫度
		let avgT=weeklyData[1].time;
		let maxT=weeklyData[12].time;
		let minT=weeklyData[8].time;
		let avgT_list=get_data_list(avgT);
		let maxT_list=get_data_list(maxT);
		let minT_list=get_data_list(minT);
		//降雨機率
		let rainPop=weeklyData[0];
		let rainPop_list=rainPop_daily(rainPop);

		//紫外線
		let UVI=weeklyData[9];

		let UVI_list=get_data_list(UVI.time);

		createLineChart(avgT_list[0],avgT_list[1],maxT_list[1],minT_list[1]);
		createBarChart("barChart_UV",UVI_list[0],UVI_list[1]);
		createBarChartForRain("barChart_Rain",rainPop_list[0],rainPop_list[1]);
		

	}).catch(error=>{
		console.log("error:", error);
	});
}

function date(originString){
	let date=new Date(originString);
	let month=(date.getMonth()+1).toString().padStart(2,"0");
	let day=date.getDate().toString().padStart(2,"0");
	let formattedDate=`${month}/${day}`;
	return formattedDate;
}


function createLineChart(labels,avgT,maxT,minT){

	new Chart("lineChart",{

		type:"line",
		data:{
			labels:labels,
			datasets:[
			// 	{
			// 	label:"均溫",
			// 	data:avgT,
			// 	backgroundColor:"rgba(188, 226, 235, 1)",
			// 	borderColor:"rgba(188, 226, 235, 1)",
			// 	fill:true,
			// 	pointRadius: 2,
			// 	pointHoverRadius: 5,
			// 	borderWidth:1//線段寬度,default=3
			// },
			{
				label:"最高溫度",
				data:maxT,
				backgroundColor:"#F56A01",
				borderColor:"#F56A01",
				fill:false,
				pointRadius: 4,
				pointHoverRadius: 6,
				borderWidth:3//線段寬度,default=3
			},
			{
				label:"最低溫度",
				data:minT,
				backgroundColor:"#5C9CE5",
				borderColor:"#5C9CE5",
				fill:false,
				pointRadius: 4,
				pointHoverRadius: 6,
				borderWidth:3//線段寬度,default=3
			}
		]

	},
		
		options:{

			maintainAspectRatio: false,

			responsive: true,
			legend:{display:true}, //是否顯示圖例
			scales:{
				yAxes: [

					{ticks: {min: 24, max:40},
					gridLines: {display:false}
				}

				],
				xAxes: [{
					gridLines: {
							display:false
					}
			}],
			},
			layout:{padding:{left:10,right:10}},
		}
	})
}

function get_data_list(rawDataList){
	let startTime=[];
	let T_list=[];
	let temp="";
	for(let i=0;i<rawDataList.length;i++){
		if(date(rawDataList[i].startTime)!=temp){
			temp=date(rawDataList[i].startTime);
			startTime.push(temp);
		}
		else{
			let blank ="";
			startTime.push(blank);
		}
		T_list.push(rawDataList[i].elementValue[0].value);
	}
	let result=[startTime,T_list];
	return result;
}

function rainPop_daily(list1){
	let rainPop=[];
	let date=[];
	let startTime_list=get_data_list(list1.time);
	for (let i=0;i<startTime_list[0].length;i++){
		if(startTime_list[0][i]!=""){
			date.push(startTime_list[0][i]);
			rainPop.push(startTime_list[1][i]);
		}
	}
	let result=[date,rainPop];
	return result;

}
function createBarChart(id,labels,data){
	//氣象局資料空值
	if(data==""){
		data=[2,4,6,8,10,12,14];
		labels=["7/18","7/19","7/20","7/21","7/22","7/23","7/24"];
	}
	let barColors=assignColor(data);
	// console.log(barColors);
	new Chart(id,{
		type:"bar",
		data:{
			labels:labels,
			datasets:[{
				backgroundColor:barColors,
				data:data
			}]
			},
			options:{
				maintainAspectRatio: false,
				responsive: true,
				legend:{display:false},
				scales:{
					xAxes: [{
						gridLines: {
								display:false
						}
				}],
					yAxes: [{
						gridLines: {
								display:false
						},
						ticks: {
							min: 0,
							max: 16
						}
					}],
				},
				layout:{padding:{left:10,right:10}},
			}
	});
}

function assignColor(data){
	let result=[];
	for(let i=0;i<data.length;i++){
		if(data[i]>=1 && data[i]<=2){
			result.push("#90ee90");//綠色
		}
		else if(data[i]>2 &&data[i]<=5){
			result.push("#bdb76b");//黃色
		}
		else if(data[i]>5 && data[i]<=7){
			result.push("#cd853f");// 黃橘
		}
		else if(data[i]>7 && data[i]<=10){
			result.push("#d2691e"); //深橘
		}
		else{
			result.push("#b22222");//紅色		
			}
	}
	return result;

}

function createBarChartForRain(id,labels,data){
	new Chart(id,{
		type:"bar",
		data:{
			labels:labels,
			datasets:[{
				backgroundColor:"grey",
				data:data
			}]
			},
			options:{
				maintainAspectRatio: false,
				responsive: true,
				legend:{display:false},
				scales:{
					xAxes: [{
						gridLines: {
								display:false
						}
				}],
					yAxes: [{
						gridLines: {
								display:false
						},
						// ticks: {
						// 	min: 0,
						// 	max: 100
						// }
					}],
				},
				layout:{padding:{left:10,right:10}},
			}
	});

}