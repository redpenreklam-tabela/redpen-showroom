"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import AssemblyScroll from "./AssemblyScroll";
import ModelShowcase from "./ModelShowcase";
import IntroExperience from "./IntroExperience";
import GlobalAmbient from "./GlobalAmbient";
import Scene from "./Scene";
import SignAnatomy from "./SignAnatomy";

const projects=[
 {no:"01",title:"Kutu Harf",text:"Hacimli gövde, net kenarlar ve kurumsal yüzey dili.",modelPath:"/models/harf-1.glb",className:"work-plexi"},
 {no:"02",title:"Gold Harf",text:"Sıcak metal yansıması ve premium yüzey karakteri.",modelPath:"/models/harf-2.glb",className:"work-gold"},
 {no:"03",title:"Fileli Krom Harf",text:"Krom gövde, fileli yüzey ve güçlü endüstriyel karakter.",modelPath:"/models/harf-3.glb",className:"work-chrome"},
];

export default function Showroom(){
 const root=useRef<HTMLDivElement>(null);
 const contactRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  const isMobile=window.matchMedia("(max-width: 780px), (pointer: coarse)").matches;
  const lenis=isMobile?null:new Lenis({duration:1.05,smoothWheel:true});
  const onScroll=()=>ScrollTrigger.update();
  lenis?.on("scroll",onScroll);
  let frame=0;
  const raf=(time:number)=>{if(!lenis)return;lenis.raf(time);frame=requestAnimationFrame(raf)};
  if(lenis)frame=requestAnimationFrame(raf);
  const ctx=gsap.context(()=>{
   gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((el)=>gsap.from(el,{y:54,opacity:0,duration:1.05,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 86%",once:true}}));
   gsap.fromTo(".process-line-fill",{scaleX:0},{scaleX:1,ease:"none",scrollTrigger:{trigger:".process-rail",start:"top 78%",end:"bottom 35%",scrub:.7}});
   gsap.utils.toArray<HTMLElement>(".process-step").forEach((el,index)=>{
    gsap.from(el,{opacity:.22,y:28,duration:.65,scrollTrigger:{trigger:el,start:"top 82%",toggleActions:"play none none reverse"},delay:index*.05});
    ScrollTrigger.create({
      trigger:el,
      start:"top 62%",
      end:"bottom 38%",
      onEnter:()=>document.querySelector(".process")?.setAttribute("data-active-step",String(index)),
      onEnterBack:()=>document.querySelector(".process")?.setAttribute("data-active-step",String(index)),
    });
   });
   gsap.to(".process-grid-motion",{backgroundPosition:"180px 120px",ease:"none",scrollTrigger:{trigger:".process",start:"top bottom",end:"bottom top",scrub:1}});
   gsap.to(".process-orbit-a",{rotation:42,xPercent:10,yPercent:-8,ease:"none",scrollTrigger:{trigger:".process",start:"top bottom",end:"bottom top",scrub:1.2}});
   gsap.to(".process-orbit-b",{rotation:-55,xPercent:-12,yPercent:12,ease:"none",scrollTrigger:{trigger:".process",start:"top bottom",end:"bottom top",scrub:1.4}});
   gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el)=>{const target=Number(el.dataset.count||0);const suffix=el.dataset.suffix||"";const state={value:0};gsap.to(state,{value:target,duration:1.8,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 88%",once:true},onUpdate:()=>{el.textContent=`${Math.round(state.value)}${suffix}`}})});
  },root);
  return()=>{if(frame)cancelAnimationFrame(frame);lenis?.off("scroll",onScroll);lenis?.destroy();ctx.revert();ScrollTrigger.getAll().forEach(t=>t.kill())};
 },[]);
 const moveGlow=(event:React.MouseEvent<HTMLElement>)=>{const rect=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--mouse-x",`${event.clientX-rect.left}px`);event.currentTarget.style.setProperty("--mouse-y",`${event.clientY-rect.top}px`)};
 return <div ref={root} className="showroom"><IntroExperience/><GlobalAmbient/>
  <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">R</span><span>REDPEN <b>SHOWCASE</b></span></a><nav><a href="#showcase">SHOWCASE</a><a href="#works">İŞLER</a><a href="#studio">STÜDYO</a><a href="#contact">İLETİŞİM</a></nav><a className="outline-button" href="#showcase">KEŞFET <span>↘</span></a></header>
  <main>
   <section id="top" className="showcase-hero" data-ambient="showcase"><div className="showcase-grid"/><div className="showcase-heading"><p>REDPEN REKLAM</p><h1>SHOWCASE</h1><div className="showcase-heading-meta"><span>3D TABELA · CEPHE · REKLAM OBJELERİ</span><span>DÖNDÜR · İNCELE · KEŞFET</span></div></div><div id="showcase" className="showcase-stage"><ModelShowcase/></div><div className="scroll-cue"><span/>AŞAĞI KAYDIR</div></section>
   <AssemblyScroll/>
   <SignAnatomy/>
   <section id="works" className="manifesto section-pad" data-ambient="letters"><p className="section-kicker" data-scroll-reveal>SEÇİLİ UYGULAMALAR</p><div className="manifesto-layout" data-scroll-reveal><h2>Bir tabela değil.<br/><em>Mekânın imzası.</em></h2><p>Her projeyi bulunduğu mimariyle, görüş mesafesiyle ve gece karakteriyle birlikte tasarlıyoruz. Malzeme, ışık ve detay aynı fikre hizmet ediyor.</p></div><div className="work-grid">{projects.map(project=><article className={`work-card work-card-3d ${project.className}`} key={project.no} data-scroll-reveal><div className="work-visual work-visual-3d" data-lenis-prevent data-lenis-prevent-wheel><Scene modelPath={project.modelPath}/><div className="work-interaction-hint"><span/>SÜRÜKLE · YAKINLAŞTIR</div></div><div className="work-meta"><span>{project.no}</span><h3>{project.title}</h3><p>{project.text}</p><b>3D İNCELE ↗</b></div></article>)}</div></section>
   <section className="process section-pad" data-active-step="0" data-ambient="process">
    <div className="process-ambient" aria-hidden="true">
      <div className="process-color-field"/>
      <div className="process-grid-motion"/>
      <div className="process-orbit process-orbit-a"/>
      <div className="process-orbit process-orbit-b"/>
      <div className="process-scan"/>
      <div className="process-grain"/>
    </div>
    <div className="process-content">
      <p className="section-kicker" data-scroll-reveal>FİKİRDEN MONTAJA</p>
      <div className="process-title" data-scroll-reveal><h2>Her detayın<br/><em>bir görevi var.</em></h2><p>Bir fikir, sahaya çıkana kadar ölçülür, modellenir, üretilir ve milimetrik biçimde yerine oturur.</p></div>
      <div className="process-rail"><div className="process-line"><i className="process-line-fill"/></div>{[["01","KEŞİF","Mekânı okur, görüş mesafesini ve ışık koşullarını çözümleriz.","⌖"],["02","TASARIM","Formu, malzemeyi ve üretim detayını tek sistemde buluştururuz.","◇"],["03","ÜRETİM","Kesimden elektriğe kadar her parçayı milimetrik hassasiyetle üretiriz.","✦"],["04","MONTAJ","Sahada ölçülü, güvenli ve temiz bir finalle projeyi tamamlarız.","↗"]].map((item,index)=><div className={`process-step process-step-${index+1}`} key={item[0]}><div className="process-step-glow"/><div className="process-step-icon" aria-hidden="true">{item[3]}</div><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><b>0{index+1} / 04</b><i/></div>)}</div>
    </div>
   </section>
   <section id="studio" className="studio section-pad" data-ambient="studio"><div className="studio-card" data-scroll-reveal><div><p className="section-kicker">REDPEN STÜDYO</p><h2>Reklamı yüzeye değil,<br/><em>hafızaya işleriz.</em></h2></div><div className="stats"><div><strong data-count="18" data-suffix="+">0</strong><span>YILLIK DENEYİM</span></div><div><strong data-count="640">0</strong><span>TAMAMLANAN İŞ</span></div><div><strong data-count="32">0</strong><span>ŞEHİR</span></div><div><strong data-count="100" data-suffix="%">0</strong><span>ÖZEL ÜRETİM</span></div></div></div></section>
   <section ref={contactRef} id="contact" className="contact section-pad" data-ambient="contact" onMouseMove={moveGlow}><div className="contact-ghost" aria-hidden="true">REDPEN</div><p className="section-kicker" data-scroll-reveal>YENİ BİR PROJE</p><h2 data-scroll-reveal>Bir sonraki yapıyı<br/><em>birlikte aydınlatalım.</em></h2><a className="contact-link" href="https://redpenreklam.com.tr/iletisim/">PROJENİ ANLAT <span>↗</span></a></section>
  </main><footer><div className="brand"><span className="brand-mark">R</span><span>REDPEN REKLAM</span></div><span>© 2026 · İSTANBUL</span><a href="#top">YUKARI ↑</a></footer>
 </div>;
}
