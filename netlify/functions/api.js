const { getStore } = require("@netlify/blobs");
const jwt = require("jsonwebtoken");

const USER = "litprincicpal";
const PASS = "lit2026";
const SECRET = process.env.AUTH_SECRET || "change-this-secret-before-production";

function store(){ return getStore({name:"laar-data", consistency:"strong"}); }
function token(){ return jwt.sign({role:"principal",user:USER},SECRET,{expiresIn:"12h"}); }
function auth(req){
  const h=req.headers.authorization||"";
  if(!h.startsWith("Bearer ")) return false;
  try { jwt.verify(h.slice(7),SECRET); return true; } catch(e){ return false; }
}
async function getData(){
  const s=store();
  const d=await s.get("data",{type:"json"});
  if(d) return d;
  const data={students:[],teachers:[],courses:[],shifts:[],batches:[],modules:[],topics:[],lessons:[],attendance:[],progress:[],practicals:[],tests:[],results:[]};
  await s.setJSON("data",data); return data;
}
async function saveData(d){ await store().setJSON("data",d); }

exports.handler=async(event)=>{
  const method=event.httpMethod;
  const path=(event.path||"").split("/").filter(Boolean).pop()||"";
  const body=event.body?JSON.parse(event.body):{};
  if(method==="POST" && path==="login"){
    if(body.username===USER && body.password===PASS) return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({token:token(),user:{username:USER,role:"principal"}})};
    return {statusCode:401,body:JSON.stringify({error:"Invalid username or password"})};
  }
  if(!auth(event)) return {statusCode:401,body:JSON.stringify({error:"Unauthorized"})};
  let d=await getData();
  if(method==="GET") return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify(d)};
  if(method==="POST"){
    const entity=body.entity, item=body.item;
    if(!d[entity]) return {statusCode:400,body:JSON.stringify({error:"Unknown module"})};
    item.id=item.id||Date.now().toString();
    d[entity]=d[entity].filter(x=>x.id!==item.id); d[entity].push(item);
    await saveData(d); return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify(item)};
  }
  if(method==="DELETE"){
    const entity=body.entity; d[entity]=(d[entity]||[]).filter(x=>x.id!==body.id); await saveData(d);
    return {statusCode:200,body:JSON.stringify({ok:true})};
  }
  return {statusCode:405,body:"Method not allowed"};
};
