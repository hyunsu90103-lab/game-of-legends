import { useState, useMemo } from "react";

// ── 컬러 시스템 ──
const C = {
  bg0:"#050608", bg1:"#0b0d13", bg2:"#121620", bg3:"#1b2030",
  bdr0:"rgba(255,255,255,0.03)", bdr1:"rgba(255,255,255,0.08)", bdr2:"rgba(255,255,255,0.15)",
  t1:"#f1ede2", t2:"#a3a095", t3:"#5e5c56",
  gold:"#c8a84a", goldL:"#f4e3b1", goldD:"#7a5f18",
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

// ── 캐릭터 데이터 ──
const CHARS=[
  {id:"CHR_001",name:"세르민느",role:"마법사",desc:"강력한 마력과 어둠의 마법을 사용하는 마법사", img:"./images/1.(캐릭터)세르민느.png",motion:"./motions/char_seomine.mp4",emoji:"🔮",weaponClass:"마법사공용"},
  {id:"CHR_002",name:"아스칼론",role:"전사",desc:"숲의 기운을 수호하는 강인한 전사", img:"./images/1.(캐릭터)아스칼론.png",motion:"./motions/char_askalon.mp4",emoji:"⚔️",weaponClass:"전사공용"},
  {id:"CHR_003",name:"에일린",role:"궁수",desc:"활과 화살을 자유자재로 다루는 민첩한 궁수", img:"./images/1.(캐릭터)에일린.png",motion:"./motions/char_eilin.mp4",emoji:"🏹",weaponClass:"에일린(장궁)"},
  {id:"CHR_004",name:"카이렌",role:"전사",desc:"강철 갑옷을 입은 중장갑 전사", img:"./images/1.(캐릭터)카이렌.png",motion:"./motions/char_kairen.mp4",emoji:"🛡️",weaponClass:"전사공용"},
  {id:"CHR_005",name:"로켓",role:"기술자",desc:"고성능 화기를 다루는 너구리 형태의 기술자", img:"./images/1.(캐릭터)로켓.png",motion:"./motions/char_rocket.mp4",emoji:"🔫",weaponClass:"로켓(리펄서)"},
  {id:"CHR_006",name:"발키리",role:"암살자",desc:"날개를 가진 전사이자 치명적인 공격의 소유자", img:"./images/1.(캐릭터)발키리.png",motion:"./motions/char_valkyrie.mp4",emoji:"⚙️",weaponClass:"발키리(레이저)"},
  {id:"CHR_007",name:"벨리아르",role:"마법사",desc:"어둠의 마법과 영혼의 힘을 다루는 마법사", img:"./images/1.(캐릭터)벨리아르.png",motion:"./motions/char_beliar.mp4",emoji:"👁️",weaponClass:"마법사공용"},
];

const calcStat=(baseAtk,grade,enhance,type)=>{
  const g=gradeMap[grade]||"n";
  const base=Math.abs(baseAtk);
  const enh=Math.round(base*(enhance*0.08));
  if(type==="weapon"){
    return {
      atk: base+enh, def: 0, mdef: Math.round((base+enh)*0.1),
      crit: parseFloat((Math.min(80, (enhance*2.5) + {n:3,m:6,r:10,e:15,l:22,my:35}[g])).toFixed(1)),
      eva:  parseFloat((Math.min(60, (enhance*1.5) + {n:2,m:4,r:7,e:11,l:16,my:25}[g])).toFixed(1)),
    };
  } else {
    return {
      atk: 0, def: base+enh, mdef: Math.round((base+enh)*0.6),
      crit: parseFloat((Math.min(80, enhance*1.0)).toFixed(1)),
      eva:  parseFloat((Math.min(60, enhance*0.8 + {n:1,m:2,r:4,e:7,l:12,my:20}[g])).toFixed(1)),
    };
  }
};

const rawWeapons=[
  {id:"W_WAR_001",name:"무거운 청동검",cls:"전사공용",grade:"Common",img:"./images/무거운청동검_2.png",atk:30,sell:100},
  {id:"W_WAR_002",name:"병사용 일반검",cls:"전사공용",grade:"Common",img:"./images/병사용일반검_2.png",atk:35,sell:100},
  {id:"W_WAR_011",name:"훈련용 목검",cls:"전사공용",grade:"Common",img:"./images/훈련용목검_2.png",atk:15,sell:50},
  {id:"W_WAR_012",name:"훈련용 대검",cls:"전사공용",grade:"Common",img:"./images/훈련용대검__2.png",atk:25,sell:80},
  {id:"W_WAR_013",name:"이 빠진 대검",cls:"전사공용",grade:"Common",img:"./images/이빠진대검_2.png",atk:32,sell:100},
  {id:"W_WAR_003",name:"기사의 검",cls:"전사공용",grade:"Magic",img:"./images/기사의검_2.png",atk:90,sell:500},
  {id:"W_WAR_004",name:"마력 깃든 강철검",cls:"전사공용",grade:"Magic",img:"./images/마력깃든강철검_2.png",atk:95,sell:500},
  {id:"W_WAR_005",name:"마력 대검",cls:"전사공용",grade:"Magic",img:"./images/마력대검_2.png",atk:100,sell:500},
  {id:"W_WAR_006",name:"가디언의 가시 대검",cls:"전사공용",grade:"Magic",img:"./images/가디언의가시대검.png",atk:110,sell:500},
  {id:"W_WAR_014",name:"은빛 예리한 대검",cls:"전사공용",grade:"Magic",img:"./images/은빛예리한대검_2.png",atk:105,sell:500},
  {id:"W_WAR_007",name:"요정강철 양손검",cls:"전사공용",grade:"Rare",img:"./images/요정강철양손검_2.png",atk:220,sell:1500},
  {id:"W_WAR_015",name:"정령 대검",cls:"전사공용",grade:"Rare",img:"./images/정령대검.png",atk:250,sell:1500},
  {id:"W_WAR_016",name:"정령의 대검",cls:"전사공용",grade:"Rare",img:"./images/정령의대검.png",atk:260,sell:1500},
  {id:"W_WAR_017",name:"파란빛 환영검",cls:"전사공용",grade:"Rare",img:"./images/파란빛환영검.png",atk:280,sell:1500},
  {id:"W_WAR_008",name:"금빛 영광 대검",cls:"전사공용",grade:"Epic",img:"./images/금빛영광대검.png",atk:550,sell:5000},
  {id:"W_WAR_018",name:"크리스탈 벵가드",cls:"전사공용",grade:"Epic",img:"./images/크리스탈뱅가드.png",atk:580,sell:5000},
  {id:"W_WAR_019",name:"황혼의 심판자",cls:"전사공용",grade:"Epic",img:"./images/황혼의심판자.png",atk:600,sell:5000},
  {id:"W_WAR_009",name:"국왕 수호대의 영광",cls:"전사공용",grade:"Legend",img:"./images/국왕수호대의영광.png",atk:1500,sell:20000},
  {id:"W_WAR_010",name:"드래곤의 심장",cls:"전사공용",grade:"Legend",img:"./images/드래곤의심장.png",atk:1600,sell:20000},
  {id:"W_WAR_020",name:"태양브레이커 대검",cls:"전사공용",grade:"Mythic",img:"./images/태양브레이커대검.png",atk:3500,sell:50000},
  // 에일린
  {id:"W_AIL_001",name:"견습생의 활",cls:"에일린(장궁)",grade:"Common",img:"./images/견습생의활.png",atk:15,sell:100},
  {id:"W_AIL_002",name:"강화된 사냥활",cls:"에일린(장궁)",grade:"Common",img:"./images/강화된사냥활.png",atk:25,sell:100},
  {id:"W_AIL_003",name:"무거운 활",cls:"에일린(장궁)",grade:"Common",img:"./images/무거운활.png",atk:35,sell:100},
  {id:"W_AIL_012",name:"병사의 장궁",cls:"에일린(장궁)",grade:"Common",img:"./images/병사의장궁.png",atk:40,sell:100},
  {id:"W_AIL_013",name:"사냥용 활",cls:"에일린(장궁)",grade:"Common",img:"./images/사냥용활.png",atk:35,sell:100},
  {id:"W_AIL_020",name:"훈련용 활",cls:"에일린(장궁)",grade:"Common",img:"./images/훈련용활.png",atk:20,sell:100},
  {id:"W_AIL_004",name:"마력 깃든 활",cls:"에일린(장궁)",grade:"Magic",img:"./images/마력깃든활.png",atk:80,sell:500},
  {id:"W_AIL_005",name:"룬의 활",cls:"에일린(장궁)",grade:"Magic",img:"./images/룬의활.png",atk:95,sell:500},
  {id:"W_AIL_016",name:"정령의 활",cls:"에일린(장궁)",grade:"Magic",img:"./images/정령의활.png",atk:110,sell:500},
  {id:"W_AIL_006",name:"가디언의 활",cls:"에일린(장궁)",grade:"Rare",img:"./images/가디언의활.png",atk:180,sell:1500},
  {id:"W_AIL_007",name:"달빛 요정의 활",cls:"에일린(장궁)",grade:"Rare",img:"./images/달빛요정의활.png",atk:210,sell:1500},
  {id:"W_AIL_011",name:"바람정령의 활",cls:"에일린(장궁)",grade:"Rare",img:"./images/바람정령의활.png",atk:250,sell:1500},
  {id:"W_AIL_017",name:"크리스탈 장궁",cls:"에일린(장궁)",grade:"Rare",img:"./images/크리스탈장궁.png",atk:260,sell:1500},
  {id:"W_AIL_018",name:"파란빛의 장궁",cls:"에일린(장궁)",grade:"Rare",img:"./images/파란빛의장궁.png",atk:280,sell:1500},
  {id:"W_AIL_008",name:"가이아의 달빛 장궁",cls:"에일린(장궁)",grade:"Epic",img:"./images/가이아의달빛장궁.png",atk:450,sell:5000},
  {id:"W_AIL_014",name:"영광의 대궁",cls:"에일린(장궁)",grade:"Epic",img:"./images/영광의대궁.png",atk:550,sell:5000},
  {id:"W_AIL_009",name:"국왕 수호대의 영광",cls:"에일린(장궁)",grade:"Legend",img:"./images/국와수호대의영광.png",atk:1200,sell:20000},
  {id:"W_AIL_010",name:"드래곤 스케일",cls:"에일린(장궁)",grade:"Legend",img:"./images/드래곤스케일.png",atk:1400,sell:20000},
  {id:"W_AIL_019",name:"황혼의 저격활",cls:"에일린(장궁)",grade:"Legend",img:"./images/황혼의저격활.png",atk:1500,sell:20000},
  {id:"W_AIL_015",name:"은하의 파멸",cls:"에일린(장궁)",grade:"Mythic",img:"./images/은하의파멸.png",atk:3000,sell:50000},
  // 마법사공용
  {id:"W_MAG_001",name:"마법 스틱",cls:"마법사공용",grade:"Common",img:"./images/마법스틱.png",atk:20,sell:100},
  {id:"W_MAG_002",name:"벨리아르 지팡이",cls:"마법사공용",grade:"Common",img:"./images/벨르아르지팡이.png",atk:35,sell:100},
  {id:"W_MAG_011",name:"오크의 주술사",cls:"마법사공용",grade:"Common",img:"./images/오크의주술사.png",atk:25,sell:100},
  {id:"W_MAG_012",name:"이끼 낀 나무 지팡이",cls:"마법사공용",grade:"Common",img:"./images/이끼낀나무지팡이.png",atk:30,sell:100},
  {id:"W_MAG_003",name:"매직 입문자 스틱",cls:"마법사공용",grade:"Magic",img:"./images/매직입문자스틱.png",atk:85,sell:500},
  {id:"W_MAG_004",name:"영혼의 지팡이",cls:"마법사공용",grade:"Magic",img:"./images/영혼의지팡이.png",atk:105,sell:500},
  {id:"W_MAG_013",name:"흑마법사 스틱",cls:"마법사공용",grade:"Magic",img:"./images/흑마법사스틱.png",atk:90,sell:500},
  {id:"W_MAG_014",name:"카주라안 스틱",cls:"마법사공용",grade:"Magic",img:"./images/카주라안스틱.png",atk:100,sell:500},
  {id:"W_MAG_005",name:"심연의 눈물 지팡이",cls:"마법사공용",grade:"Rare",img:"./images/심연의눈물지팡이.png",atk:240,sell:1500},
  {id:"W_MAG_006",name:"루비 크리티컬",cls:"마법사공용",grade:"Rare",img:"./images/루비크리티컬.png",atk:280,sell:1500},
  {id:"W_MAG_015",name:"파란빛의 지팡이",cls:"마법사공용",grade:"Rare",img:"./images/파란빛의지팡이.png",atk:250,sell:1500},
  {id:"W_MAG_016",name:"차원의 왜곡",cls:"마법사공용",grade:"Rare",img:"./images/차원의왜곡.png",atk:270,sell:1500},
  {id:"W_MAG_017",name:"황혼의 스틱",cls:"마법사공용",grade:"Rare",img:"./images/황혼의스틱.png",atk:290,sell:1500},
  {id:"W_MAG_007",name:"네크로멘서의 혼령",cls:"마법사공용",grade:"Epic",img:"./images/네크로멘서의혼령.png",atk:550,sell:5000},
  {id:"W_MAG_008",name:"영혼의 약탈자",cls:"마법사공용",grade:"Epic",img:"./images/영혼의약탈자.png",atk:580,sell:5000},
  {id:"W_MAG_009",name:"멸망의 전조",cls:"마법사공용",grade:"Epic",img:"./images/멸망의전조.png",atk:600,sell:5000},
  {id:"W_MAG_018",name:"크리스탈 뱅가드",cls:"마법사공용",grade:"Epic",img:"./images/크리스탈뱅가드.png",atk:550,sell:5000},
  {id:"W_MAG_019",name:"황금 네크로멘서 혼령",cls:"마법사공용",grade:"Epic",img:"./images/황금네크로멘서혼련.png",atk:590,sell:5000},
  {id:"W_MAG_010",name:"공허의 심연",cls:"마법사공용",grade:"Legend",img:"./images/공허의심연.png",atk:1600,sell:20000},
  {id:"W_MAG_020",name:"혼돈의 카오스 오브",cls:"마법사공용",grade:"Mythic",img:"./images/혼돈의카오스오브.png",atk:3500,sell:50000},
  // 로켓
  {id:"W_ROC_001",name:"고철 권총",cls:"로켓(리펄서)",grade:"Common",img:"./images/고철권총.png",atk:15,sell:100},
  {id:"W_ROC_002",name:"녹슨 권총",cls:"로켓(리펄서)",grade:"Common",img:"./images/녹슨권총.png",atk:20,sell:100},
  {id:"W_ROC_003",name:"낡은 개틀링건",cls:"로켓(리펄서)",grade:"Common",img:"./images/낡은개틀링건.png",atk:35,sell:100},
  {id:"W_ROC_011",name:"연습용 화승총",cls:"로켓(리펄서)",grade:"Common",img:"./images/연습용화승총_2.png",atk:25,sell:100},
  {id:"W_ROC_012",name:"청동 머스킷",cls:"로켓(리펄서)",grade:"Common",img:"./images/청동머스킷_2.png",atk:30,sell:100},
  {id:"W_ROC_004",name:"마도 탄환 권총",cls:"로켓(리펄서)",grade:"Magic",img:"./images/마도탄환권총.png",atk:85,sell:500},
  {id:"W_ROC_005",name:"스파크 리볼버",cls:"로켓(리펄서)",grade:"Magic",img:"./images/스파크리볼버.png",atk:95,sell:500},
  {id:"W_ROC_006",name:"강화 사냥총",cls:"로켓(리펄서)",grade:"Magic",img:"./images/강화사냥총.png",atk:110,sell:500},
  {id:"W_ROC_013",name:"하이테크 액션건",cls:"로켓(리펄서)",grade:"Magic",img:"./images/하이테크액션건_2.png",atk:100,sell:500},
  {id:"W_ROC_007",name:"레이저 빔 라이플",cls:"로켓(리펄서)",grade:"Rare",img:"./images/레이저빔라이플.png",atk:220,sell:1500},
  {id:"W_ROC_008",name:"볼트 레이저 건",cls:"로켓(리펄서)",grade:"Rare",img:"./images/볼트레이저건.png",atk:250,sell:1500},
  {id:"W_ROC_014",name:"플라즈마 스나이퍼",cls:"로켓(리펄서)",grade:"Rare",img:"./images/플라즈마스나이퍼_2.png",atk:280,sell:1500},
  {id:"W_ROC_015",name:"은하 저격총",cls:"로켓(리펄서)",grade:"Epic",img:"./images/은하저격총_2.png",atk:550,sell:5000},
  {id:"W_ROC_016",name:"차원의 도약 소총",cls:"로켓(리펄서)",grade:"Epic",img:"./images/차원의도약소총_2.png",atk:580,sell:5000},
  {id:"W_ROC_017",name:"퀘이사 개틀링",cls:"로켓(리펄서)",grade:"Epic",img:"./images/콰이사개틀링_2.png",atk:600,sell:5000},
  {id:"W_ROC_009",name:"성층 레일건",cls:"로켓(리펄서)",grade:"Legend",img:"./images/성층레일건.png",atk:1500,sell:20000},
  {id:"W_ROC_018",name:"은하 무법자 라이플",cls:"로켓(리펄서)",grade:"Legend",img:"./images/은하무법자라이플_2.png",atk:1600,sell:20000},
  {id:"W_ROC_010",name:"빅뱅 데스스타 라이플",cls:"로켓(리펄서)",grade:"Mythic",img:"./images/빅뱅데스터라이플.png",atk:3500,sell:100000},
  // 발키리
  {id:"W_VAL_001",name:"고철 건틀렛",cls:"발키리(레이저)",grade:"Common",img:"./images/고철건틀렛.png",atk:15,sell:100},
  {id:"W_VAL_002",name:"녹슨 레버 펀치",cls:"발키리(레이저)",grade:"Common",img:"./images/녹슨레버펀치.png",atk:25,sell:100},
  {id:"W_VAL_011",name:"연습용 블레이드",cls:"발키리(레이저)",grade:"Common",img:"./images/연습용블레이드.png",atk:30,sell:100},
  {id:"W_VAL_012",name:"청동 건블레이드",cls:"발키리(레이저)",grade:"Common",img:"./images/청동건블레이드.png",atk:35,sell:100},
  {id:"W_VAL_003",name:"매직 강화 블레이드",cls:"발키리(레이저)",grade:"Magic",img:"./images/매직강화블레이드.png",atk:85,sell:500},
  {id:"W_VAL_004",name:"매직 스나이퍼",cls:"발키리(레이저)",grade:"Magic",img:"./images/매직스나이퍼.png",atk:90,sell:500},
  {id:"W_VAL_005",name:"매직 시저볼버",cls:"발키리(레이저)",grade:"Magic",img:"./images/매직시저볼버.png",atk:95,sell:500},
  {id:"W_VAL_006",name:"마도탄 건틀렛",cls:"발키리(레이저)",grade:"Magic",img:"./images/마도탄건틀렛.png",atk:105,sell:500},
  {id:"W_VAL_013",name:"차원의 숏레이드",cls:"발키리(레이저)",grade:"Magic",img:"./images/차원의숏레이드.png",atk:95,sell:500},
  {id:"W_VAL_014",name:"테크 볼트 액션",cls:"발키리(레이저)",grade:"Magic",img:"./images/테크볼트액션.png",atk:105,sell:500},
  {id:"W_VAL_015",name:"수호자의 창검",cls:"발키리(레이저)",grade:"Magic",img:"./images/수호자의창검.png",atk:115,sell:500},
  {id:"W_VAL_007",name:"블루라이트 건틀렛",cls:"발키리(레이저)",grade:"Rare",img:"./images/블루라이트건틀렛.png",atk:250,sell:1500},
  {id:"W_VAL_010",name:"레드핏 블레이드",cls:"발키리(레이저)",grade:"Rare",img:"./images/레드핏블레이드.png",atk:280,sell:1500},
  {id:"W_VAL_016",name:"쌍블레이드",cls:"발키리(레이저)",grade:"Rare",img:"./images/쌍블레이드.png",atk:260,sell:1500},
  {id:"W_VAL_017",name:"케롤 블레이드",cls:"발키리(레이저)",grade:"Rare",img:"./images/케롤블레이드.png",atk:275,sell:1500},
  {id:"W_VAL_018",name:"케이샤 게틀링",cls:"발키리(레이저)",grade:"Rare",img:"./images/케이샤게틀링.png",atk:290,sell:1500},
  {id:"W_VAL_019",name:"어둠의 창시검",cls:"발키리(레이저)",grade:"Epic",img:"./images/어둠의창시검.png",atk:580,sell:5000},
  {id:"W_VAL_008",name:"금빛 은하 가시검",cls:"발키리(레이저)",grade:"Legend",img:"./images/금빛은하가시검.png",atk:1500,sell:20000},
  {id:"W_VAL_009",name:"금빛 트레이저건",cls:"발키리(레이저)",grade:"Legend",img:"./images/금빛트레이저건.png",atk:1600,sell:20000},
  {id:"W_VAL_020",name:"신화의 창조건",cls:"발키리(레이저)",grade:"Mythic",img:"./images/신화의창조건.png",atk:3500,sell:100000},
];

// ── 방어구 데이터 ──
const rawArmors=[
  {id:"A_COM_H001",name:"사슬 투구",cat:"투구",grade:"Common",img:"./images/사슬투구.png",def:10,sell:100},
  {id:"A_COM_H002",name:"강철의 투구",cat:"투구",grade:"Common",img:"./images/강철의투구.png",def:15,sell:100},
  {id:"A_COM_H011",name:"청동 투구",cat:"투구",grade:"Common",img:"./images/청동투구.png",def:20,sell:100},
  {id:"A_COM_H003",name:"레어 투구",cat:"투구",grade:"Magic",img:"./images/레어투구.png",def:25,sell:500},
  {id:"A_COM_H004",name:"룬의 모자",cat:"투구",grade:"Magic",img:"./images/룬의모자.png",def:28,sell:500},
  {id:"A_COM_H005",name:"룬의 투구",cat:"투구",grade:"Magic",img:"./images/룬의투구.png",def:30,sell:500},
  {id:"A_COM_H006",name:"마력의 두건",cat:"투구",grade:"Magic",img:"./images/마력의두건.png",def:32,sell:500},
  {id:"A_COM_H007",name:"매직 청동 투구",cat:"투구",grade:"Magic",img:"./images/매직청동투구.png",def:35,sell:500},
  {id:"A_COM_H012",name:"아이오니 투구",cat:"투구",grade:"Magic",img:"./images/아이오니투구.png",def:38,sell:500},
  {id:"A_COM_H008",name:"블루 레어 투구",cat:"투구",grade:"Rare",img:"./images/블루레어투구.png",def:50,sell:1500},
  {id:"A_COM_H009",name:"가시온 투구",cat:"투구",grade:"Rare",img:"./images/가시온투구.png",def:55,sell:1500},
  {id:"A_COM_H013",name:"샤인부르의 투구",cat:"투구",grade:"Rare",img:"./images/샤인부르의투구.png",def:60,sell:1500},
  {id:"A_COM_H014",name:"아우라의 투구",cat:"투구",grade:"Rare",img:"./images/아우라의투구.png",def:65,sell:1500},
  {id:"A_COM_H010",name:"골든 크라운",cat:"투구",grade:"Epic",img:"./images/골든크라운.png",def:80,sell:5000},
  {id:"A_COM_H015",name:"슬라리스 지휘관",cat:"투구",grade:"Epic",img:"./images/슬라리스지휘관.png",def:85,sell:5000},
  {id:"A_COM_H016",name:"천사의 지휘관",cat:"투구",grade:"Epic",img:"./images/천사의지휘관.png",def:88,sell:5000},
  {id:"A_COM_H017",name:"황금빛 계시록",cat:"투구",grade:"Epic",img:"./images/황금빛계시록.png",def:90,sell:5000},
  {id:"A_COM_H018",name:"황금 에픽 투구",cat:"투구",grade:"Epic",img:"./images/황금에픽투구.png",def:95,sell:5000},
  {id:"A_COM_H019",name:"심연의 엘름",cat:"투구",grade:"Legend",img:"./images/심연의엘름.png",def:150,sell:20000},
  {id:"A_COM_H020",name:"신화의 크라운",cat:"투구",grade:"Mythic",img:"./images/신화의크라운.png",def:300,sell:100000},
  // 갑옷
  {id:"A_COM_A001",name:"견습용 갑옷",cat:"갑옷",grade:"Common",img:"./images/견습용갑옷.png",def:15,sell:100},
  {id:"A_COM_A002",name:"강철 갑옷",cat:"갑옷",grade:"Common",img:"./images/강철갑옷.png",def:20,sell:100},
  {id:"A_COM_A003",name:"강화 사슬 메일",cat:"갑옷",grade:"Common",img:"./images/강화사슬메일.png",def:25,sell:100},
  {id:"A_COM_A011",name:"슈미르의 갑옷",cat:"갑옷",grade:"Common",img:"./images/슈미르의갑옷.png",def:30,sell:100},
  {id:"A_COM_A004",name:"룬 사슬 재킷",cat:"갑옷",grade:"Magic",img:"./images/룬사슬재킷.png",def:35,sell:500},
  {id:"A_COM_A005",name:"강철 매직 갑옷",cat:"갑옷",grade:"Magic",img:"./images/강철매직갑옷.png",def:40,sell:500},
  {id:"A_COM_A006",name:"마력의 깃털 갑옷",cat:"갑옷",grade:"Magic",img:"./images/마렷의깃털갑옷.png",def:45,sell:500},
  {id:"A_COM_A012",name:"민첩의 갑옷",cat:"갑옷",grade:"Magic",img:"./images/민첩의갑옷.png",def:48,sell:500},
  {id:"A_COM_A007",name:"라이튠의 갑옷",cat:"갑옷",grade:"Rare",img:"./images/라이튠의갑옷.png",def:70,sell:1500},
  {id:"A_COM_A013",name:"블루 수호자의 갑옷",cat:"갑옷",grade:"Rare",img:"./images/블루수호자의갑옷.png",def:65,sell:1500},
  {id:"A_COM_A014",name:"벨크리어 갑옷",cat:"갑옷",grade:"Rare",img:"./images/벨크리어갑옷.png",def:75,sell:1500},
  {id:"A_COM_A008",name:"레피논의 갑옷",cat:"갑옷",grade:"Epic",img:"./images/레피논의갑옷.png",def:95,sell:5000},
  {id:"A_COM_A009",name:"대천사의 흉갑",cat:"갑옷",grade:"Epic",img:"./images/대천사의흉갑.png",def:105,sell:5000},
  {id:"A_COM_A015",name:"샤이피르의 갑옷",cat:"갑옷",grade:"Epic",img:"./images/샤이피르의갑옷.png",def:90,sell:5000},
  {id:"A_COM_A016",name:"황금 기사의 갑옷",cat:"갑옷",grade:"Epic",img:"./images/황금기사의갑옷.png",def:100,sell:5000},
  {id:"A_COM_A017",name:"황금 수호 갑옷",cat:"갑옷",grade:"Epic",img:"./images/황금수호갑옷.png",def:105,sell:5000},
  {id:"A_COM_A018",name:"태양의 수호 갑옷",cat:"갑옷",grade:"Epic",img:"./images/태양의수호갑옷.png",def:110,sell:5000},
  {id:"A_COM_A010",name:"가이아의 갑옷",cat:"갑옷",grade:"Legend",img:"./images/가이아의갑옷.png",def:130,sell:20000},
  {id:"A_COM_A019",name:"심연의 갑옷",cat:"갑옷",grade:"Legend",img:"./images/심연의갑옷.png",def:140,sell:20000},
  {id:"A_COM_A020",name:"신화의 갑옷",cat:"갑옷",grade:"Mythic",img:"./images/신화의갑옷.png",def:300,sell:100000},
  // 하의
  {id:"A_COM_P001",name:"린넨 바지",cat:"하의",grade:"Common",img:"./images/린넨바지.png",def:12,sell:100},
  {id:"A_COM_P002",name:"가벼운 바지",cat:"하의",grade:"Common",img:"./images/가벼운바지.png",def:14,sell:100},
  {id:"A_COM_P003",name:"낡은 바지",cat:"하의",grade:"Common",img:"./images/낡은바지.png",def:16,sell:100},
  {id:"A_COM_P004",name:"가죽 하의",cat:"하의",grade:"Common",img:"./images/가죽하의.png",def:18,sell:100},
  {id:"A_COM_P005",name:"마력의 팬츠",cat:"하의",grade:"Magic",img:"./images/마력의팬츠.png",def:25,sell:500},
  {id:"A_COM_P006",name:"숲의 영혼 바지",cat:"하의",grade:"Magic",img:"./images/숲의영혼바지.png",def:30,sell:500},
  {id:"A_COM_P007",name:"매직 룬 팬츠",cat:"하의",grade:"Magic",img:"./images/매직룬팬츠.png",def:35,sell:500},
  {id:"A_COM_P008",name:"블루라이트 팬츠",cat:"하의",grade:"Rare",img:"./images/블루라이트팬츠.png",def:45,sell:1500},
  {id:"A_COM_P009",name:"샤우론의 팬츠",cat:"하의",grade:"Rare",img:"./images/샤우론의팬츠.png",def:50,sell:1500},
  {id:"A_COM_P010",name:"샤피르의 팬츠",cat:"하의",grade:"Rare",img:"./images/샤피르의팬츠.png",def:55,sell:1500},
  {id:"A_COM_P011",name:"황금 강철 팬츠",cat:"하의",grade:"Epic",img:"./images/황금강철팬츠.png",def:75,sell:5000},
  {id:"A_COM_P012",name:"화려한 금빛 팬츠",cat:"하의",grade:"Epic",img:"./images/화려한금빛팬츠.png",def:85,sell:5000},
  {id:"A_COM_P013",name:"심연의 영혼 팬츠",cat:"하의",grade:"Legend",img:"./images/심연의영혼팬츠.png",def:110,sell:20000},
  {id:"A_COM_P014",name:"신화의 바지",cat:"하의",grade:"Mythic",img:"./images/신화의바지.png",def:250,sell:100000},
  // 망토
  {id:"A_COM_C001",name:"낡은 전사의 망토",cat:"망토",grade:"Common",img:"./images/사슬투구.png",def:5,sell:100},
  {id:"A_COM_C002",name:"기사단 영광 망토",cat:"망토",grade:"Rare",img:"./images/레어투구.png",def:35,sell:1500},
];

// ── 장신구 데이터 ──
const rawAccs=[
  // 부츠
  {id:"A_COM_B001",name:"기본 부츠",cat:"부츠",grade:"Common",img:"./images/기본부츠.png",def:5,sell:100},
  {id:"A_COM_B002",name:"일반 부츠",cat:"부츠",grade:"Common",img:"./images/일반부츠.png",def:6,sell:100},
  {id:"A_COM_B003",name:"용맹의 부츠",cat:"부츠",grade:"Common",img:"./images/용맹의부츠.png",def:8,sell:100},
  {id:"A_COM_B004",name:"강철 룬의 부츠",cat:"부츠",grade:"Magic",img:"./images/강철룬의부츠.png",def:12,sell:500},
  {id:"A_COM_B005",name:"사이아의 부츠",cat:"부츠",grade:"Rare",img:"./images/사이아의부츠.png",def:20,sell:1500},
  {id:"A_COM_B006",name:"사파이어 부츠",cat:"부츠",grade:"Rare",img:"./images/사파이어부츠.png",def:22,sell:1500},
  {id:"A_COM_B007",name:"대천사의 부츠",cat:"부츠",grade:"Epic",img:"./images/대천사의부츠.png",def:30,sell:5000},
  {id:"A_COM_B008",name:"수호의 장화",cat:"부츠",grade:"Epic",img:"./images/수호의장화.png",def:32,sell:5000},
  {id:"A_COM_B009",name:"아스텔 부츠",cat:"부츠",grade:"Legend",img:"./images/아스텔부츠.png",def:40,sell:20000},
  {id:"A_COM_B010",name:"신화의 부츠",cat:"부츠",grade:"Mythic",img:"./images/신화의부츠.png",def:50,sell:100000},
  // 반지
  {id:"A_COM_R001",name:"구리 반지",cat:"반지",grade:"Common",img:"./images/구리반지.png",def:1,sell:50},
  {id:"A_COM_R002",name:"銀빛 링",cat:"반지",grade:"Common",img:"./images/은빛링.png",def:2,sell:100},
  {id:"A_COM_R003",name:"매직 마법 반지",cat:"반지",grade:"Magic",img:"./images/매직마법반지.png",def:5,sell:500},
  {id:"A_COM_R004",name:"초록빛 마법 반지",cat:"반지",grade:"Magic",img:"./images/초록빛마법반지.png",def:8,sell:500},
  {id:"A_COM_R005",name:"애매랄드 반지",cat:"반지",grade:"Magic",img:"./images/애매랄드반지.png",def:15,sell:1500},
  {id:"A_COM_R006",name:"국왕 기사단의 반지",cat:"반지",grade:"Rare",img:"./images/국왕기사단의반지.png",def:20,sell:1500},
  {id:"A_COM_R007",name:"사파이어 반지",cat:"반지",grade:"Rare",img:"./images/사파이어반지.png",def:25,sell:1500},
  {id:"A_COM_R010",name:"황금기사 반지",cat:"반지",grade:"Epic",img:"./images/황금기사반지_2.png",def:40,sell:20000},
  {id:"A_COM_R008",name:"영혼 수호대의 반지",cat:"반지",grade:"Legend",img:"./images/영혼수호대의반지.png",def:55,sell:5000},
  {id:"A_COM_R009",name:"심연의 반지",cat:"반지",grade:"Legend",img:"./images/심연의반지.png",def:60,sell:20000},
  {id:"A_COM_R011",name:"신화의 반지",cat:"반지",grade:"Mythic",img:"./images/신화의반지.png",def:120,sell:100000},
  // 귀걸이
  {id:"A_COM_E001",name:"일반 이어링",cat:"귀걸이",grade:"Common",img:"./images/일반이어링.png",def:1,sell:50},
  {id:"A_COM_E002",name:"매직 이어링",cat:"귀걸이",grade:"Magic",img:"./images/매직이어링.png",def:2,sell:100},
  {id:"A_COM_E003",name:"매직 룬 귀걸이",cat:"귀걸이",grade:"Magic",img:"./images/매직룬귀걸이.png",def:5,sell:500},
  {id:"A_COM_E007",name:"아크 플래쉬 귀걸이",cat:"귀걸이",grade:"Magic",img:"./images/아크플래쉬귀걸이.png",def:30,sell:5000},
  {id:"A_COM_E004",name:"블루 정령 귀걸이",cat:"귀걸이",grade:"Rare",img:"./images/블루정령귀걸이.png",def:8,sell:500},
  {id:"A_COM_E005",name:"심오한 정령 귀걸이",cat:"귀걸이",grade:"Rare",img:"./images/심오한정령귀걸이.png",def:15,sell:1500},
  {id:"A_COM_E006",name:"골든 귀걸이",cat:"귀걸이",grade:"Epic",img:"./images/골든귀걸이.png",def:20,sell:1500},
  {id:"A_COM_E008",name:"가이아의 귀걸이",cat:"귀걸이",grade:"Epic",img:"./images/가이아의귀걸이.png",def:40,sell:5000},
  {id:"A_COM_E009",name:"심연의 귀걸이",cat:"귀걸이",grade:"Legend",img:"./images/심연의귀걸이.png",def:60,sell:20000},
  {id:"A_COM_E010",name:"드래곤의 귀걸이",cat:"귀걸이",grade:"Legend",img:"./images/드래곤의귀걸이.png",def:70,sell:20000},
  {id:"A_COM_E011",name:"신화의 귀걸이",cat:"귀걸이",grade:"Mythic",img:"./images/신화의귀걸이.png",def:120,sell:100000},
  // 벨트
  {id:"A_COM_BT001",name:"낡은 가죽 벨트",cat:"벨트",grade:"Common",img:"./images/구리반지.png",def:3,sell:50},
  {id:"A_COM_BT002",name:"골든 드래곤 벨트",cat:"벨트",grade:"Epic",img:"./images/황금기사반지_2.png",def:30,sell:5000},
];

const CONSUMABLES=[
  {id:"S_ETC_001",name:"무기 강화 주문서",grade:"Common",img:"./images/Generate _Weapon enhancement scroll for web game, 2D style, luxurious and p_20260529_181343_0000.png",sell:1000,type:"scroll_weapon"},
  {id:"S_ETC_002",name:"방어구 강화 주문서",grade:"Common",img:"./images/Generate _Armor enhancement scroll for web game, 2D style, luxurious and pr_20260529_181328_0000.png",sell:1000,type:"scroll_armor"},
  {id:"S_ETC_003",name:"장신구 강화 주문서",grade:"Common",img:"./images/Generate _Accessory enhancement scroll for web game, 2D style, luxurious an_20260529_181315_0000.png",sell:1000,type:"scroll_acc"},
  {id:"S_ETC_004",name:"럭셔리 보물상자",grade:"Rare",img:"./images/Generate _Luxurious treasure chest for web game, 2D style, elegant and prem_20260529_181428_0000.png",sell:5000,type:"chest"},
];

const Pill=({grade,sm})=>{
  const g=gradeMap[grade]||grade;
  const c=GC[g],bg=GB[g];
  return <span style={{display:"inline-block",borderRadius:3,padding:sm?"1px 5px":"2px 8px",fontSize:sm?9:10,fontWeight:700,color:c,background:bg,border:`1px solid ${c}44`}}>◆ {GN[g]}</span>;
};
const EnhTag=({n})=>n>0?<span style={{fontSize:9,fontWeight:800,color:C.goldL,background:"rgba(200,168,74,.15)",borderRadius:3,padding:"1px 5px"}}>+{n}</span>:null;
const Divider=({my=8})=><div style={{height:1,background:C.bdr0,margin:`${my}px 0`}}/>;

const Phone=({children})=>(
  <div style={{width:390,background:C.bg0,borderRadius:20,overflow:"hidden",
    boxShadow:"0 32px 80px rgba(0,0,0,.8)",
    fontFamily:"'Cinzel', 'Noto Serif KR', serif", // 전체 폰트 명품 스타일로 튜닝
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
        borderTop:  i<2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderBottom:i>=2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderLeft:  i%2===0?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderRight: i%2===1?`2px solid ${gold?C.gold:C.bdr2}`:undefined}}/>
    ))}
    {children}
  </div>
);

const ItemSlot=({item,selected,onClick,size=1})=>{
  const g=gradeMap[item?.grade]||"n";
  const s=size===1?{fontSize:16,enh:7,bar:2}:{fontSize:14,enh:6,bar:2};
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
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
          <span style={{fontSize:s.fontSize,opacity:.5,position:"relative",zIndex:1,display:"none",alignItems:"center",justifyContent:"center"}}>
            {item.type==="weapon"?"⚔":item.type==="armor"?"🛡":"💍"}
          </span>
          {(item.enhance||0)>0&&<span style={{position:"absolute",top:2,left:2,fontSize:s.enh,fontWeight:800,color:C.goldL,lineHeight:1}}>+{item.enhance}</span>}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:s.bar,background:GC[g]}}/>
        </>
      )}
    </button>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 화면 00 — 타이틀 (AAA 대작 명품 스타일 튜닝)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TitleScreen({onNew,onLoad}){
  return(
    <Phone>
      <div style={{height:330,background:"radial-gradient(circle at 50% 40%, #151926 0%, #07090e 75%)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {/* 미세한 그리드 격자 그리드 라인 */}
        <div style={{position:"absolute",inset:0,opacity:.03,pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(200,168,74,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,74,.4) 1px,transparent 1px)",
          backgroundSize:"35px 35px"}}/>
        
        {/* 마법진 광채 일루전 코어 효과 배경 */}
        <div style={{position:"absolute",top:"45%",left:"50%",transform:"translate(-50%,-50%)",
          width:240,height:240,background:"radial-gradient(circle,rgba(200,168,74,0.08) 0%,transparent 65%)",
          borderRadius:"50%",pointerEvents:"none",filter:"blur(10px)"}}/>

        <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          {/* 가느다란 황금 데코 장식 세그먼트 */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:24,height:1,background:"linear-gradient(90deg,transparent, #c8a84a)"}}/>
            <span style={{fontSize:10,color:C.goldL,letterSpacing:".4em",textTransform:"uppercase",fontFamily:"'Cinzel', serif",fontWeight:600}}>Enter the World</span>
            <div style={{width:24,height:1,background:"linear-gradient(90deg, #c8a84a, transparent)"}}/>
          </div>
          
          {/* 메탈릭 골드 그라데이션 및 입체 쉐도우 추가 명품 타이틀 */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:C.t2,letterSpacing:".35em",fontWeight:500,fontFamily:"'Cinzel', serif",marginBottom:6}}>THE GAME OF</div>
            <div style={{fontSize:46,fontWeight:900,letterSpacing:".08em",lineHeight:1,
              background:`linear-gradient(180deg, #fff 0%, ${C.goldL} 40%, ${C.gold} 70%, ${C.goldD} 100%)`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              filter:"drop-shadow(0px 4px 12px rgba(200,168,74,0.3))",fontFamily:"'Cinzel', serif"}}>
              LEGENDS
            </div>
          </div>
          
          {/* 교차검 주변 아우라 레이아웃 */}
          <div style={{position:"relative",marginTop:10}}>
            <div style={{position:"absolute",inset:-15,background:"radial-gradient(circle, rgba(200,168,74,0.15) 0%, transparent 80%)",filter:"blur(4px)"}}/>
            <div style={{fontSize:32,filter:"drop-shadow(0 2px 5px rgba(0,0,0,0.5))",position:"relative",zIndex:1}}>⚔</div>
          </div>
        </div>
      </div>

      <div style={{padding:"28px 24px 36px",background:"linear-gradient(180deg, #0b0d13 0%, #050608 100%)",borderTop:"1px solid rgba(200,168,74,0.08)"}}>
        <div style={{marginBottom:18,textAlign:"center",fontSize:11,color:C.t2,letterSpacing:".2em",fontWeight:500}}>— ARCHIVE —</div>
        
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* 캐릭터 생성 버튼 고도화 디자인 */}
          <button onClick={onNew} style={{width:"100%",background:"linear-gradient(135deg, #161b26 0%, #0f121a 100%)",border:`1px solid ${C.goldD}66`,borderRadius:6,
            padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,color:C.t1,textAlign:"left",transition:"all 0.25s",
            boxShadow:"0 4px 15px rgba(0,0,0,0.2)"}}
            onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.gold}`; e.currentTarget.style.boxShadow=`0 0 15px ${C.goldD}44`;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${C.goldD}66`; e.currentTarget.style.boxShadow="0 4px 15px rgba(0,0,0,0.2)";}}>
            <div style={{width:40,height:40,borderRadius:4,flexShrink:0,
              background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#050608",fontWeight:700,boxShadow:`0 2px 8px ${C.goldD}44`}}>✦</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.goldL,letterSpacing:"0.05em",marginBottom:4}}>새로운 영웅 연대기</div>
              <div style={{fontSize:11,color:C.t2,opacity:0.8}}>전설적인 영웅 각성 및 시작</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:16,color:C.gold,opacity:0.7}}>›</div>
          </button>

          {/* 기존 게임 불러오기 버튼 고도화 디자인 */}
          <button onClick={onLoad} style={{width:"100%",background:"linear-gradient(135deg, #0f121a 0%, #0a0b10 100%)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,
            padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,color:C.t1,textAlign:"left",transition:"all 0.25s"}}
            onMouseEnter={e=>{e.currentTarget.style.border="1px solid rgba(255,255,255,0.15)"; e.currentTarget.style.background="#121620";}}
            onMouseLeave={e=>{e.currentTarget.style.border="1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.background:"linear-gradient(135deg, #0f121a 0%, #0a0b10 100%)";}}>
            <div style={{width:40,height:40,borderRadius:4,flexShrink:0,background:"#1b2030",
              border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.t2}}>↺</div>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:C.t1,letterSpacing:"0.04em",marginBottom:4}}>전설 이어가기</div>
              <div style={{fontSize:11,color:C.t2,opacity:0.7}}>마지막 브라우저 데이터 동기화</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:16,color:C.t3}}>›</div>
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:24,fontSize:10,color:C.t3,letterSpacing:"0.05em"}}>STAGE v1.1 · 클라이언트 암호화 보안 구동 중</div>
      </div>
    </Phone>
  );
}

// ── 캐릭터 선택 화면 ──
function CharScreen({onBack,onSelect}){
  const [sel,setSel]=useState(null);
  const [naming,setNaming]=useState(false);
  const [name,setName]=useState("");
  const char=CHARS.find(c=>c.id===sel);

  return(
    <Phone>
      <div style={{height:50,background:C.bg1,borderBottom:`1px solid ${C.bdr0}`,display:"flex",alignItems:"center",padding:"0 14px",gap:10}}>
        <button onClick={onBack} style={{width:32,height:32,borderRadius:4,background:C.bg2,border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <span style={{fontSize:14,fontWeight:700}}>영웅 선택</span>
        <span style={{marginLeft:"auto",fontSize:11,color:C.t3}}>7명의 전설적 영웅</span>
      </div>

      <div style={{height:260,background:"linear-gradient(160deg,#1a1230,#0d0e12)",position:"relative",overflow:"hidden",borderBottom:`1px solid ${C.bdr1}`}}>
        {char?(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"row"}}>
            <div style={{width:"55%",height:"100%",position:"relative",overflow:"hidden",background:C.bg0,borderRight:`1px solid ${C.bdr0}`}}>
              <img src={char.img} alt={char.name} style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center bottom",position:"absolute",inset:0,display:"block"}} onError={e=>{e.target.style.visibility="hidden";}}/>
              <video key={char.id} autoPlay loop muted playsInline preload="auto" style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center bottom",position:"absolute",inset:0,display:"block",zIndex:2,imageRendering:'-webkit-optimize-contrast',WebkitTransform:'translateZ(0)'}} onError={e=>{e.target.style.display="none";}}>
                <source src={char.motion} type="video/mp4"/>
              </video>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,zIndex:3,background:"linear-gradient(transparent,rgba(13,9,30,.8))",pointerEvents:"none"}}/>
            </div>
            <div style={{width:"45%",height:"100%",padding:"16px 14px",background:"linear-gradient(135deg, rgba(20,22,32,0.9), rgba(13,14,18,0.95))",display:"flex",flexDirection:"column",justifyContent:"center",zIndex:3}}>
              <div style={{fontSize:17,fontWeight:800,color:C.goldL,marginBottom:4}}>{char.name}</div>
              <div style={{fontSize:11,color:C.t2,marginBottom:8,display:"flex",alignItems:"center",gap:4}}><span>{char.emoji}</span> <span>{char.role}</span></div>
              <div style={{fontSize:10,color:C.t2,lineHeight:1.6,marginBottom:12,wordBreak:"keep-all"}}>{char.desc}</div>
              <div style={{alignSelf:"flex-start"}}><div style={{fontSize:9,color:"#3ecf6a",background:"rgba(62,207,106,.08)",border:"1px solid rgba(62,207,106,.25)",borderRadius:4,padding:"3px 8px",fontWeight:700}}>● LIVE MOTION</div></div>
            </div>
          </div>
        ):(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:30,opacity:.15}}>👤</div>
            <div style={{fontSize:11,color:C.t3}}>영웅 선택 시 실시간 모션 링크 구동</div>
          </div>
        )}
      </div>

      <div style={{padding:"12px 14px",background:C.bg1}}>
        <div style={{fontSize:10,color:C.t3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>영웅 목록</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:14}}>
          {CHARS.map(c=>(
            <button key={c.id} onClick={()=>{setSel(c.id);setNaming(false);}} style={{
              cursor:"pointer",borderRadius:6,overflow:"hidden",border:"none",padding:0,
              outline:`1.5px solid ${sel===c.id?C.gold:C.bdr1}`,background:sel===c.id?C.bg3:C.bg2,boxShadow:sel===c.id?`0 0 12px ${C.goldD}88`:"none",
            }}>
              <div style={{height:64,background:C.bg0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                <img src={c.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} onError={e=>{e.target.style.display="none";}}/>
              </div>
              <div style={{padding:"5px 4px 6px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:sel===c.id?C.goldL:C.t1}}>{c.name}</div>
              </div>
            </button>
          ))}
        </div>
        {!naming?(
          <button onClick={()=>sel&&setNaming(true)} disabled={!sel} style={{width:"100%",padding:"13px",borderRadius:4,border:"none",background:sel?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,color:sel?"#000":C.t3,fontSize:14,fontWeight:800,cursor:sel?"pointer":"default"}}>{sel?`${char?.name} 선택 → 식별코드 부여`:"캐릭터를 선택해 주십시오"}</button>
        ):(
          <div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="영웅의 이름을 새겨주십시오..." autoFocus style={{width:"100%",padding:"11px 12px",borderRadius:4,background:C.bg0,border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:13,outline:"none",marginBottom:8,fontFamily:"inherit"}}/>
            <button onClick={()=>name.trim()&&onSelect(sel,name.trim())} disabled={!name.trim()} style={{width:"100%",padding:"13px",borderRadius:4,border:"none",background:name.trim()?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,color:name.trim()?"#000":C.t3,fontSize:14,fontWeight:800,cursor:name.trim()?"pointer":"default"}}>서버 입장 ›</button>
          </div>
        )}
      </div>
    </Phone>
  );
}

// ── 인벤토리 화면 (9개 멀티 장착창 최적화) ──
function InvScreen({charId,charName,gold,scrolls,dailyLeft,onChest,onShop,onRank,onEnhance,inventory,equipped,onEquip}){
  const [tab,setTab]=useState("weapon");
  const [selItem,setSelItem]=useState(null);
  const [sold,setSold]=useState([]);
  const char=CHARS.find(c=>c.id===charId)||CHARS[0];

  const tabItems=useMemo(()=>{
    const all=inventory.filter(i=>!sold.includes(i.uid));
    if(tab==="weapon") return all.filter(i=>i.type==="weapon");
    if(tab==="armor")  return all.filter(i=>i.type==="armor");
    return all.filter(i=>i.type==="accessory");
  },[inventory,sold,tab]);

  const eqWeapon   = inventory.find(i=>i.uid===equipped.weapon);
  const eqHelmet   = inventory.find(i=>i.uid===equipped.helmet);
  const eqArmor    = inventory.find(i=>i.uid===equipped.armor);
  const eqPants    = inventory.find(i=>i.uid===equipped.pants);
  const eqBoots    = inventory.find(i=>i.uid===equipped.boots);
  const eqCloak    = inventory.find(i=>i.uid===equipped.cloak);
  const eqBelt     = inventory.find(i=>i.uid===equipped.belt);
  const eqEarrings = inventory.find(i=>i.uid===equipped.earrings);
  const eqRing     = inventory.find(i=>i.uid===equipped.ring);

  const totalStats=useMemo(()=>{
    const items=[eqWeapon, eqHelmet, eqArmor, eqPants, eqBoots, eqCloak, eqBelt, eqEarrings, eqRing].filter(Boolean);
    return items.reduce((acc,it)=>{
      const st=calcStat(it.atk||it.def||0,it.grade,it.enhance||0,it.type);
      return {atk:acc.atk+st.atk,def:acc.def+st.def,mdef:acc.mdef+st.mdef,crit:Math.min(80,acc.crit+st.crit),eva:Math.min(60,acc.eva+st.eva)};
    },{atk:0,def:0,mdef:0,crit:0,eva:0});
  },[eqWeapon, eqHelmet, eqArmor, eqPants, eqBoots, eqCloak, eqBelt, eqEarrings, eqRing]);

  const totalScore=Math.round(totalStats.atk*3+totalStats.def*2+totalStats.mdef*2+totalStats.crit*100+totalStats.eva*100);

  const slotsData = [
    { key: "weapon",   label: "무기",   icon: "⚔", item: eqWeapon },
    { key: "helmet",   label: "투구",   icon: "🪖", item: eqHelmet },
    { key: "armor",    label: "갑옷",   icon: "🛡", item: eqArmor },
    { key: "pants",    label: "하의",   icon: "👖", item: eqPants },
    { key: "boots",    label: "부츠",   icon: "🥾", item: eqBoots },
    { key: "cloak",    label: "망토",   icon: "🧣", item: eqCloak },
    { key: "belt",     label: "벨트",   icon: "🎗", item: eqBelt },
    { key: "earrings", label: "귀걸이",   icon: "💎", item: eqEarrings },
    { key: "ring",     label: "반지",   icon: "💍", item: eqRing },
  ];

  return(
    <Phone>
      <div style={{background:C.bg0,borderBottom:`1px solid ${C.bdr1}`,padding:"6px 8px",display:"flex",alignItems:"stretch",gap:4}}>
        <button onClick={onChest} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16}}>📦</span><span style={{fontSize:8,color:C.t3}}>보물상자</span><span style={{fontSize:10,fontWeight:800,color:dailyLeft>0?C.goldL:C.fail}}>{dailyLeft}회</span>
        </button>
        <button onClick={onShop} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16}}>🛒</span><span style={{fontSize:8,color:C.t3}}>상점</span><span style={{fontSize:10,fontWeight:800}}>구매</span>
        </button>
        <div style={{flex:1.3,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,background:`${C.goldD}22`,border:`1px solid ${C.goldD}55`,borderRadius:5,padding:"5px 2px"}}>
          <span style={{fontSize:16}}>💰</span><span style={{fontSize:8,color:C.t3}}>골드</span><span style={{fontSize:10,fontWeight:800,color:C.goldL}}>{gold.toLocaleString()}</span>
        </div>
        <div style={{flex:1.7,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,padding:"5px 2px",color:C.t1}}>
          <span style={{fontSize:16}}>📜</span><span style={{fontSize:8,color:C.t3}}>주문서</span>
          <span style={{fontSize:9,fontWeight:700}}><span style={{color:C.goldL}}>일반{scrolls.normal}</span><span style={{color:C.bdr2}}>·</span><span style={{color:C.e}}>고급{scrolls.adv}</span></span>
        </div>
        <button onClick={onRank} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16}}>🏆</span><span style={{fontSize:8,color:C.t3}}>랭킹</span><span style={{fontSize:10,fontWeight:800,color:C.goldL}}>#247</span>
        </button>
      </div>

      <div style={{overflowY:"auto",maxHeight:640}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:`1px solid ${C.bdr1}`}}>
          <div style={{borderRight:`1px solid ${C.bdr0}`,background:`linear-gradient(180deg,${C.bg0},${C.bg1})`}}>
            <div style={{height:150,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",background:C.bg0}}>
              <img src={char.img} alt="" style={{height:"100%",width:"100%",objectFit:"contain",objectPosition:"center bottom"}}/>
            </div>
            <div style={{padding:"8px 10px 10px",borderTop:`1px solid ${C.bdr0}`,textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.goldL,marginBottom:1}}>{charName}</div>
              <div style={{fontSize:10,color:C.t2,marginBottom:6}}>{char.role}</div>
              {[["⚔","공격",totalStats.atk,"rgba(255,100,100,.7)"],
                ["🛡","방어",totalStats.def,"rgba(100,180,255,.7)"],
                ["✦","마법방",totalStats.mdef,"rgba(180,100,255,.7)"],
                ["💥","크리",`${totalStats.crit}%`,"rgba(255,170,34,.7)"],
                ["💨","회피",`${totalStats.eva}%`,"rgba(62,207,106,.7)"]].map(([ic,lb,v,bc])=>(
                <div key={lb} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                  <span style={{fontSize:10,width:14}}>{ic}</span>
                  <span style={{color:C.t3,minWidth:28,fontSize:9}}>{lb}</span>
                  <div style={{flex:1,height:3,background:"rgba(255,255,255,.06)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(100,typeof v==="string"?parseFloat(v)*1.2:v/40)}%`,height:"100%",background:bc,borderRadius:99}}/>
                  </div>
                  <span style={{color:C.t1,fontWeight:700,minWidth:32,textAlign:"right",fontSize:9}}>{typeof v==="number"?v.toLocaleString():v}</span>
                </div>
              ))}
              <div style={{marginTop:6,background:C.bg2,borderRadius:4,padding:"4px 6px",fontSize:9,color:C.gold,fontWeight:700}}>총점: {totalScore.toLocaleString()} pt</div>
            </div>
          </div>

          <div style={{background:C.bg1,padding:"10px",maxHeight:305,overflowY:"auto"}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>◆ 무장 현황 (9슬롯)</div>
            {slotsData.map(s => (
              <div key={s.key} style={{background:C.bg2,border:`1px solid ${s.item?GC[gradeMap[s.item.grade]]+"33":C.bdr0}`,borderRadius:4,padding:"5px 6px",marginBottom:4}}>
                <div style={{fontSize:8,color:C.t3,marginBottom:2}}>{s.label}</div>
                {s.item?(
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:22,height:22,background:C.bg0,borderRadius:3,border:`1px solid ${GC[gradeMap[s.item.grade]||"n"]}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <img src={s.item.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}}/>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:GC[gradeMap[s.item.grade]||"n"],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.item.name}</span>
                  </div>
                ):(
                  <div style={{fontSize:8,color:C.t3,display:"flex",alignItems:"center",gap:4}}><span style={{opacity:.3}}>{s.icon}</span> 공석</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{background:C.bg1,padding:"10px 12px 20px"}}>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {[["weapon","⚔ 무기"],["armor","🛡 방어구"],["accessory","💍 장신구"]].map(([t,lb])=>(
              <button key={t} onClick={()=>{setTab(t);setSelItem(null);}} style={{flex:1,padding:"7px 0",borderRadius:3,fontSize:10,fontWeight:700,border:"none",background:tab===t?C.bg3:C.bg2,outline:`1px solid ${tab===t?C.gold+"66":C.bdr1}`,color:tab===t?C.goldL:C.t2,cursor:"pointer"}}>{lb}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
            {[...tabItems,...Array(Math.max(0,30-tabItems.length)).fill(null)].slice(0,30).map((item,i)=>(
              <ItemSlot key={item?.uid||`e${i}`} item={item} selected={selItem?.uid===item?.uid} onClick={it=>setSelItem(selItem?.uid===it.uid?null:it)}/>
            ))}
          </div>

          {selItem&&(
            <CBox gold style={{padding:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:52,height:52,background:C.bg0,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${GC[gradeMap[selItem.grade]||"n"]}55`,overflow:"hidden"}}>
                  <img src={selItem.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:GC[gradeMap[selItem.grade]||"n"],marginBottom:4}}>{selItem.name}{(selItem.enhance||0)>0&&<span style={{color:C.goldL}}> +{selItem.enhance}</span>}</div>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}><Pill grade={selItem.grade} sm/> <span style={{fontSize:9,color:C.goldL}}>[부위: {selItem.cat||"기본"}]</span></div>
                </div>
              </div>
              <Divider/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <button onClick={()=>onEnhance(selItem)} style={{padding:"10px 0",borderRadius:4,border:"none",background:`linear-gradient(135deg,${C.goldD},${C.gold})`,color:"#000",fontSize:12,fontWeight:800,cursor:"pointer"}}>⚡ 강화</button>
                <button onClick={()=>{onEquip(selItem);setSelItem(null);}} style={{padding:"10px 0",borderRadius:4,background:C.bg3,border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:12,fontWeight:700,cursor:"pointer"}}>🎒 장착</button>
                <button onClick={()=>{if(window.confirm("판매하시겠습니까?")){setSold(s=>[...s,selItem.uid]);setSelItem(null);}}} style={{padding:"10px 0",borderRadius:4,background:`${C.fail}18`,border:`1px solid ${C.fail}44`,color:C.fail,fontSize:12,fontWeight:700,cursor:"pointer"}}>💰 판매</button>
              </div>
            </CBox>
          )}
        </div>
      </div>
    </Phone>
  );
}

// ── 보물상자 및 기타 팝업 컴포넌트 생략 (동일 규격 유지) ──
function ChestModal({onClose,charId,onAddItem,onAddGold,dailyLeft,setDailyLeft}){
  const [result,setResult] = useState(null); const [opening,setOpening] = useState(false);
  const PROBS=[{g:"n",l:"일반",p:40},{g:"m",l:"매직",p:28},{g:"r",l:"레어",p:18},{g:"e",l:"에픽",p:9},{g:"l",l:"레전드",p:4},{g:"my",l:"신화",p:1}];
  const GOLD_TIERS=[{min:200,max:999,w:40},{min:1000,max:4999,w:30},{min:5000,max:14999,w:15}];
  const wRand=arr=>{let r=Math.random()*arr.reduce((s,i)=>s+(i.w||i.p),0);for(const i of arr){r-=(i.w||i.p);if(r<=0)return i;}return arr[arr.length-1];};
  const doOpen=()=>{
    if(opening||dailyLeft<=0)return; setOpening(true);
    setTimeout(()=>{
      const isGold=Math.random()<.45;
      if(isGold){const tier=wRand(GOLD_TIERS); const amt=Math.floor(Math.random()*(tier.max-tier.min+1))+tier.min; setResult({type:"gold",amount:amt}); onAddGold(amt);}
      else {
        const gw=wRand(PROBS); const pool=[...rawWeapons,...rawArmors,...rawAccs].filter(x=>gradeMap[x.grade]===gw.g);
        if(pool.length){const p=pool[Math.floor(Math.random()*pool.length)]; const finalItem={...p,uid:`${p.id}_${Date.now()}`,enhance:0}; setResult({type:"item",item:finalItem}); onAddItem(finalItem);}
      }
      setDailyLeft(d=>d-1); setOpening(false);
    },500);
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",padding:16,border:`1px solid ${C.bdr1}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span style={{fontWeight:700}}>보물상자 수령</span><button onClick={onClose} style={{background:"none",border:"none",color:C.t2,cursor:"pointer"}}>✕</button></div>
        <div style={{textAlign:"center",padding:20}}>
          <button onClick={doOpen} disabled={opening||dailyLeft<=0} style={{width:100,height:100,background:C.bg2,border:`1.5px solid ${C.gold}`,borderRadius:10,fontSize:40,cursor:"pointer"}}>{opening?"✨":"📦"}</button>
          <div style={{marginTop:12,fontSize:12,color:C.t2}}>오늘 가능 횟수: {dailyLeft}회</div>
        </div>
        {result&&(
          <div style={{background:C.bg2,padding:12,borderRadius:4,textAlign:"center",color:C.goldL,fontWeight:700}}>
            {result.type==="gold"?`💰 ${result.amount.toLocaleString()} 골드 획득!`:`🎁 [${GN[gradeMap[result.item.grade]]}] ${result.item.name} 획득!`}
          </div>
        )}
      </div>
    </div>
  );
}

function EnhModal({item:initItem,onClose,gold,onSpendGold,scrolls,onUseScroll,onUpdateItem}){
  const [item,setItem] = useState({...initItem,enhance:initItem.enhance||0}); const lv=item.enhance; const prob=lv<15?SP[lv]:0;
  const doEnh=()=>{
    const sk=scroll==="normal"?"normal":"adv"; if(gold<(scroll==="normal"?500:2000)){alert("골드 부족");return;} if(scrolls[sk]<=0){alert("주문서 부족");return;}
    onSpendGold(scroll==="normal"?500:2000); onUseScroll(sk);
    if(Math.random()*100<prob){const next={...item,enhance:lv+1}; setItem(next); onUpdateItem(next); alert("강화 성공!");}
    else{ if(lv>=9 && Math.random()*100>FK[lv]){const next={...item,enhance:Math.max(0,lv-1)}; setItem(next); onUpdateItem(next); alert("강화 실패 (등급 하락)");}else{alert("강화 실패 (등급 유지)");}}
  };
  const [scroll,setScroll]=useState("normal");
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",padding:16,border:`1px solid ${C.bdr1}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:700}}>제련 가속공방</span><button onClick={onClose} style={{background:"none",border:"none",color:C.t2,cursor:"pointer"}}>✕</button></div>
        <div style={{background:C.bg2,padding:14,borderRadius:6,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:C.goldL}}>{item.name} +{item.enhance}</div>
          <div style={{fontSize:11,color:C.t3,marginTop:4}}>다음 단계 성공률: {prob}%</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <button onClick={()=>setScroll("normal")} style={{padding:8,background:scroll==="normal"?C.bg3:C.bg2,color:C.t1,border:`1px solid ${scroll==="normal"?C.gold:C.bdr1}`,borderRadius:4}}>일반(500G)</button>
          <button onClick={()=>setScroll("adv")} style={{padding:8,background:scroll==="adv"?C.bg3:C.bg2,color:C.t1,border:`1px solid ${scroll==="adv"?C.gold:C.bdr1}`,borderRadius:4}}>고급(2000G)</button>
        </div>
        <button onClick={doEnh} style={{width:"100%",padding:12,background:`linear-gradient(135deg,${C.goldD},${C.gold})`,color:"#000",border:"none",borderRadius:4,fontWeight:700,cursor:"pointer"}}>강화 시도</button>
      </div>
    </div>
  );
}

function ShopModal({onClose,gold,onSpendGold,onAddScrolls}){
  const buy=(t,p)=>{if(gold<p){alert("골드 부족");return;} onSpendGold(p); onAddScrolls(t,1); alert("구매 완료!");};
  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",padding:16,border:`1px solid ${C.bdr1}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span style={{fontWeight:700}}>마법 주문서 상점</span><button onClick={onClose} style={{background:"none",border:"none",color:C.t2,cursor:"pointer"}}>✕</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",justifyContent:"space-between",background:C.bg2,padding:10,borderRadius:4,alignItems:"center"}}><span>일반 강화 주문서</span><button onClick={()=>buy("normal",500)} style={{padding:"6px 12px",background:C.gold,color:"#000",border:"none",borderRadius:4,fontWeight:700,cursor:"pointer"}}>500 G</button></div>
          <div style={{display:"flex",justifyContent:"space-between",background:C.bg2,padding:10,borderRadius:4,alignItems:"center"}}><span>고급 강화 주문서</span><button onClick={()=>buy("adv",2000)} style={{padding:"6px 12px",background:C.e,color:"#fff",border:"none",borderRadius:4,fontWeight:700,cursor:"pointer"}}>2,000 G</button></div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 파이프라인 ──
export default function App(){
  const [screen,setScreen] = useState("title");
  const [charId,setCharId] = useState(null);
  const [charName,setCharName] = useState("");
  const [gold,setGold] = useState(5000);
  const [scrolls,setScrolls] = useState({normal:3,adv:1});
  const [dailyLeft,setDailyLeft] = useState(30);
  const [inventory,setInventory] = useState([]);
  const [equipped,setEquipped] = useState({weapon:null, helmet:null, armor:null, pants:null, boots:null, cloak:null, belt:null, earrings:null, ring:null});
  const [showChest,setShowChest] = useState(false);
  const [enhItem,setEnhItem] = useState(null);
  const [showRank,setShowRank] = useState(false);
  const [showShop,setShowShop] = useState(false);

  const char = CHARS.find(c=>c.id===charId);

  const totalScore = useMemo(()=>{
    const slots=[equipped.weapon, equipped.helmet, equipped.armor, equipped.pants, equipped.boots, equipped.cloak, equipped.belt, equipped.earrings, equipped.ring];
    return slots.map(uid=>inventory.find(i=>i.uid===uid)).filter(Boolean).reduce((acc,it)=>{
      const st = calcStat(it.atk||it.def||0,it.grade,it.enhance||0,it.type);
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
      else if(item.cat==="망토") slot="cloak";
    } else if(item.type==="accessory"){
      if(item.cat==="부츠") slot="boots";
      else if(item.cat==="벨트") slot="belt";
      else if(item.cat==="귀걸이") slot="earrings";
      else if(item.cat==="반지") slot="ring";
    }
    setEquipped(e=>({...e,[slot]:item.uid}));
  };

  return(
    <div style={{background:"#050608",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      {/* 프리미엄 전용 외부 글씨체 리소스 주입 패키지 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Noto+Serif+KR:wght@400;600;800&display=swap');
        *{box-sizing:border-box;} input,button{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(200,168,74,0.15);border-radius:99px;}
      `}</style>

      <div style={{position:"relative"}}>
        {screen==="title"&&<TitleScreen onNew={()=>setScreen("char")} onLoad={()=>handleSelect("CHR_001","모험가")}/>}
        {screen==="char" &&<CharScreen onBack={()=>setScreen("title")} onSelect={handleSelect}/>}
        {screen==="inv"  &&<InvScreen charId={charId||"CHR_001"} charName={charName||"모험가"} gold={gold} scrolls={scrolls} dailyLeft={dailyLeft} onChest={()=>setShowChest(true)} onShop={()=>setShowShop(true)} onRank={()=>setShowRank(true)} onEnhance={i=>setEnhItem(i)} inventory={inventory} equipped={equipped} onEquip={equipItem}/>}

        {showChest&&<ChestModal onClose={()=>setShowChest(false)} charId={charId||"CHR_001"} onAddItem={addItem} onAddGold={addGold} dailyLeft={dailyLeft} setDailyLeft={setDailyLeft}/>}
        {enhItem&&<EnhModal item={enhItem} onClose={()=>setEnhItem(null)} gold={gold} onSpendGold={spendGold} scrolls={scrolls} onUseScroll={useScroll} onUpdateItem={updated=>{updateItem(updated);setEnhItem(updated);}}/>}
        {showShop&&<ShopModal onClose={()=>setShowShop(false)} gold={gold} onSpendGold={spendGold} onAddScrolls={addScrolls}/>}
      </div>
    </div>
  );
}