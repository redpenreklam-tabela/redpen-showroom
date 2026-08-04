"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Scene from "./Scene";

const MODEL_CANDIDATES = Array.from({ length: 12 }, (_, index) => `/models/model-${index + 1}.glb`);
const projectMeta = [
  ["MIO KITCHEN ITALY", "IŞIKLI CEPHE TABELASI"],
  ["REDPEN SIGNATURE", "TOTEM VE PİLON SİSTEMİ"],
  ["ARCHITECTURAL ID", "ÖZEL ÜRETİM TABELA"],
];

export default function ModelShowcase() {
  const [models,setModels]=useState<string[]>([MODEL_CANDIDATES[0]]);
  const [activeIndex,setActiveIndex]=useState(0);
  const [direction,setDirection]=useState<"next"|"prev">("next");
  useEffect(()=>{let cancelled=false;(async()=>{const checks=await Promise.all(MODEL_CANDIDATES.map(async(path)=>{try{return (await fetch(path,{method:"HEAD",cache:"no-store"})).ok?path:null}catch{return null}}));if(!cancelled){const available=checks.filter((p):p is string=>Boolean(p));setModels(available.length?available:[MODEL_CANDIDATES[0]]);setActiveIndex(0)}})();return()=>{cancelled=true}},[]);
  const goTo=useCallback((index:number,nextDirection:"next"|"prev")=>{if(models.length<2)return;setDirection(nextDirection);setActiveIndex((index+models.length)%models.length)},[models.length]);
  const goNext=useCallback(()=>goTo(activeIndex+1,"next"),[activeIndex,goTo]);
  const goPrev=useCallback(()=>goTo(activeIndex-1,"prev"),[activeIndex,goTo]);
  const activeModel=models[activeIndex]??MODEL_CANDIDATES[0];
  const counter=useMemo(()=>`${String(activeIndex+1).padStart(2,"0")} / ${String(models.length).padStart(2,"0")}`,[activeIndex,models.length]);
  const meta=projectMeta[activeIndex]??[`REDPEN MODEL ${String(activeIndex+1).padStart(2,"0")}`,"ÖZEL ÜRETİM REKLAM OBJESİ"];
  return <div className="model-carousel">
    <div className="carousel-topline"><span>{counter}</span><strong>{meta[0]}</strong><span>OKLARLA MODEL SEÇ</span></div>
    <div className={`carousel-scene carousel-scene-${direction}`} key={activeModel}><Scene modelPath={activeModel}/></div>
    <div className="carousel-project-copy" key={`copy-${activeModel}`}><span>{meta[1]}</span><h2>{meta[0]}</h2><p>SÜRÜKLE · DÖNDÜR · YAKINLAŞTIR</p></div>
    <button className="carousel-arrow carousel-arrow-left" type="button" onClick={goPrev} disabled={models.length<2} aria-label="Önceki model">←</button>
    <button className="carousel-arrow carousel-arrow-right" type="button" onClick={goNext} disabled={models.length<2} aria-label="Sonraki model">→</button>
    <div className="carousel-footer"><div className="carousel-dots">{models.map((path,index)=><button key={path} type="button" className={index===activeIndex?"is-active":""} onClick={()=>goTo(index,index>activeIndex?"next":"prev")} aria-label={`${index+1}. modeli aç`}/>)}</div><span>OKLARLA GEÇ · MODELİ PARMAĞINLA DÖNDÜR</span></div>
  </div>;
}
