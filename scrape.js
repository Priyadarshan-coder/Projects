const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const fs=require("fs");
async function livedata() {
    try {
        const siteurl = "https://travel2karnataka.com/kolkata_bus_route.htm"
        const {data}=await axios({
            method: "GET",
            url: siteurl,
        })
        const $=cheerio.load(data)
        hell="#nlT > tbody > tr > td > div.cntUnt > p:nth-child(4) > table > tbody > tr"
        const listobj=[]
        const template=['Bus_Name','Start_And_Stop']
       // const elemselector=".table table-striped table-hover responsive_tablet #container-async-80 > div.content > table > tbody:nth-child(2) > tr"
    $(hell).each((parentIdx,parentElem)=>
    {

        if(parentIdx>=1)
        {
            const tempobj={}
            $(parentElem).children().each((childIdx,childElem)=>
            {
                if(childIdx==0)
                {
                    const tdval=$(childElem).text()
                    if(tdval)
                    tempobj[template[0]]=tdval
                }
                $(childElem).children().each((ind,ele)=>
                {
                    const tdval=$(ele).text()
                    if(tdval)
                    tempobj[template[1]]=tdval
                })
            })
            listobj.push(tempobj)
        }
    })
     //const j2cp=new json2csv();
     //const csv=j2cp.parse(listobj);
     fs.writeFileSync("./data2.JSON",JSON.stringify(listobj),"utf-8")
     //fs.writeFileSync("./data.csv",csv,"utf-8");
    }
    catch (err)
    {
        console.log(err)
    }
}
livedata()
