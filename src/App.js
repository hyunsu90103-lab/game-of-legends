import { useState, useMemo, useEffect } from "react";
import React from "react";

const C = {
  bg0:"#0d0e12", bg1:"#13151c", bg2:"#1a1d27", bg3:"#222638",
  bdr0:"rgba(255,255,255,0.05)", bdr1:"rgba(255,255,255,0.10)", bdr2:"rgba(255,255,255,0.18)",
  t1:"#e8e4d8", t2:"#8c8980", t3:"#4a4845",
  gold:"#c8a84a", goldL:"#e8c86a", goldD:"#8a6820",
  n:"#9a9a9a", m:"#3ecf6a", r:"#4499ff", e:"#cc77ff", l:"#ff9922", my:"#ff4444",
  nBg:"rgba(154,154,154,0.12)", mBg:"rgba(62,207,106,0.12)", rBg:"rgba(68,153,255,0.12)",
  eBg:"rgba(204,119,255,0.12)", lBg:"rgba(255,153,34,0.12)", myBg:"rgba(255,68,68,0.12)",
  succ:"#3ecf6a", fail:"#ff4444", warn:"#ffaa22",
};
const GC={n:C.n,m:C.m,r:C.r,e:C.e,l:C.l,my:C.my};
const GB={n:C.nBg,m:C.mBg,r:C.rBg,e:C.eBg,l:C.lBg,my:C.myBg};
const GN={n:"일반",m:"매직",r:"레어",e:"에픽",l:"레전드",my:"신화"};
const SP=[95,90,85,80,75,70,62,54,44,35,26,18,11,6,3];
const FK=[100,100,100,100,100,100,100,100,70,60,50,40,30,20,10];
const gradeMap={"Common":"n","Magic":"m","Rare":"r","Epic":"e","Legend":"l","Mythic":"my"};

const CHARS=[
  {id:"CHR_001",name:"세르민느",role:"마법사",desc:"강력한 마력과 어둠의 마법을 사용하는 마법사",img:"./images/1.(캐릭터)세르민느.png",motion:"./motions/char_seomine.mp4",emoji:"🔮",weaponClass:"마법사공용"},
  {id:"CHR_002",name:"아스칼론",role:"전사",desc:"숲의 기운을 수호하는 강인한 전사",img:"./images/1.(캐릭터)아스칼론.png",motion:"./motions/char_askalon.mp4",emoji:"⚔️",weaponClass:"전사공용"},
  {id:"CHR_003",name:"에일린",role:"궁수",desc:"활과 화살을 자유자재로 다루는 민첩한 궁수",img:"./images/1.(캐릭터)에일린.png",motion:"./motions/char_eilin.mp4",emoji:"🏹",weaponClass:"에일린(장궁)"},
  {id:"CHR_004",name:"카이렌",role:"전사",desc:"강철 갑옷을 입은 중장갑 전사",img:"./images/1.(캐릭터)카이렌.png",motion:"./motions/char_kairen.mp4",emoji:"🛡️",weaponClass:"전사공용"},
  {id:"CHR_005",name:"로켓",role:"기술자",desc:"고성능 화기를 다루는 너구리 형태의 기술자",img:"./images/1.(캐릭터)로켓.png",motion:"./motions/char_rocket.mp4",emoji:"🔫",weaponClass:"로켓(리펄서)"},
  {id:"CHR_006",name:"발키리",role:"암살자",desc:"날개를 가진 전사이자 치명적인 공격의 소유자",img:"./images/1.(캐릭터)발키리.png",motion:"./motions/char_valkyrie.mp4",emoji:"⚙️",weaponClass:"발키리(레이저)"},
  {id:"CHR_007",name:"벨리아르",role:"마법사",desc:"어둠의 마법과 영혼의 힘을 다루는 마법사",img:"./images/1.(캐릭터)벨리아르.png",motion:"./motions/char_beliar.mp4",emoji:"👁️",weaponClass:"마법사공용"},
];

const calcStat=(baseAtk,grade,enhance,type)=>{
  const g=gradeMap[grade]||"n";
  const base=Math.abs(baseAtk);
  const enh=Math.round(base*(enhance*0.08));
  if(type==="weapon"){
    return {
      atk:base+enh, def:0,
      mdef:Math.round((base+enh)*0.1),
      crit:parseFloat((Math.min(80,(enhance*2.5)+{n:3,m:6,r:10,e:15,l:22,my:35}[g])).toFixed(1)),
      eva:parseFloat((Math.min(60,(enhance*1.5)+{n:2,m:4,r:7,e:11,l:16,my:25}[g])).toFixed(1)),
    };
  } else {
    return {
      atk:0, def:base+enh,
      mdef:Math.round((base+enh)*0.6),
      crit:parseFloat((Math.min(80,enhance*1.0)).toFixed(1)),
      eva:parseFloat((Math.min(60,enhance*0.8+{n:1,m:2,r:4,e:7,l:12,my:20}[g])).toFixed(1)),
    };
  }
};

const rawWeapons=[
  {id:"W_WAR_001",name:"무거운 청동검",cls:"전사공용",grade:"Common",img:"./images/무거운청동검_2.png",atk:30,sell:100},
  {id:"W_WAR_002",name:"병사용 일반검",cls:"전사공용",grade:"Common",img:"./images/병사용일반검_2.png",atk:35,sell:100},
  {id:"W_WAR_003",name:"기사의 검",cls:"전사공용",grade:"Magic",img:"./images/기사의검_2.png",atk:90,sell:500},
  {id:"W_WAR_007",name:"요정강철 양손검",cls:"전사공용",grade:"Rare",img:"./images/요정강철양손검_2.png",atk:220,sell:1500},
  {id:"W_WAR_008",name:"금빛 영광 대검",cls:"전사공용",grade:"Epic",img:"./images/금빛영광대검.png",atk:550,sell:5000},
  {id:"W_WAR_009",name:"국왕 수호대의 영광",cls:"전사공용",grade:"Legend",img:"./images/국왕수호대의영광.png",atk:1500,sell:20000},
  {id:"W_WAR_020",name:"태양브레이커 대검",cls:"전사공용",grade:"Mythic",img:"./images/태양브레이커대검.png",atk:3500,sell:50000},
  {id:"W_AIL_001",name:"견습생의 활",cls:"에일린(장궁)",grade:"Common",img:"./images/견습생의활.png",atk:15,sell:100},
  {id:"W_AIL_008",name:"가이아의 달빛 장궁",cls:"에일린(장궁)",grade:"Epic",img:"./images/가이아의달빛장궁.png",atk:450,sell:5000},
  {id:"W_AIL_015",name:"은하의 파멸",cls:"에일린(장궁)",grade:"Mythic",img:"./images/은하의파멸.png",atk:3000,sell:50000},
  {id:"W_MAG_001",name:"마법 스틱",cls:"마법사공용",grade:"Common",img:"./images/마법스틱.png",atk:20,sell:100},
  {id:"W_MAG_010",name:"공허의 심연",cls:"마법사공용",grade:"Legend",img:"./images/공허의심연.png",atk:1600,sell:20000},
  {id:"W_MAG_020",name:"혼돈의 카오스 오브",cls:"마법사공용",grade:"Mythic",img:"./images/혼돈의카오스오브.png",atk:3500,sell:50000},
  {id:"W_ROC_001",name:"고철 권총",cls:"로켓(리펄서)",grade:"Common",img:"./images/고철권총.png",atk:15,sell:100},
  {id:"W_ROC_010",name:"빅뱅 데스스타 라이플",cls:"로켓(리펄서)",grade:"Mythic",img:"./images/빅뱅데스터라이플.png",atk:3500,sell:100000},
  {id:"W_VAL_001",name:"고철 건틀렛",cls:"발키리(레이저)",grade:"Common",img:"./images/고철건틀렛.png",atk:15,sell:100},
  {id:"W_VAL_020",name:"신화의 창조건",cls:"발키리(레이저)",grade:"Mythic",img:"./images/신화의창조건.png",atk:3500,sell:100000},
];

const rawArmors=[
  {id:"A_COM_H001",name:"사슬 투구",cat:"투구",grade:"Common",img:"./images/사슬투구.png",def:10,sell:100},
  {id:"A_COM_H010",name:"골든 크라운",cat:"투구",grade:"Epic",img:"./images/골든크라운.png",def:80,sell:5000},
  {id:"A_COM_H020",name:"신화의 크라운",cat:"투구",grade:"Mythic",img:"./images/신화의크라운.png",def:300,sell:100000},
  {id:"A_COM_A001",name:"견습용 갑옷",cat:"갑옷",grade:"Common",img:"./images/견습용갑옷.png",def:15,sell:100},
  {id:"A_COM_A010",name:"가이아의 갑옷",cat:"갑옷",grade:"Legend",img:"./images/가이아의갑옷.png",def:130,sell:20000},
  {id:"A_COM_A020",name:"신화의 갑옷",cat:"갑옷",grade:"Mythic",img:"./images/신화의갑옷.png",def:300,sell:100000},
  {id:"A_COM_P001",name:"린넨 바지",cat:"하의",grade:"Common",img:"./images/린넨바지.png",def:12,sell:100},
  {id:"A_COM_P014",name:"신화의 바지",cat:"하의",grade:"Mythic",img:"./images/신화의바지.png",def:250,sell:100000},
  {id:"A_COM_B001",name:"기본 부츠",cat:"부츠",grade:"Common",img:"./images/기본부츠.png",def:5,sell:100},
  {id:"A_COM_B010",name:"신화의 부츠",cat:"부츠",grade:"Mythic",img:"./images/신화의부츠.png",def:50,sell:100000},
];

const rawAccs=[
  {id:"A_COM_R001",name:"구리 반지",cat:"반지",grade:"Common",img:"./images/구리반지.png",def:1,sell:50},
  {id:"A_COM_R011",name:"신화의 반지",cat:"반지",grade:"Mythic",img:"./images/신화의반지.png",def:120,sell:100000},
  {id:"A_COM_E001",name:"일반 이어링",cat:"귀걸이",grade:"Common",img:"./images/일반이어링.png",def:1,sell:50},
  {id:"A_COM_E011",name:"신화의 귀걸이",cat:"귀걸이",grade:"Mythic",img:"./images/신화의귀걸이.png",def:120,sell:100000},
];

const CONSUMABLES=[
  {id:"S_ETC_001",name:"무기 강화 주문서",grade:"Common",img:"./images/Generate _Weapon enhancement scroll for web game, 2D style, luxurious and p_20260529_181343_0000.png",sell:1000,type:"scroll_weapon"},
  {id:"S_ETC_002",name:"방어구 강화 주문서",grade:"Common",img:"./images/Generate _Armor enhancement scroll for web game, 2D style, luxurious and pr_20260529_181328_0000.png",sell:1000,type:"scroll_armor"},
  {id:"S_ETC_003",name:"장신구 강화 주문서",grade:"Common",img:"./images/Generate _Accessory enhancement scroll for web game, 2D style, luxurious an_20260529_181315_0000.png",sell:1000,type:"scroll_acc"},
];

const Pill=({grade,sm})=>{
  const g=gradeMap[grade]||grade;
  const c=GC[g],bg=GB[g];
  return <span style={{display:"inline-block",borderRadius:3,padding:sm?"1px 5px":"2px 8px",fontSize:sm?9:10,fontWeight:700,color:c,background:bg,border:`1px solid ${c}44`}}>◆ {GN[g]}</span>;
};

const Phone=({children})=>(
  <div style={{width:390,background:C.bg0,borderRadius:20,overflow:"hidden",
    boxShadow:"0 32px 80px rgba(0,0,0,.8)",
    fontFamily:"'Black Han Sans','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
    color:C.t1,position:"relative"}}>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
      backgroundImage:"linear-gradient(rgba(200,168,74,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,74,0.02) 1px,transparent 1px)",
      backgroundSize:"40px 40px"}}/>
    <div style={{position:"relative",zIndex:1}}>{children}</div>
  </div>
);

const CBox=({children,style={},gold=false,onClick})=>(
  <div onClick={onClick} style={{position:"relative",background:C.bg2,
    border:`1px solid ${gold?C.goldD+"88":C.bdr1}`,borderRadius:4,
    cursor:onClick?"pointer":"default",...style}}>
    {[["-1px","-1px","auto","auto"],["-1px","auto","auto","-1px"],
      ["auto","-1px","-1px","auto"],["auto","auto","-1px","-1px"]].map(([t,r,b,l],i)=>(
      <div key={i} style={{position:"absolute",width:8,height:8,pointerEvents:"none",
        top:t,right:r,bottom:b,left:l,
        borderTop:i<2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderBottom:i>=2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderLeft:i%2===0?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderRight:i%2===1?`2px solid ${gold?C.gold:C.bdr2}`:undefined}}/>
    ))}
    {children}
  </div>
);

const ItemSlot=({item,selected,onClick})=>{
  const g=gradeMap[item?.grade]||"n";
  return(
    <button onClick={()=>item&&onClick&&onClick(item)}
      disabled={!item}
      title={item?`${item.name} [${GN[g]}]${(item.enhance||0)>0?` +${item.enhance||0}`:""}`:undefined}
      style={{aspectRatio:"1",background:item?C.bg2:"transparent",
        border:`1.5px ${item?"solid":"dashed"} ${selected?C.gold:item?GC[g]+"44":C.bdr0}`,
        borderRadius:5,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        cursor:item?"pointer":"default",position:"relative",overflow:"hidden",
        boxShadow:selected?`0 0 10px ${C.goldD}66`:"none",
        opacity:item?1:.15,padding:0,transition:"all .15s"}}>
      {item&&(
        <>
          <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 80%,${GC[g]}18,transparent 70%)`,pointerEvents:"none"}}/>
          <img src={item.img} alt={item.name}
            style={{width:"65%",height:"65%",objectFit:"contain",position:"relative",zIndex:1}}
            onError={e=>{e.target.style.display="none";const fb=e.target.nextSibling;if(fb)fb.style.display="flex";}}/>
          <div style={{fontSize:18,position:"relative",zIndex:1,display:"none",
            alignItems:"center",justifyContent:"center",width:"65%",height:"65%"}}>
            {item.type==="weapon"?"⚔":item.type==="armor"?"🛡":"💍"}
          </div>
          {(item.enhance||0)>0&&<span style={{position:"absolute",top:2,left:2,fontSize:7,fontWeight:800,color:C.goldL,lineHeight:1}}>+{item.enhance}</span>}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:GC[g]}}/>
        </>
      )}
    </button>
  );
};

// ━━━━ TitleScreen ━━━━
function TitleScreen({onNew,onLoad}){
  const [imgIdx,setImgIdx]=useState(0);
  const [imgFade,setImgFade]=useState(true);
  const TITLE_IMGS=["./images/main_title.png","./images/main_title2.png"];
  useEffect(()=>{
    const t=setInterval(()=>{
      setImgFade(false);
      setTimeout(()=>{setImgIdx(i=>(i+1)%2);setImgFade(true);},600);
    },3500);
    return ()=>clearInterval(t);
  },[]);

  return(
    <Phone>
      <style>{`@keyframes tFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes tGlow{0%,100%{opacity:.65}50%{opacity:1}}`}</style>
      {/* 이미지 슬라이드 */}
      <div style={{position:"relative",overflow:"hidden"}}>
        <div style={{height:218,position:"relative",overflow:"hidden",background:"#05060a"}}>
          {TITLE_IMGS.map((src,i)=>(
            <img key={src} src={src} alt=""
              style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",
                objectFit:"cover",objectPosition:"center top",
                opacity:i===imgIdx?(imgFade?1:0):0,
                transition:"opacity .8s ease-in-out",zIndex:i===imgIdx?2:1}}
              onError={e=>{e.target.style.opacity="0";}}/>
          ))}
          <div style={{position:"absolute",inset:0,zIndex:3,pointerEvents:"none",
            background:"linear-gradient(180deg,rgba(5,6,10,.2) 0%,transparent 20%,transparent 60%,rgba(5,6,10,1) 100%)"}}/>
        </div>
        <div style={{position:"absolute",bottom:14,left:0,right:0,zIndex:4,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#e8c86a",letterSpacing:".45em",fontFamily:"serif",
            fontWeight:600,marginBottom:6,animation:"tGlow 2.5s ease-in-out infinite"}}>— THE GAME OF —</div>
          <div style={{fontSize:46,fontWeight:900,letterSpacing:".12em",lineHeight:1,fontFamily:"serif",
            background:"linear-gradient(180deg,#fff 0%,#e8c86a 30%,#c8a84a 60%,#8a6820 100%)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            filter:"drop-shadow(0 0 30px rgba(200,168,74,.65))",
            animation:"tFloat 3s ease-in-out infinite"}}>LEGENDS</div>
        </div>
        <div style={{position:"absolute",bottom:5,left:0,right:0,zIndex:5,
          display:"flex",justifyContent:"center",gap:7}}>
          {[0,1].map(i=>(
            <div key={i} onClick={()=>{setImgFade(false);setTimeout(()=>{setImgIdx(i);setImgFade(true);},300);}}
              style={{width:i===imgIdx?22:7,height:7,borderRadius:99,cursor:"pointer",
                background:i===imgIdx?"#c8a84a":"rgba(255,255,255,.2)",transition:"all .4s"}}/>
          ))}
        </div>
      </div>
      {/* 영상 */}
      <div style={{position:"relative",height:390,overflow:"hidden",background:"#000"}}>
        <video autoPlay loop muted playsInline
          style={{position:"absolute",inset:0,width:"100%",height:"100%",
            objectFit:"cover",zIndex:1,filter:"brightness(.5) saturate(1.4)"}}
          onError={e=>e.target.style.display="none"}>
          <source src="./videos/video4.mp4" type="video/mp4"/>
        </video>
        <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"linear-gradient(180deg,rgba(5,6,8,.7) 0%,transparent 35%,transparent 65%,rgba(5,6,8,.95) 100%)"}}/>
        <div style={{position:"absolute",bottom:10,left:0,right:0,zIndex:3,textAlign:"center",
          fontSize:9,color:"rgba(200,168,74,.5)",letterSpacing:".18em"}}>✦ 전설의 영웅들이 결집하다 ✦</div>
      </div>
      {/* 버튼 */}
      <div style={{padding:"14px 10px 28px",background:"linear-gradient(180deg,#050608 0%,#0a0c12 100%)"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={onNew} style={{width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",display:"block",position:"relative"}}>
            <img src="./images/캐릭터생성.png" alt="캐릭터 생성"
              style={{width:"100%",height:"auto",display:"block",filter:"drop-shadow(0 4px 16px rgba(200,168,74,.4))",transition:"filter .2s"}}
              onError={e=>{
                e.target.style.display="none";
                e.target.parentElement.style.cssText="background:linear-gradient(135deg,#28200a,#1a1406);border:2px solid #c8a84a88;border-radius:10px;padding:20px 18px";
                e.target.parentElement.insertAdjacentHTML("beforeend","<div style='display:flex;align-items:center;gap:14px;color:#e8c86a'><span style='font-size:26px'>✦</span><div><div style='font-size:18px;font-weight:900'>캐릭터 생성</div><div style='font-size:11px;color:rgba(255,255,255,.4);margin-top:4px'>새로운 영웅으로 전설을 써내려가라</div></div><span style='font-size:20px;margin-left:auto'>›</span></div>");
              }}/>
          </button>
          <button onClick={onLoad} style={{width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",display:"block",position:"relative"}}>
            <img src="./images/게임이어하기.png" alt="기존 게임 불러오기"
              style={{width:"100%",height:"auto",display:"block",filter:"drop-shadow(0 4px 16px rgba(160,80,255,.35))",transition:"filter .2s"}}
              onError={e=>{
                e.target.style.display="none";
                e.target.parentElement.style.cssText="background:linear-gradient(135deg,#1e1430,#130e22);border:2px solid #9966cc88;border-radius:10px;padding:20px 18px";
                e.target.parentElement.insertAdjacentHTML("beforeend","<div style='display:flex;align-items:center;gap:14px;color:#cc88ff'><span style='font-size:26px'>↺</span><div><div style='font-size:18px;font-weight:900'>기존 게임 불러오기</div><div style='font-size:11px;color:rgba(255,255,255,.4);margin-top:4px'>마지막 저장 데이터 불러오기</div></div><span style='font-size:20px;margin-left:auto'>›</span></div>");
              }}/>
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:12,fontSize:10,color:"#4a4845",letterSpacing:".08em"}}>
          v1.1 · 데이터는 이 브라우저에 저장됩니다</div>
      </div>
    </Phone>
  );
}

// ━━━━ CharScreen ━━━━
function CharScreen({onBack,onSelect}){
  const [sel,setSel]=useState(null);
  const [naming,setNaming]=useState(false);
  const [name,setName]=useState("");
  const char=CHARS.find(c=>c.id===sel);
  return(
    <Phone>
      <div style={{height:50,background:C.bg1,borderBottom:`1px solid ${C.bdr0}`,
        display:"flex",alignItems:"center",padding:"0 14px",gap:10}}>
        <button onClick={onBack} style={{width:32,height:32,borderRadius:4,background:C.bg2,
          border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:16,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <span style={{fontSize:14,fontWeight:700}}>영웅 선택</span>
        <span style={{marginLeft:"auto",fontSize:11,color:C.t3}}>7명의 전설적 영웅</span>
      </div>
      <div style={{display:"flex",background:"linear-gradient(160deg,#1a1230,#0d0e12)",borderBottom:`1px solid ${C.bdr1}`}}>
        {/* 좌: 모션 */}
        <div style={{width:"52%",height:320,position:"relative",overflow:"hidden",background:C.bg0,flexShrink:0}}>
          {char?(
            <>
              <img id={`char-img-${char.id}`} src={char.img} alt={char.name||""}
                style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center bottom",position:"absolute",inset:0,zIndex:1}}
                onError={e=>{e.target.style.visibility="hidden";}}/>
              <video key={char.id} autoPlay loop muted playsInline
                style={{width:"100%",height:"100%",objectFit:"contain",position:"absolute",inset:0,zIndex:2}}
                onLoadedData={e=>{const img=document.getElementById(`char-img-${char.id}`);if(img)img.style.display="none";}}
                onError={e=>{e.target.style.display="none";}}>
                <source src={char.motion} type="video/mp4"/>
              </video>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,
                background:"linear-gradient(transparent,rgba(0,0,0,.85))",pointerEvents:"none",zIndex:3}}/>
              <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center",zIndex:4}}>
                <div style={{fontSize:14,fontWeight:800,color:C.goldL}}>{char.name}</div>
                <div style={{fontSize:10,color:C.t2}}>{char.emoji} {char.role}</div>
              </div>
            </>
          ):(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:8}}>
              <div style={{fontSize:36,opacity:.12}}>👤</div>
              <div style={{fontSize:10,color:C.t3,textAlign:"center",padding:"0 12px"}}>캐릭터를 선택하면<br/>모션이 재생됩니다</div>
            </div>
          )}
        </div>
        {/* 우: 캐릭터 목록 3열 */}
        <div style={{width:"48%",flexShrink:0,background:"linear-gradient(180deg,#0f0e18,#0a0912)",
          padding:"10px 8px",display:"flex",flexDirection:"column",gap:6,overflowY:"auto"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:2}}>◆ 영웅 선택</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:6}}>
            {CHARS.map(c=>(
              <button key={c.id} onClick={()=>{setSel(c.id);setNaming(false);}} style={{
                cursor:"pointer",borderRadius:6,overflow:"hidden",border:"none",padding:0,
                outline:`1.5px solid ${sel===c.id?C.gold:C.bdr1}`,
                background:sel===c.id?C.bg3:C.bg2,
                boxShadow:sel===c.id?`0 0 10px ${C.goldD}88`:"none"}}>
                <div style={{height:56,background:C.bg0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                  <img src={c.img} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}
                    onError={e=>{e.target.style.display="none";}}/>
                  {sel===c.id&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,
                    background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>}
                </div>
                <div style={{padding:"4px 3px 5px",textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,color:sel===c.id?C.goldL:C.t1,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                  <div style={{fontSize:7,color:C.t3}}>{c.role}</div>
                </div>
              </button>
            ))}
          </div>
          {!naming?(
            <button onClick={()=>sel&&setNaming(true)} disabled={!sel} style={{
              width:"100%",padding:"13px",borderRadius:4,border:"none",
              background:sel?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,
              color:sel?"#000":C.t3,fontSize:14,fontWeight:800,cursor:sel?"pointer":"default"}}>
              {sel?`${char?.name} 선택 → 이름 정하기`:"캐릭터를 먼저 선택하세요"}</button>
          ):(
            <div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="닉네임..." autoFocus
                style={{width:"100%",padding:"11px 12px",borderRadius:4,background:C.bg0,
                  border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:14,outline:"none",marginBottom:8,fontFamily:"inherit"}}/>
              <button onClick={()=>name.trim()&&onSelect(sel,name.trim())} disabled={!name.trim()} style={{
                width:"100%",padding:"13px",borderRadius:4,border:"none",
                background:name.trim()?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,
                color:name.trim()?"#000":C.t3,fontSize:14,fontWeight:800,cursor:name.trim()?"pointer":"default"}}>게임 시작 ›</button>
            </div>
          )}
        </div>
      </div>
    </Phone>
  );
}

// ━━━━ TopHUD ━━━━
function TopHUD({gold,scrolls,dailyLeft,onChest,onShop,onRank}){
  const SZ=60;
  const HudItem=({onClick,children,flex=1,br=true,hl=false})=>(
    <button onClick={onClick} style={{
      flex,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      gap:3,padding:"8px 2px",cursor:onClick?"pointer":"default",border:"none",
      background:hl?"linear-gradient(180deg,rgba(30,26,14,.9),rgba(18,15,8,.9))":"transparent",
      borderRight:br?"1px solid rgba(255,255,255,.07)":"none",
      borderLeft:hl?"1px solid rgba(200,168,74,.3)":"none",
      boxShadow:hl?"0 0 14px rgba(200,168,74,.14) inset":"none",
    }}>{children}</button>
  );
  return(
    <div style={{background:"linear-gradient(180deg,#12141e 0%,#0c0d15 100%)",
      borderBottom:"2px solid rgba(200,168,74,.3)",display:"flex",alignItems:"stretch"}}>
      <HudItem onClick={onChest} flex={1}>
        <div style={{width:SZ,height:SZ,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="./images/보물상자.png" alt="" style={{width:SZ,height:SZ,objectFit:"contain",filter:"drop-shadow(0 2px 8px rgba(80,140,255,.6))"}}
            onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:30px'>📦</span>");}}/>
        </div>
        <span style={{fontSize:9,color:"#7a7a8a",lineHeight:1}}>일일상자</span>
        <span style={{fontSize:13,fontWeight:900,color:dailyLeft>0?"#e8c86a":"#ff4444",lineHeight:1,
          textShadow:dailyLeft>0?"0 0 8px rgba(200,168,74,.6)":"none"}}>{dailyLeft} 회</span>
      </HudItem>
      <HudItem onClick={onShop} flex={1}>
        <div style={{width:SZ,height:SZ,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="./images/상점.png" alt="" style={{width:SZ,height:SZ,objectFit:"contain",transform:"scale(1.2)",filter:"drop-shadow(0 2px 8px rgba(180,100,255,.5))"}}
            onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:30px'>🛒</span>");}}/>
        </div>
        <span style={{fontSize:9,color:"#7a7a8a",lineHeight:1}}>상점</span>
        <span style={{fontSize:13,fontWeight:900,color:"#b0c8e8",lineHeight:1}}>구매</span>
      </HudItem>
      <HudItem flex={1} hl={false}>
        <div style={{width:SZ,height:SZ,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="./images/골드.png" alt="" style={{width:SZ,height:SZ,objectFit:"contain",filter:"drop-shadow(0 2px 12px rgba(200,168,74,.9))"}}
            onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:30px'>💰</span>");}}/>
        </div>
        <span style={{fontSize:9,color:"#c8a84a",lineHeight:1}}>골드</span>
        <span style={{fontSize:13,fontWeight:900,color:"#e8c86a",lineHeight:1,textShadow:"0 0 8px rgba(200,168,74,.7)"}}>{gold.toLocaleString()}</span>
      </HudItem>
      <HudItem onClick={onShop} flex={1}>
        <div style={{width:SZ,height:SZ,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="./images/주문서.png" alt="" style={{width:SZ,height:SZ,objectFit:"contain",transform:"scale(1.18)",filter:"drop-shadow(0 2px 8px rgba(100,200,180,.5))"}}
            onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:30px'>📜</span>");}}/>
        </div>
        <span style={{fontSize:9,color:"#7a7a8a",lineHeight:1}}>주문서현황</span>
        <span style={{fontSize:10,fontWeight:800,lineHeight:1.3,textAlign:"center"}}>
          <span style={{color:"#e8c86a"}}>일반{scrolls.normal}</span>
          <span style={{color:"rgba(255,255,255,.2)"}}>·</span>
          <span style={{color:"#cc77ff"}}>프리미엄{scrolls.adv}</span>
        </span>
      </HudItem>
      <HudItem onClick={onRank} flex={1} br={false}>
        <div style={{width:SZ,height:SZ,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src="./images/랭킹.png" alt="" style={{width:SZ,height:SZ,objectFit:"contain",filter:"drop-shadow(0 2px 10px rgba(80,140,255,.6))"}}
            onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:30px'>👑</span>");}}/>
        </div>
        <span style={{fontSize:9,color:"#7a7a8a",lineHeight:1}}>랭킹</span>
        <span style={{fontSize:13,fontWeight:900,color:"#e8c86a",lineHeight:1,textShadow:"0 0 8px rgba(200,168,74,.5)"}}>#247</span>
      </HudItem>
    </div>
  );
}

// ━━━━ InvScreen ━━━━
function InvScreen({charId,charName,gold,scrolls,dailyLeft,onChest,onShop,onRank,onEnhance,inventory,equipped,onEquip,onSellItem}){
  const [tab,setTab]=useState("weapon");
  const [selItem,setSelItem]=useState(null);
  const [sold,setSold]=useState([]);
  const char=CHARS.find(c=>c.id===charId)||CHARS[0];

  const tabItems=useMemo(()=>{
    const all=inventory.filter(i=>!sold.includes(i.uid));
    if(tab==="weapon") return all.filter(i=>i.type==="weapon");
    if(tab==="armor") return all.filter(i=>i.type==="armor"||(i.type==="accessory"&&i.cat==="부츠"));
    return all.filter(i=>i.type==="accessory"&&i.cat!=="부츠");
  },[inventory,sold,tab]);

  const eqWeapon=inventory.find(i=>i.uid===equipped.weapon);
  const eqHelmet=inventory.find(i=>i.uid===equipped.helmet);
  const eqArmor=inventory.find(i=>i.uid===equipped.armor);
  const eqPants=inventory.find(i=>i.uid===equipped.pants);
  const eqBoots=inventory.find(i=>i.uid===equipped.boots);
  const eqRing=inventory.find(i=>i.uid===equipped.ring);
  const eqEarrings=inventory.find(i=>i.uid===equipped.earrings);

  const totalStats=useMemo(()=>{
    const slots=[equipped.weapon,equipped.helmet,equipped.armor,equipped.pants,
      equipped.boots,equipped.cloak,equipped.belt,equipped.ring,equipped.earrings];
    return slots.map(uid=>inventory.find(i=>i.uid===uid)).filter(Boolean)
      .reduce((acc,it)=>{
        const st=calcStat(it.atk||it.def||0,it.grade,it.enhance||0,it.type);
        return {atk:acc.atk+st.atk,def:acc.def+st.def,mdef:acc.mdef+st.mdef,
          crit:Math.min(80,acc.crit+st.crit),eva:Math.min(60,acc.eva+st.eva)};
      },{atk:0,def:0,mdef:0,crit:0,eva:0});
  },[inventory,equipped]);

  const totalScore=Math.round(totalStats.atk*3+totalStats.def*2+totalStats.mdef*2+totalStats.crit*100+totalStats.eva*100);

  const getSellPrice=(item)=>{
    const gMult={n:1,m:3,r:8,e:20,l:50,my:120};
    const g=gradeMap[item.grade]||"n";
    const base=item.sell||((item.atk||item.def||10)*gMult[g]);
    return base+Math.floor(base*(item.enhance||0)*0.15);
  };

  return(
    <Phone>
      <TopHUD gold={gold} scrolls={scrolls} dailyLeft={dailyLeft}
        onChest={onChest} onShop={onShop} onRank={onRank}/>
      <div style={{overflowY:"auto",maxHeight:700}}>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          {/* 좌: 캐릭터 이미지 */}
          <div style={{width:"46%",flexShrink:0,position:"relative",background:"#0a0b10",minHeight:380}}>
            <img src={char.img} alt={char.name}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,
              background:"linear-gradient(transparent,rgba(0,0,0,.9))",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e8c86a"}}>{charName}</div>
              <div style={{fontSize:9,color:"#8c8980"}}>{char.role}</div>
            </div>
          </div>
          {/* 우: 스탯+장착현황 스크롤 */}
          <div style={{width:"54%",flexShrink:0,background:"linear-gradient(180deg,#13151c,#1a1d27)",
            borderLeft:"1px solid rgba(255,255,255,.07)",maxHeight:380,overflowY:"auto",
            scrollbarWidth:"thin",scrollbarColor:"#8a6820 #0d0e12"}}>
            <div style={{padding:"10px 10px 8px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <div style={{fontSize:9,color:"#c8a84a",letterSpacing:".08em",marginBottom:8,fontWeight:700}}>◆ 캐릭터 스탯</div>
              {[["⚔","공격력",totalStats.atk,"rgba(255,100,100,.85)"],
                ["🛡","방어력",totalStats.def,"rgba(100,180,255,.85)"],
                ["✦","마법방어",totalStats.mdef,"rgba(180,100,255,.85)"],
                ["💥","치명타",`${totalStats.crit}%`,"rgba(255,170,34,.85)"],
                ["💨","회피율",`${totalStats.eva}%`,"rgba(62,207,106,.85)"]].map(([ic,lb,v,bc])=>(
                <div key={lb} style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}>
                  <span style={{fontSize:10,width:14,flexShrink:0}}>{ic}</span>
                  <span style={{color:"#4a4845",fontSize:8,minWidth:28,flexShrink:0}}>{lb}</span>
                  <div style={{flex:1,height:3,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(100,typeof v==="string"?parseFloat(v)*1.2:v/40)}%`,height:"100%",background:bc,borderRadius:99}}/>
                  </div>
                  <span style={{color:"#e8e4d8",fontWeight:700,minWidth:24,textAlign:"right",fontSize:9,flexShrink:0}}>
                    {typeof v==="number"?v.toLocaleString():v}
                  </span>
                </div>
              ))}
              <div style={{background:"#222638",borderRadius:4,padding:"4px 6px",fontSize:8,color:"#c8a84a",fontWeight:700,textAlign:"center",marginTop:6}}>
                ✦ 총점: {totalScore.toLocaleString()} pt
              </div>
            </div>
            <div style={{padding:"10px 10px 10px"}}>
              <div style={{fontSize:9,color:"#c8a84a",letterSpacing:".08em",marginBottom:8,fontWeight:700}}>◆ 장착 현황</div>
              {[["weapon","⚔","무기",eqWeapon],["helmet","🪖","투구",eqHelmet],
                ["armor","🛡","갑옷",eqArmor],["pants","👖","바지",eqPants],
                ["boots","🥾","부츠",eqBoots],["ring","💍","반지",eqRing],
                ["earrings","💎","귀걸이",eqEarrings]].map(([slot,ic,lb,it])=>{
                const g=gradeMap[it?.grade]||"n";
                return(
                  <div key={slot} style={{background:"#1a1d27",border:`1px solid ${it?GC[g]+"44":"rgba(255,255,255,.05)"}`,
                    borderRadius:5,padding:"5px 7px",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:12,width:16,flexShrink:0}}>{ic}</span>
                    <span style={{fontSize:8,color:"#4a4845",minWidth:24,flexShrink:0}}>{lb}</span>
                    {it?(
                      <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
                        <div style={{width:22,height:22,background:"#0d0e12",borderRadius:3,flexShrink:0,
                          border:`1px solid ${GC[g]}55`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <img src={it.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}}
                            onError={e=>{e.target.style.display="none";}}/>
                        </div>
                        <span style={{fontSize:9,fontWeight:700,color:GC[g],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {it.name}{(it.enhance||0)>0&&<span style={{color:"#e8c86a"}}> +{it.enhance}</span>}
                        </span>
                      </div>
                    ):(
                      <span style={{fontSize:8,color:"#4a4845",flex:1}}>미장착</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* 인벤토리 */}
        <div style={{background:C.bg1,padding:"10px 12px 20px"}}>
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            {[["weapon","무기","./images/무기.png"],["armor","방어구","./images/방어구.png"],["accessory","장신구","./images/장신구.png"]].map(([t,lb,ic])=>(
              <button key={t} onClick={()=>{setTab(t);setSelItem(null);}} style={{
                flex:1,padding:"10px 6px",borderRadius:5,border:"none",
                background:tab===t?C.bg3:C.bg2,
                outline:`1px solid ${tab===t?C.gold+"88":C.bdr1}`,
                cursor:"pointer",
                borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",
                display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7,
                whiteSpace:"nowrap"}}>
                <img src={ic} alt={lb} style={{
                  width:20,height:20,objectFit:"contain",flexShrink:0,
                  filter:tab===t?"drop-shadow(0 0 4px rgba(200,168,74,.7)) brightness(1.2)":"brightness(0.55)"}}
                  onError={e=>{e.target.style.display="none";}}/>
                <span style={{fontSize:11,fontWeight:700,color:tab===t?C.goldL:C.t2}}>{lb}</span>
              </button>
            ))}
          </div>
          {selItem&&(
            <div style={{marginBottom:10}}>
              <CBox gold style={{padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:48,height:48,background:C.bg0,borderRadius:4,flexShrink:0,
                    border:`1px solid ${GC[gradeMap[selItem.grade]||"n"]}55`,overflow:"hidden",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <img src={selItem.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}}
                      onError={e=>{e.target.style.display="none";}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:GC[gradeMap[selItem.grade]||"n"],marginBottom:3}}>
                      {selItem.name}{(selItem.enhance||0)>0&&<span style={{color:C.goldL}}> +{selItem.enhance}</span>}
                    </div>
                    <Pill grade={selItem.grade} sm/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  <button onClick={()=>onEnhance(selItem)} style={{padding:"10px 0",borderRadius:4,border:"none",
                    background:`linear-gradient(135deg,${C.goldD},${C.gold})`,color:"#000",fontSize:11,fontWeight:800,cursor:"pointer"}}>⚡ 강화</button>
                  <button onClick={()=>{onEquip(selItem);setSelItem(null);}} style={{padding:"10px 0",borderRadius:4,background:C.bg3,
                    border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:11,fontWeight:700,cursor:"pointer"}}>🎒 장착</button>
                  <button onClick={()=>{
                    const price=getSellPrice(selItem);
                    if(window.confirm(`[${selItem.name}]\n${price.toLocaleString()} G에 판매하시겠습니까?`)){
                      onSellItem(selItem.uid,price);setSold(s=>[...s,selItem.uid]);setSelItem(null);
                    }
                  }} style={{padding:"10px 0",borderRadius:4,background:`${C.fail}18`,
                    border:`1px solid ${C.fail}44`,color:C.fail,fontSize:11,fontWeight:700,cursor:"pointer"}}>💰 판매</button>
                </div>
              </CBox>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
            {[...tabItems,...Array(Math.max(0,30-tabItems.length)).fill(null)].slice(0,30).map((item,i)=>(
              <ItemSlot key={item?.uid||`e${i}`} item={item}
                selected={selItem?.uid===item?.uid}
                onClick={it=>setSelItem(selItem?.uid===it.uid?null:it)}/>
            ))}
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ━━━━ ChestModal ━━━━
function ChestModal({onClose,charId,onAddItem,onAddGold,dailyLeft,setDailyLeft}){
  const [result,setResult]=useState(null);
  const [opening,setOpening]=useState(false);
  const [hist,setHist]=useState([]);
  const char=CHARS.find(c=>c.id===charId)||CHARS[0];

  const PROBS=[
    {g:"n",l:"일반",p:58.9949,c:C.n},{g:"m",l:"마술",p:28,c:C.m},{g:"r",l:"베르어",p:12,c:C.r},
    {g:"e",l:"에픽",p:1,c:C.e},{g:"l",l:"레전드",p:0.005,c:C.l},{g:"my",l:"신화",p:0.0001,c:C.my},
  ];
  const PROBS_DISPLAY=[
    {g:"n",l:"일반",p:"58.99%",c:C.n},{g:"m",l:"마술",p:"28%",c:C.m},{g:"r",l:"베르어",p:"12%",c:C.r},
    {g:"e",l:"에픽",p:"1%",c:C.e},{g:"l",l:"레전드",p:"0.005%",c:C.l},{g:"my",l:"신화",p:"0.0001%",c:C.my},
  ];
  const GOLD_TIERS=[{min:200,max:999,w:40},{min:1000,max:4999,w:30},{min:5000,max:14999,w:15},
    {min:15000,max:29999,w:8},{min:30000,max:49999,w:4},{min:50000,max:79999,w:2},{min:80000,max:100000,w:1}];

  const wRand=arr=>{let r=Math.random()*arr.reduce((s,i)=>s+(i.w||i.p),0);for(const i of arr){r-=(i.w||i.p);if(r<=0)return i;}return arr[arr.length-1];};

  const rollItem=(idx=0)=>{
    // 등급 뽑기 - 빈 pool이면 재시도 (최대 5번 다른 등급으로)
    let gw, pool, tries=0;
    do {
      gw=wRand(PROBS);
      pool=[
        ...rawWeapons.filter(w=>w.cls===char.weaponClass&&gradeMap[w.grade]===gw.g).map(w=>({...w,type:"weapon"})),
        ...rawArmors.filter(a=>gradeMap[a.grade]===gw.g).map(a=>({...a,type:"armor"})),
        ...rawAccs.filter(a=>gradeMap[a.grade]===gw.g).map(a=>({...a,type:"accessory"})),
      ];
      tries++;
    } while(!pool.length && tries<5);
    if(!pool.length) return null;
    const picked=pool[Math.floor(Math.random()*pool.length)];
    // uid는 호출시각+인덱스로 중복 방지
    return {...picked,uid:`${picked.id}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2,7)}`,enhance:0};
  };

  const doOpen=(count=1)=>{
    if(opening||dailyLeft<=0) return;
    const times=Math.min(count,dailyLeft);
    setOpening(true);
    setTimeout(()=>{
      const results=[];
      const ts=Date.now();
      for(let i=0;i<times;i++){
        // 1회뽑기만 골드 가능(30%), 10회연속은 무조건 아이템
        const isGold=count===1&&Math.random()<.30;
        if(isGold){
          const tier=wRand(GOLD_TIERS);
          const amount=Math.floor(Math.random()*(tier.max-tier.min+1))+tier.min;
          results.push({type:"gold",amount});
          onAddGold(amount);
        } else {
          let item=null;
          let retry=0;
          // 최대 20회 재시도로 반드시 아이템 뽑기
          while(!item&&retry<20){item=rollItem();retry++;}
          if(item){
            // uid는 rollItem에서 이미 고유하게 생성됨
            results.push({type:"item",item});
            onAddItem(item);
          } else {
            // 극히 드문 경우 골드 대체
            const tier=wRand(GOLD_TIERS);
            const amount=Math.floor(Math.random()*(tier.max-tier.min+1))+tier.min;
            results.push({type:"gold",amount});
            onAddGold(amount);
          }
        }
      }
      setDailyLeft(d=>d-times);
      setResult(results[results.length-1]);
      setHist(h=>[...results.map(r=>({...r,time:new Date().toLocaleTimeString("ko",{hour:"2-digit",minute:"2-digit"})})).reverse(),...h].slice(0,20));
      setOpening(false);
    },700);
  };

  const pct=(dailyLeft/30)*100;
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.82)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <style>{`@keyframes chestBounce{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-6px) scale(1.04)}70%{transform:translateY(2px) scale(.97)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{width:390,background:"linear-gradient(180deg,#1a1a2e 0%,#0f0f1e 30%,#0a0a14 100%)",
        borderRadius:"20px 20px 0 0",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",
        border:"1px solid rgba(200,168,74,.35)",borderBottom:"none",boxShadow:"0 -8px 40px rgba(0,0,0,.8)"}}>
        <div style={{background:"linear-gradient(90deg,rgba(200,168,74,.05),rgba(200,168,74,.15),rgba(200,168,74,.05))",
          borderBottom:"1px solid rgba(200,168,74,.2)",padding:"12px 16px",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{width:28}}/>
          <div style={{fontSize:16,fontWeight:800,color:C.goldL,textShadow:"0 0 12px rgba(200,168,74,.5)"}}>전설의 보물상자</div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,.08)",
            border:"1px solid rgba(255,255,255,.12)",color:C.t2,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"0 16px 24px",flex:1}}>
          <div style={{textAlign:"center",padding:"20px 0 8px"}}>
            <button onClick={()=>doOpen(1)} disabled={opening||dailyLeft<=0} style={{background:"none",border:"none",cursor:dailyLeft>0&&!opening?"pointer":"default",padding:0}}>
              <div style={{width:140,height:140,margin:"0 auto",background:"radial-gradient(circle at 50% 60%,rgba(200,168,74,.15),transparent 70%)",
                borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                animation:opening?"none":"chestBounce 2.5s ease-in-out infinite"}}>
                <img src="./images/보물상자.png" alt="보물상자"
                  style={{width:120,height:120,objectFit:"contain",
                    filter:"drop-shadow(0 8px 24px rgba(200,168,74,.5))",opacity:dailyLeft>0?1:.4}}
                  onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:80px;line-height:1'>📦</span>");}}/>
              </div>
            </button>
          </div>
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:14,color:C.t2,marginBottom:8}}>
              오늘은 <strong style={{fontSize:18,fontWeight:900,color:dailyLeft>0?C.goldL:C.fail}}>{dailyLeft}</strong> / 30
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:99,margin:"0 20px",overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",borderRadius:99,transition:"width .4s ease",
                background:`linear-gradient(90deg,${C.goldD},${C.goldL})`,boxShadow:"0 0 6px rgba(200,168,74,.5)"}}/>
            </div>
          </div>
          {result&&(
            <div style={{background:result.type==="gold"?"rgba(200,168,74,.1)":"rgba(255,255,255,.05)",
              border:`1px solid ${result.type==="gold"?C.goldD+"88":GC[gradeMap[result.item?.grade||"n"]||"n"]+"66"}`,
              borderRadius:8,padding:"12px",textAlign:"center",marginBottom:12,animation:"fadeUp .3s ease"}}>
              {result.type==="gold"
                ?<><div style={{marginBottom:4,display:"flex",justifyContent:"center"}}>
                    <img src="./images/골드.png" alt="" style={{width:48,height:48,objectFit:"contain",filter:"drop-shadow(0 2px 12px rgba(200,168,74,.8))"}} onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:36px'>💰</span>");}}/>
                  </div><div style={{fontSize:20,fontWeight:800,color:C.goldL}}>{result.amount.toLocaleString()} G</div></>
                :<><Pill grade={result.item.grade}/><div style={{fontSize:13,fontWeight:700,marginTop:5,color:GC[gradeMap[result.item.grade||"Common"]||"n"]}}>{result.item.name}</div></>}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            <button onClick={()=>doOpen(1)} disabled={opening||dailyLeft<=0} style={{
              padding:"14px 8px",borderRadius:8,border:"none",cursor:dailyLeft>0&&!opening?"pointer":"default",
              background:dailyLeft>0&&!opening?"linear-gradient(135deg,#b8920a,#e8c84a)":"rgba(255,255,255,.05)",
              color:dailyLeft>0&&!opening?"#000":"rgba(255,255,255,.25)",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:14,fontWeight:800}}>
              <span style={{fontSize:18}}>🛡</span>{opening?"열는 중...":"1회 택배"}
            </button>
            <button onClick={()=>doOpen(10)} disabled={opening||dailyLeft<=0} style={{
              padding:"14px 8px",borderRadius:8,cursor:dailyLeft>0&&!opening?"pointer":"default",
              background:dailyLeft>0&&!opening?"linear-gradient(135deg,#1a2a4a,#2a3a6a)":"rgba(255,255,255,.05)",
              border:`2px solid ${dailyLeft>0&&!opening?"rgba(100,150,255,.5)":"rgba(255,255,255,.08)"}`,
              color:dailyLeft>0&&!opening?C.t1:"rgba(255,255,255,.25)",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:14,fontWeight:800}}>
              <span style={{fontSize:18}}>🎯</span>10회 연속
            </button>
          </div>
          <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:8,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontSize:10,color:C.goldL,fontWeight:700,marginBottom:10}}>◆ 드랍이 재미있다</div>
            {PROBS_DISPLAY.map(x=>(
              <div key={x.g} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:x.c,flexShrink:0}}/>
                <span style={{fontSize:11,color:C.t1,minWidth:38}}>{x.l}</span>
                <div style={{flex:1,height:5,background:"rgba(255,255,255,.06)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,parseFloat(x.p)*1.5)}%`,height:"100%",background:x.c,borderRadius:99}}/>
                </div>
                <span style={{fontSize:10,fontWeight:800,color:x.c,minWidth:50,textAlign:"right"}}>{x.p}</span>
              </div>
            ))}
          </div>
          {hist.length>0&&(
            <>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:8}}>◆ 오픈 이력</div>
              {hist.map((h,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.bdr0}`}}>
                  <div style={{width:32,height:32,background:C.bg2,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",
                    border:`1px solid ${h.type==="gold"?C.goldD+"55":GC[gradeMap[h.item?.grade||"n"]||"n"]+"44"}`}}>
                    {h.type==="gold"
                      ?<img src="./images/골드.png" alt="" style={{width:"90%",height:"90%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:16px'>💰</span>");}}/>
                      :<img src={h.item?.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:h.type==="gold"?C.goldL:GC[gradeMap[h.item?.grade||"n"]||"n"]}}>
                      {h.type==="gold"?`${h.amount.toLocaleString()} G`:h.item?.name}</div>
                    {h.type==="item"&&<Pill grade={h.item?.grade||"Common"} sm/>}
                  </div>
                  <span style={{fontSize:10,color:C.t3}}>{h.time}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━ EnhModal ━━━━
function EnhModal({item:initItem,onClose,gold,onSpendGold,scrolls,onUseScroll,onUpdateItem}){
  const [item,setItem]=useState({...initItem,enhance:initItem.enhance||0});
  const [scroll,setScroll]=useState("normal");
  const [outcome,setOutcome]=useState(null);
  const lv=item.enhance;
  const prob=lv<15?SP[lv]:0;
  const g=gradeMap[item.grade]||"n";
  const gc=GC[g];
  const OC={
    success:{bg:C.succ+"22",border:C.succ,text:"⚡ 강화 성공!",tc:C.succ},
    stay:{bg:C.warn+"18",border:C.warn,text:"🔶 단계 유지",tc:C.warn},
    fail:{bg:C.fail+"18",border:C.fail,text:"💥 강화 실패 -1",tc:C.fail},
  };
  const cost=scroll==="normal"?500:2000;
  const stockKey=scroll==="normal"?"normal":"adv";
  const doEnh=()=>{
    if(gold<cost){alert("골드가 부족합니다!");return;}
    if((scrolls[stockKey]||0)<=0){alert("주문서가 없습니다!");return;}
    if(lv>=15) return;
    onSpendGold(cost);onUseScroll(stockKey);
    const r=Math.random()*100;let oc;
    if(r<prob){setItem(i=>({...i,enhance:i.enhance+1}));oc="success";}
    else if(lv>=9){oc=Math.random()*100<FK[lv]?"stay":"fail";if(oc==="fail")setItem(i=>({...i,enhance:Math.max(0,i.enhance-1)}));}
    else oc="stay";
    setOutcome(oc);
    setTimeout(()=>{onUpdateItem({...item,enhance:oc==="success"?lv+1:oc==="fail"?Math.max(0,lv-1):lv});setOutcome(null);},1400);
  };
  const st=calcStat(item.atk||item.def||0,item.grade,item.enhance,item.type==="weapon"?"weapon":"armor");
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",maxHeight:"90vh",
        overflow:"hidden",display:"flex",flexDirection:"column",border:`1px solid ${C.bdr1}`,borderBottom:"none"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:`1px solid ${C.bdr1}`,background:C.bg0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>⚡</span>
            <span style={{fontSize:15,fontWeight:700}}>아이템 강화</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,color:C.goldL,fontWeight:700}}>💰 {gold.toLocaleString()} G</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:4,background:C.bg2,
              border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:14,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"16px"}}>
          <div style={{background:`radial-gradient(circle at 50% 60%,${gc}18,${C.bg2} 70%)`,
            border:`2px solid ${outcome?OC[outcome]?.border:gc}`,borderRadius:8,padding:"16px",
            textAlign:"center",marginBottom:14,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <img src={item.img} alt={item.name} style={{width:70,height:70,objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>
            <div style={{fontSize:16,fontWeight:800,color:gc}}>{item.name} <span style={{color:C.goldL}}>+{item.enhance}</span></div>
            <Pill grade={item.grade}/>
            <div style={{fontSize:10,color:C.t2}}>
              {item.type==="weapon"?`⚔ 공격력 ${st.atk} | 💥 치명타 ${st.crit}%`:`🛡 방어력 ${st.def} | 💨 회피 ${st.eva}%`}
            </div>
            {outcome&&(
              <div style={{position:"absolute",inset:0,background:OC[outcome]?.bg,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:8,borderRadius:6}}>
                <div style={{fontSize:48}}>{outcome==="success"?"✨":outcome==="fail"?"💥":"🔶"}</div>
                <div style={{fontSize:22,fontWeight:800,color:OC[outcome]?.tc}}>{OC[outcome]?.text}</div>
              </div>
            )}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:C.t2}}>성공 확률</span>
            <span style={{fontSize:18,fontWeight:800,color:prob>=70?C.succ:prob>=40?C.warn:C.fail}}>{lv<15?`${prob}%`:"MAX"}</span>
          </div>
          <div style={{height:6,background:C.bg2,borderRadius:99,overflow:"hidden",marginBottom:14}}>
            <div style={{width:`${prob}%`,height:"100%",borderRadius:99,transition:"width .4s",background:prob>=70?C.succ:prob>=40?C.warn:C.fail}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[["normal","일반","500 G"],["adv","고급","2,000 G"]].map(([t,nm,pr])=>(
              <button key={t} onClick={()=>setScroll(t)} style={{
                border:`2px solid ${scroll===t?C.gold:C.bdr1}`,borderRadius:5,padding:"10px 8px",
                textAlign:"center",cursor:"pointer",background:scroll===t?C.bg3:C.bg2}}>
                <div style={{fontSize:20,marginBottom:3}}>📜</div>
                <div style={{fontSize:11,fontWeight:700,color:scroll===t?C.goldL:C.t1,marginBottom:1}}>{nm} 주문서</div>
                <div style={{fontSize:13,fontWeight:800,color:scroll===t?C.goldL:C.gold}}>{pr}</div>
                <div style={{fontSize:9,color:C.t3,marginTop:1}}>보유 {scrolls[t]||0}개</div>
              </button>
            ))}
          </div>
          <button onClick={doEnh} disabled={lv>=15||!!outcome} style={{
            width:"100%",padding:"14px",borderRadius:4,border:"none",
            background:lv>=15||outcome?C.bg2:`linear-gradient(135deg,${C.goldD},${C.gold})`,
            color:lv>=15||outcome?C.t3:"#000",fontSize:15,fontWeight:800,cursor:lv>=15||outcome?"default":"pointer"}}>
            {lv>=15?"◆ 최대 강화 완료":`⚡ 강화 (${cost.toLocaleString()} G)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━ ShopModal ━━━━
function ShopModal({onClose,gold,onSpendGold,onAddScrolls}){
  const [tab,setTab]=useState("weapon");
  const [qty,setQty]=useState({normal:1,adv:1});
  const [toast,setToast]=useState(null);
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2000);};
  const ITEMS={
    weapon:[
      {nm:"무기 강화 주문서",img:CONSUMABLES[0].img,sub:"일반~레어 무기 강화",price:500,type:"normal",isPremium:false},
      {nm:"프리미엄 무기 강화 주문서",img:CONSUMABLES[0].img,sub:"에픽~신화 무기 강화",price:2000,type:"adv",isPremium:true},
    ],
    armor:[
      {nm:"방어구 강화 주문서",img:CONSUMABLES[1].img,sub:"일반~레어 방어구 강화",price:500,type:"normal",isPremium:false},
      {nm:"프리미엄 방어구 강화 주문서",img:CONSUMABLES[1].img,sub:"에픽~신화 방어구 강화",price:2000,type:"adv",isPremium:true},
    ],
    accessory:[
      {nm:"장신구 강화 주문서",img:CONSUMABLES[2].img,sub:"일반~레어 장신구 강화",price:500,type:"normal",isPremium:false},
      {nm:"프리미엄 장신구 강화 주문서",img:CONSUMABLES[2].img,sub:"에픽~신화 장신구 강화",price:2000,type:"adv",isPremium:true},
    ],
  };
  const buy=(item)=>{
    const q=qty[item.type],total=item.price*q;
    if(gold<total){showToast("골드가 부족합니다!");return;}
    onSpendGold(total);onAddScrolls(item.type,q);
    showToast(`${item.nm} ${q}개 구매 완료!`);
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.82)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <style>{`.qty-btn{transition:all .15s}.qty-btn:active{transform:scale(.92)}.buy-btn{transition:all .2s}.buy-btn:hover{filter:brightness(1.1)}`}</style>
      <div style={{width:390,background:"linear-gradient(180deg,#1c1a14 0%,#141210 30%,#0e0c08 100%)",
        borderRadius:"20px 20px 0 0",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",
        border:"1px solid rgba(200,168,74,.4)",borderBottom:"none",boxShadow:"0 -8px 40px rgba(0,0,0,.8)"}}>
        <div style={{position:"relative",height:56,overflow:"hidden",flexShrink:0}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(200,168,74,.08),rgba(200,168,74,.04))"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(200,168,74,.7),transparent)"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <img src="./images/상점.png" alt="" style={{width:28,height:28,objectFit:"contain",filter:"drop-shadow(0 2px 8px rgba(180,100,255,.5))"}}
                onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:22px'>🛒</span>");}}/>
              <span style={{fontSize:16,fontWeight:800,color:C.goldL}}>강화 주문서 상점</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <img src="./images/골드.png" alt="" style={{width:20,height:20,objectFit:"contain"}}
                onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span>💰</span>");}}/>
              <span style={{fontSize:13,fontWeight:800,color:C.goldL}}>{gold.toLocaleString()} G</span>
              <button onClick={onClose} style={{marginLeft:6,width:28,height:28,borderRadius:6,
                background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",
                color:C.t2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,padding:"10px 14px 0",background:"rgba(0,0,0,.3)",
          borderBottom:"1px solid rgba(200,168,74,.2)",flexShrink:0}}>
          {[["weapon","⚔ 무기"],["armor","🛡 방어구"],["accessory","🔗 장신구"]].map(([t,lb])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1,padding:"9px 0 8px",borderRadius:"6px 6px 0 0",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",
              background:tab===t?"linear-gradient(180deg,rgba(200,168,74,.2),rgba(200,168,74,.08))":"rgba(255,255,255,.04)",
              borderTop:tab===t?`2px solid ${C.gold}`:"2px solid transparent",
              borderLeft:tab===t?"1px solid rgba(200,168,74,.3)":"1px solid transparent",
              borderRight:tab===t?"1px solid rgba(200,168,74,.3)":"1px solid transparent",
              color:tab===t?C.goldL:"rgba(255,255,255,.45)",marginBottom:tab===t?"-1px":0}}>{lb}</button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:"14px",flex:1}}>
          {(ITEMS[tab]||[]).map((it,i)=>(
            <div key={i} style={{
              background:it.isPremium?"linear-gradient(135deg,rgba(120,40,180,.2),rgba(60,20,100,.3))":"linear-gradient(135deg,rgba(200,168,74,.08),rgba(160,128,34,.05))",
              border:it.isPremium?"2px solid rgba(180,80,255,.5)":"2px solid rgba(200,168,74,.35)",
              borderRadius:10,padding:"14px",marginBottom:12,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,
                background:it.isPremium?"linear-gradient(90deg,transparent,rgba(180,80,255,.6),transparent)":"linear-gradient(90deg,transparent,rgba(200,168,74,.6),transparent)"}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:52,height:52,borderRadius:8,flexShrink:0,
                  background:it.isPremium?"rgba(120,40,180,.3)":"rgba(200,168,74,.1)",
                  border:`2px solid ${it.isPremium?"rgba(180,80,255,.6)":"rgba(200,168,74,.5)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={it.img} alt={it.nm} style={{width:"85%",height:"85%",objectFit:"contain"}}
                    onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:26px'>📜</span>");}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:4,color:it.isPremium?"#d080ff":C.goldL}}>{it.nm}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{it.sub}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:900,lineHeight:1,color:it.isPremium?"#d080ff":C.goldL}}>{it.price.toLocaleString()}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.35)",marginTop:2}}>G / 개</div>
                </div>
              </div>
              <div style={{height:1,background:it.isPremium?"rgba(180,80,255,.2)":"rgba(200,168,74,.15)",marginBottom:12}}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {[-10,-1,1,10].map(d=>(
                    <button key={d} className="qty-btn"
                      onClick={()=>setQty(q=>({...q,[it.type]:Math.max(1,Math.min(99,(q[it.type]||1)+d))}))}
                      style={{width:d===1||d===-1?30:36,height:30,borderRadius:5,cursor:"pointer",
                        background:it.isPremium?"rgba(120,40,180,.3)":"rgba(200,168,74,.1)",
                        border:`1px solid ${it.isPremium?"rgba(180,80,255,.4)":"rgba(200,168,74,.3)"}`,
                        color:it.isPremium?"#d080ff":C.goldL,fontSize:d===1||d===-1?15:10,fontWeight:800}}>
                      {d>0?`+${d}`:d}</button>
                  ))}
                  <span style={{fontSize:18,fontWeight:900,minWidth:30,textAlign:"center",color:it.isPremium?"#d080ff":C.goldL}}>{qty[it.type]||1}</span>
                </div>
                <button className="buy-btn" onClick={()=>buy(it)} style={{
                  flex:1,padding:"11px 8px",borderRadius:7,border:"none",cursor:"pointer",
                  background:it.isPremium?"linear-gradient(135deg,#7722cc,#a040e8)":"linear-gradient(135deg,#b8920a,#e8c84a)",
                  color:it.isPremium?"#fff":"#0a0800",fontSize:13,fontWeight:800}}>
                  {((qty[it.type]||1)*it.price).toLocaleString()} G 구매
                </button>
              </div>
            </div>
          ))}
          {toast&&<div style={{background:C.succ+"18",border:`1px solid ${C.succ}`,borderRadius:8,
            padding:"12px 14px",textAlign:"center",fontSize:12,color:C.succ,fontWeight:700,marginTop:8}}>{toast}</div>}
        </div>
      </div>
    </div>
  );
}

// ━━━━ RankModal ━━━━
function RankModal({onClose,myScore,myName,myChar}){
  const DEMO=[
    {rank:1,nick:"DragonSlayer",char:"아스칼론",score:328400},
    {rank:2,nick:"DarkWitch99",char:"세르민느",score:302300},
    {rank:3,nick:"RocketRacoon",char:"로켓",score:287800},
    {rank:4,nick:"ArrowGod",char:"에일린",score:241200},
    {rank:5,nick:"IronValkyrie",char:"발키리",score:198700},
    {rank:6,nick:"VoidMaster",char:"벨리아르",score:184500},
    {rank:7,nick:"HolyKnight",char:"카이렌",score:162300},
    {rank:247,nick:myName,char:myChar,score:myScore,isMe:true},
  ];
  const MEDAL=["🥇","🥈","🥉"];
  const myRankData=DEMO.find(d=>d.isMe);
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",maxHeight:"88vh",
        overflow:"hidden",display:"flex",flexDirection:"column",border:`1px solid ${C.bdr1}`,borderBottom:"none"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:`1px solid ${C.bdr1}`,background:C.bg0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🏆</span>
            <span style={{fontSize:15,fontWeight:700}}>전체 랭킹</span>
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:4,background:C.bg2,
            border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"14px"}}>
          <CBox gold style={{padding:"12px 14px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,background:C.bg0,borderRadius:6,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${C.goldD}55`}}>
                {CHARS.find(c=>c.name===myChar)?.emoji||"⚔"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:C.t2,marginBottom:2}}>{myName} · {myChar}</div>
                <div style={{fontSize:16,fontWeight:800}}>{myScore.toLocaleString()} <span style={{fontSize:11,color:C.t3}}>pt</span></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:C.t3,marginBottom:1}}>내 순위</div>
                <div style={{fontFamily:"monospace",fontSize:28,fontWeight:800,color:C.goldL,lineHeight:1}}>#247</div>
              </div>
            </div>
          </CBox>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:14}}>
            {DEMO.filter(d=>!d.isMe).slice(0,3).map((d,i)=>(
              <div key={d.rank} style={{background:C.bg2,borderRadius:6,padding:"10px 6px",textAlign:"center",
                border:`1px solid ${[C.gold+"88","rgba(192,192,192,.35)","rgba(205,127,50,.35)"][i]}`}}>
                <div style={{fontSize:20,marginBottom:5}}>{MEDAL[i]}</div>
                <div style={{width:36,height:36,borderRadius:"50%",background:C.bg0,
                  border:`2px solid ${[C.gold,"silver","#cd7f32"][i]}`,display:"flex",alignItems:"center",
                  justifyContent:"center",margin:"0 auto 6px",fontSize:18}}>
                  {CHARS.find(c=>c.name===d.char)?.emoji||"⚔"}
                </div>
                <div style={{fontSize:10,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nick}</div>
                <div style={{fontSize:9,color:C.t2,marginBottom:4}}>{d.char}</div>
                <div style={{fontSize:11,fontWeight:800,color:C.goldL}}>{d.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {DEMO.filter(d=>!d.isMe).slice(3).concat([myRankData]).filter(Boolean).map(d=>(
              <div key={d.rank} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
                borderRadius:4,background:d.isMe?C.bg3:C.bg2,
                border:`1px solid ${d.isMe?C.gold+"55":C.bdr0}`,
                boxShadow:d.isMe?`0 0 8px ${C.goldD}55`:"none"}}>
                <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,minWidth:34,color:d.isMe?C.goldL:C.t3}}>#{d.rank}</span>
                <div style={{width:30,height:30,borderRadius:"50%",background:C.bg0,
                  border:`1px solid ${d.isMe?C.gold+"55":C.bdr1}`,display:"flex",
                  alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                  {CHARS.find(c=>c.name===d.char)?.emoji||"⚔"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:d.isMe?C.goldL:C.t1}}>
                    {d.nick}{d.isMe&&<span style={{background:C.goldD+"55",color:C.goldL,borderRadius:3,
                      padding:"1px 5px",fontSize:8,fontWeight:800,marginLeft:5}}>나</span>}</div>
                  <div style={{fontSize:9,color:C.t3}}>{d.char}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:700,color:d.isMe?C.goldL:C.t1}}>{d.score.toLocaleString()}</div>
                  <div style={{fontSize:9,color:C.t3}}>pt</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ━━━━ App ━━━━
export default function App(){
  const [screen,setScreen]=useState("title");
  const [charId,setCharId]=useState(null);
  const [charName,setCharName]=useState("");
  const [gold,setGold]=useState(5000);
  const [scrolls,setScrolls]=useState({normal:3,adv:1});
  const [dailyLeft,setDailyLeft]=useState(30);
  const [inventory,setInventory]=useState([]);
  const [equipped,setEquipped]=useState({weapon:null,helmet:null,armor:null,pants:null,boots:null,cloak:null,belt:null,ring:null,earrings:null});
  const [showChest,setShowChest]=useState(false);
  const [enhItem,setEnhItem]=useState(null);
  const [showRank,setShowRank]=useState(false);
  const [showShop,setShowShop]=useState(false);
  const char=CHARS.find(c=>c.id===charId);
  const totalScore=useMemo(()=>{
    const slots=[equipped.weapon,equipped.helmet,equipped.armor,equipped.pants,
      equipped.boots,equipped.cloak,equipped.belt,equipped.ring,equipped.earrings];
    return slots.map(uid=>inventory.find(i=>i.uid===uid)).filter(Boolean).reduce((acc,it)=>{
      const st=calcStat(it.atk||it.def||0,it.grade,it.enhance||0,it.type);
      return acc+st.atk*3+st.def*2+st.mdef*2+st.crit*100+st.eva*100;
    },0);
  },[inventory,equipped]);
  const handleSelect=(id,name)=>{setCharId(id);setCharName(name);setScreen("inv");};
  const addItem=item=>setInventory(inv=>[...inv,item]);
  const addGold=amount=>setGold(g=>g+amount);
  const spendGold=amount=>setGold(g=>Math.max(0,g-amount));
  const useScroll=(type)=>setScrolls(s=>({...s,[type]:Math.max(0,(s[type]||0)-1)}));
  const addScrolls=(type,qty)=>setScrolls(s=>({...s,[type]:(s[type]||0)+qty}));
  const updateItem=updated=>setInventory(inv=>inv.map(i=>i.uid===updated.uid?updated:i));
  const equipItem=item=>{
    let slot="weapon";
    if(item.type==="weapon") slot="weapon";
    else if(item.type==="armor"){
      if(item.cat==="투구") slot="helmet";
      else if(item.cat==="갑옷") slot="armor";
      else if(item.cat==="하의") slot="pants";
      else if(item.cat==="부츠") slot="boots";
      else slot="armor";
    } else if(item.type==="accessory"){
      if(item.cat==="부츠") slot="boots";
      else if(item.cat==="반지") slot="ring";
      else if(item.cat==="귀걸이") slot="earrings";
      else slot="ring";
    }
    setEquipped(e=>({...e,[slot]:item.uid}));
  };
  const sellItem=(uid,price)=>{setGold(g=>g+price);setInventory(inv=>inv.filter(i=>i.uid!==uid));};
  return(
    <div style={{background:"#111214",minHeight:"100vh",padding:"0",
      fontFamily:"'Black Han Sans','Apple SD Gothic Neo','Noto Sans KR',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box;} input,button{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px;}
      `}</style>
      <div style={{maxWidth:390,margin:"0 auto",position:"relative"}}>
        {screen==="title"&&<TitleScreen onNew={()=>setScreen("char")} onLoad={()=>handleSelect("CHR_001","모험가")}/>}
        {screen==="char"&&<CharScreen onBack={()=>setScreen("title")} onSelect={handleSelect}/>}
        {screen==="inv"&&<InvScreen
          charId={charId||"CHR_001"} charName={charName||"모험가"}
          gold={gold} scrolls={scrolls} dailyLeft={dailyLeft}
          onChest={()=>setShowChest(true)} onShop={()=>setShowShop(true)}
          onRank={()=>setShowRank(true)} onEnhance={i=>setEnhItem(i)}
          inventory={inventory} equipped={equipped} onEquip={equipItem} onSellItem={sellItem}/>}
        {showChest&&<ChestModal onClose={()=>setShowChest(false)}
          charId={charId||"CHR_001"} onAddItem={addItem} onAddGold={addGold}
          dailyLeft={dailyLeft} setDailyLeft={setDailyLeft}/>}
        {enhItem&&<EnhModal item={enhItem} onClose={()=>setEnhItem(null)}
          gold={gold} onSpendGold={spendGold} scrolls={scrolls}
          onUseScroll={useScroll} onUpdateItem={updated=>{updateItem(updated);setEnhItem(updated);}}/>}
        {showRank&&<RankModal onClose={()=>setShowRank(false)}
          myScore={Math.round(totalScore)} myName={charName||"모험가"} myChar={char?.name||"세르민느"}/>}
        {showShop&&<ShopModal onClose={()=>setShowShop(false)}
          gold={gold} onSpendGold={spendGold} onAddScrolls={addScrolls}/>}
      </div>
    </div>
  );
}