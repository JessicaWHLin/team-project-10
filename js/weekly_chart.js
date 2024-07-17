
// const CWB_API_KEY="CWB-840CF1E7-FC59-4E06-81C9-F4BB79253855";
let city="花蓮縣";
let chartContainer=document.querySelector(".long-box-1");
chartContainer.textContent="折線圖: "+city+"一周預報";
chartContainer.classList.add("chartContainer");
let canvas=document.createElement("canvas");
canvas.id="chart";
canvas.classList.add("canvas");
chartContainer.appendChild(canvas);

//table
let tableContainer=document.createElement("table");
tableContainer.classList.add("tableContainer");
chartContainer.appendChild(tableContainer);

weekly_chart(city);



//函式區
function weekly_chart(city){
	let url=`https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=${CWB_API_KEY}&locationName=${city}`
	fetch(url)
	.then(response=>{
		return response.json();
	}).then((data)=>{
		let weeklyData=data.records.locations[0].location[0].weatherElement;
		console.log(weeklyData);
		//溫度
		let avgT=weeklyData[1].time;
		let maxT=weeklyData[12].time;
		let minT=weeklyData[8].time;
		let avgT_list=get_data_list(avgT);
		let maxT_list=get_data_list(maxT);
		let minT_list=get_data_list(minT);
		//降雨機率
		let rainPop=weeklyData[0];
		//紫外線
		let UVI=weeklyData[9];

		createLineChart(avgT_list[0],avgT_list[1],maxT_list[1],minT_list[1]);
		createTable(UVI,rainPop);
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
	new Chart("chart",{
		type:"line",
		data:{
			labels:labels,
			datasets:[
				{
				label:"均溫",
				data:avgT,
				backgroundColor:"rgba(188, 226, 235, 1)",
				borderColor:"rgba(188, 226, 235, 1)",
				fill:true,
				pointRadius: 2,
				pointHoverRadius: 5,
				borderWidth:1//線段寬度,default=3
			},
			{
				label:"最高溫度",
				data:maxT,
				backgroundColor:"red",
				borderColor:"red",
				fill:false,
				pointRadius: 2,
				pointHoverRadius: 5,
				borderWidth:1//線段寬度,default=3
			},
			{
				label:"最低溫度",
				data:minT,
				backgroundColor:"blue",
				borderColor:"blue",
				fill:false,
				pointRadius: 2,
				pointHoverRadius: 5,
				borderWidth:1//線段寬度,default=3
			}
		]
		},
		options:{

			responsive: true,
			legend:{display:true}, //是否顯示圖例
			scales:{
				yAxes: [
					{ticks: {min: 24, max:40}},
				],
				xAxes: [{
					gridLines: {
							display:false
					}
			}],
			},
			layout:{padding:{left:25}},
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

function createTable(UVI,list1){
	let rainPop=[];
	for(let i =0;i<3;i++){
		let rows=document.createElement("tr");
		rows.classList.add("row");
		rows.id="row-"+i;
		for(let j=0;j<8;j++){
			let cells=document.createElement("td");
			cells.id="cell"+i+"-"+j;
			if(i==0 &&j>0){
				cells.textContent=date(UVI.time[j-1].startTime);
			}
			else if(i==1&& j>0){
				cells.textContent=UVI.time[j-1].elementValue[0].value;
			}
			else{
				rainPop=rainPop_daily(list1);
				
				cells.textContent=rainPop[j-1];
			}
			rows.appendChild(cells);
		}
		tableContainer.appendChild(rows);	
	}
	document.querySelector("#cell0-0").textContent="日期";
	document.querySelector("#cell1-0").textContent=UVI.description;
	document.querySelector("#cell2-0").textContent="降雨機率";
}

function rainPop_daily(list1){
	let result=[];
	let startTime_list=get_data_list(list1.time);
	for (let i=0;i<startTime_list[0].length;i++){
		if(startTime_list[0][i]!=""){
			if(startTime_list[1][i]!=" "){
				result.push(startTime_list[1][i]+"%");
			}
			else{result.push("0%");}
		}
	}
	return result;
}