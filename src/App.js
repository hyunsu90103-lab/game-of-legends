import { useState, useMemo, useEffect } from "react";
import React from "react";

// ── 컬러 시스템 ──
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

// 등급 매핑 (CSV → 내부키)
const gradeMap={"Common":"n","Magic":"m","Rare":"r","Epic":"e","Legend":"l","Mythic":"my"};

// ── 캐릭터 데이터 (캐릭터.txt 기반) ──
const CHARS=[
  {id:"CHR_001",name:"세르민느",role:"마법사",desc:"강력한 마력과 어둠의 마법을 사용하는 마법사",
   img:"./images/1.(캐릭터)세르민느.png",motion:"./motions/char_seomine.mp4",emoji:"🔮",weaponClass:"마법사공용"},
  {id:"CHR_002",name:"아스칼론",role:"전사",desc:"숲의 기운을 수호하는 강인한 전사",
   img:"./images/1.(캐릭터)아스칼론.png",motion:"./motions/char_askalon.mp4",emoji:"⚔️",weaponClass:"전사공용"},
  {id:"CHR_003",name:"에일린",role:"궁수",desc:"활과 화살을 자유자재로 다루는 민첩한 궁수",
   img:"./images/1.(캐릭터)에일린.png",motion:"./motions/char_eilin.mp4",emoji:"🏹",weaponClass:"에일린(장궁)"},
  {id:"CHR_004",name:"카이렌",role:"전사",desc:"강철 갑옷을 입은 중장갑 전사",
   img:"./images/1.(캐릭터)카이렌.png",motion:"./motions/char_kairen.mp4",emoji:"🛡️",weaponClass:"전사공용"},
  {id:"CHR_005",name:"로켓",role:"기술자",desc:"고성능 화기를 다루는 너구리 형태의 기술자",
   img:"./images/1.(캐릭터)로켓.png",motion:"./motions/char_rocket.mp4",emoji:"🔫",weaponClass:"로켓(리펄서)"},
  {id:"CHR_006",name:"발키리",role:"암살자",desc:"날개를 가진 전사이자 치명적인 공격의 소유자",
   img:"./images/1.(캐릭터)발키리.png",motion:"./motions/char_valkyrie.mp4",emoji:"⚙️",weaponClass:"발키리(레이저)"},
  {id:"CHR_007",name:"벨리아르",role:"마법사",desc:"어둠의 마법과 영혼의 힘을 다루는 마법사",
   img:"./images/1.(캐릭터)벨리아르.png",motion:"./motions/char_beliar.mp4",emoji:"👁️",weaponClass:"마법사공용"},
];

// ── 스탯 계산 유틸 ──
// 등급별 기본 스탯 배율
const GRADE_MULTI={n:1,m:1.5,r:2.2,e:3.5,l:6,my:12};
// 강화 보너스: 강화수 * 등급배율 * 0.08
const calcStat=(baseAtk,grade,enhance,type)=>{
  const g=gradeMap[grade]||"n";
  const base=Math.abs(baseAtk);
  const enh=Math.round(base*(enhance*0.08));
  if(type==="weapon"){
    return {
      atk: base+enh,
      def: 0,
      mdef: Math.round((base+enh)*0.1),
      crit: parseFloat((Math.min(80, (enhance*2.5) + {n:3,m:6,r:10,e:15,l:22,my:35}[g])).toFixed(1)),
      eva:  parseFloat((Math.min(60, (enhance*1.5) + {n:2,m:4,r:7,e:11,l:16,my:25}[g])).toFixed(1)),
    };
  } else {
    return {
      atk: 0,
      def: base+enh,
      mdef: Math.round((base+enh)*0.6),
      crit: parseFloat((Math.min(80, enhance*1.0)).toFixed(1)),
      eva:  parseFloat((Math.min(60, enhance*0.8 + {n:1,m:2,r:4,e:7,l:12,my:20}[g])).toFixed(1)),
    };
  }
};

// ── 무기 데이터 (아이템CSV 기반, 캐릭별 분류) ──
const rawWeapons=[
  // 전사공용
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

// ── 방어구 데이터 (공통) ──
const rawArmors=[
  // 투구
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
  {id:"A_COM_R002",name:"은빛 링",cat:"반지",grade:"Common",img:"./images/은빛링.png",def:2,sell:100},
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
];

// ── 소모품 데이터 ──
const CONSUMABLES=[
  {id:"S_ETC_001",name:"무기 강화 주문서",grade:"Common",img:"./images/Generate _Weapon enhancement scroll for web game, 2D style, luxurious and p_20260529_181343_0000.png",sell:1000,type:"scroll_weapon"},
  {id:"S_ETC_002",name:"방어구 강화 주문서",grade:"Common",img:"./images/Generate _Armor enhancement scroll for web game, 2D style, luxurious and pr_20260529_181328_0000.png",sell:1000,type:"scroll_armor"},
  {id:"S_ETC_003",name:"장신구 강화 주문서",grade:"Common",img:"./images/Generate _Accessory enhancement scroll for web game, 2D style, luxurious an_20260529_181315_0000.png",sell:1000,type:"scroll_acc"},
  {id:"S_ETC_004",name:"럭셔리 보물상자",grade:"Rare",img:"./images/Generate _Luxurious treasure chest for web game, 2D style, elegant and prem_20260529_181428_0000.png",sell:5000,type:"chest"},
];

// ── 보물상자 드랍풀 구성 (등급별 확률) ──
const CHEST_POOL={
  n:0.40, m:0.28, r:0.18, e:0.09, l:0.04, my:0.01
};

// ── 공통 UI 컴포넌트 ──
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
        borderTop:   i<2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderBottom:i>=2?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderLeft:  i%2===0?`2px solid ${gold?C.gold:C.bdr2}`:undefined,
        borderRight: i%2===1?`2px solid ${gold?C.gold:C.bdr2}`:undefined}}/>
    ))}
    {children}
  </div>
);

// ── 아이템 카드 (그리드용) ──
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
// 화면 00 — 타이틀 (인트로 영상 A안)
// video1(암흑) → video2(탐색) → video3(집결) → video4(전투) → 메인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INTRO_VIDEOS=[
  {src:"./videos/video1.mp4",cap:"어둠의 마법사가 세상을 뒤덮다"},
  {src:"./videos/video2.mp4",cap:"영웅들이 소집된다"},
  {src:"./videos/video3.mp4",cap:"전설의 용사들, 집결하다"},
  {src:"./videos/video4.mp4",cap:"최후의 결전"},
];

function TitleScreen({onNew,onLoad}){
  const [vidIdx,setVidIdx]=useState(0);
  const [phase,setPhase]=useState("intro");
  const [capVis,setCapVis]=useState(true);

  const goNext=()=>{
    setCapVis(false);
    setTimeout(()=>{
      if(vidIdx<INTRO_VIDEOS.length-1){setVidIdx(i=>i+1);setCapVis(true);}
      else setPhase("main");
    },350);
  };
  const skip=()=>{setCapVis(false);setTimeout(()=>setPhase("main"),300);};

  // ── 인트로 화면 ──
  if(phase==="intro") return(
    <Phone>
      <div style={{position:"relative",width:"100%",height:700,background:"#000",overflow:"hidden"}}
        onClick={goNext}>
        {/* 배경 영상 */}
        <video key={vidIdx} autoPlay muted playsInline onEnded={goNext}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:1}}
          onError={goNext}>
          <source src={INTRO_VIDEOS[vidIdx].src} type="video/mp4"/>
        </video>
        {/* 오버레이 */}
        <div style={{position:"absolute",inset:0,zIndex:2,
          background:"linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.0) 40%,rgba(0,0,0,.55) 85%,rgba(0,0,0,.9) 100%)"}}/>
        {/* 진행바 */}
        <div style={{position:"absolute",top:14,left:14,right:14,zIndex:10,display:"flex",gap:5}}>
          {INTRO_VIDEOS.map((_,i)=>(
            <div key={i} style={{flex:1,height:2.5,borderRadius:99,
              background:i<vidIdx?C.gold:i===vidIdx?"rgba(200,168,74,.45)":"rgba(255,255,255,.12)"}}/>
          ))}
        </div>
        {/* 자막 */}
        <div style={{position:"absolute",bottom:90,left:0,right:0,zIndex:10,textAlign:"center",padding:"0 24px",
          opacity:capVis?1:0,transition:"opacity .35s"}}>
          <div style={{display:"inline-block",background:"rgba(0,0,0,.6)",
            border:"1px solid rgba(200,168,74,.25)",borderRadius:6,padding:"8px 20px",
            fontSize:13,color:C.goldL,fontFamily:"'Cinzel',serif",letterSpacing:".06em"}}>
            {INTRO_VIDEOS[vidIdx].cap}
          </div>
        </div>
        {/* 영상 번호 */}
        <div style={{position:"absolute",bottom:68,right:18,zIndex:10,fontSize:10,color:"rgba(255,255,255,.35)"}}>
          {vidIdx+1} / {INTRO_VIDEOS.length}
        </div>
        {/* 힌트 */}
        <div style={{position:"absolute",bottom:20,left:18,zIndex:10,fontSize:10,color:"rgba(255,255,255,.3)"}}>
          탭하면 다음으로
        </div>
        {/* SKIP */}
        <button onClick={e=>{e.stopPropagation();skip();}} style={{
          position:"absolute",bottom:16,right:14,zIndex:15,
          background:"rgba(0,0,0,.65)",border:"1px solid rgba(200,168,74,.35)",
          borderRadius:99,padding:"7px 18px",color:C.goldL,fontSize:12,
          fontWeight:600,cursor:"pointer",letterSpacing:".04em"}}>
          SKIP ›
        </button>
      </div>
    </Phone>
  );

  // ── 메인 타이틀 ──
  const [imgIdx,setImgIdx]=useState(0);
  const [imgFade,setImgFade]=useState(true);
  const TITLE_IMGS=["./images/main_title.png","./images/main_title2.png"];
  // 3.5초마다 이미지 페이드 전환
  useEffect(()=>{
    const t=setInterval(()=>{
      setImgFade(false);
      setTimeout(()=>{setImgIdx(i=>(i+1)%2);setImgFade(true);},600);
    },3500);
    return ()=>clearInterval(t);
  },[]);

  return(
    <Phone>
      {/* 히어로 — 배경영상(video4) + 메인아트 슬라이드 겹침 */}
      <div style={{position:"relative",height:420,overflow:"hidden",background:"#000"}}>
        {/* 배경 영상 루프 */}
        <video autoPlay loop muted playsInline
          style={{position:"absolute",inset:0,width:"100%",height:"100%",
            objectFit:"cover",zIndex:1,filter:"brightness(.4) saturate(1.3)"}}
          onError={e=>e.target.style.display="none"}>
          <source src="./videos/video4.mp4" type="video/mp4"/>
        </video>
        {/* 메인 아트워크 슬라이드 — 3.5초마다 페이드 전환 */}
        {TITLE_IMGS.map((src,i)=>(
          <img key={src} src={src} alt=""
            style={{position:"absolute",inset:0,width:"100%",height:"100%",
              objectFit:"cover",objectPosition:"center top",zIndex:2,
              mixBlendMode:"screen",
              opacity:i===imgIdx?(imgFade?.9:0):0,
              transition:"opacity .6s ease-in-out"}}
            onError={e=>e.target.style.display="none"}/>
        ))}
        {/* 이미지 인디케이터 도트 */}
        <div style={{position:"absolute",bottom:70,right:14,zIndex:5,display:"flex",gap:5}}>
          {TITLE_IMGS.map((_,i)=>(
            <div key={i} onClick={()=>{setImgFade(false);setTimeout(()=>{setImgIdx(i);setImgFade(true);},300);}}
              style={{width:i===imgIdx?14:6,height:6,borderRadius:99,cursor:"pointer",
                background:i===imgIdx?C.gold:"rgba(255,255,255,.25)",transition:"all .4s"}}/>
          ))}
        </div>
        {/* 하단 그라디언트 */}
        <div style={{position:"absolute",inset:0,zIndex:3,
          background:"linear-gradient(180deg,rgba(5,6,8,.05) 0%,rgba(5,6,8,.0) 25%,rgba(5,6,8,.65) 72%,rgba(5,6,8,1) 100%)"}}/>
        {/* 로고 */}
        <div style={{position:"absolute",bottom:32,left:0,right:0,zIndex:4,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.goldL,letterSpacing:".45em",textTransform:"uppercase",
            fontFamily:"'Cinzel',serif",fontWeight:600,marginBottom:6,opacity:.8}}>— THE GAME OF —</div>
          <div style={{fontSize:52,fontWeight:900,letterSpacing:".1em",lineHeight:1,
            fontFamily:"'Cinzel',serif",
            background:`linear-gradient(180deg,#fff 0%,${C.goldL} 35%,${C.gold} 65%,${C.goldD} 100%)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            filter:"drop-shadow(0 0 24px rgba(200,168,74,.55))"}}>LEGENDS</div>
        </div>
        {/* 파티클 장식 */}
        <div style={{position:"absolute",top:22,left:22,zIndex:4,fontSize:16,opacity:.35,color:C.gold,animation:"float 3s ease-in-out infinite"}}>✦</div>
        <div style={{position:"absolute",top:38,right:26,zIndex:4,fontSize:11,opacity:.25,color:C.goldL,animation:"float 4s ease-in-out infinite 1.2s"}}>✦</div>
        <div style={{position:"absolute",top:100,left:14,zIndex:4,fontSize:8,opacity:.2,color:C.gold,animation:"float 5s ease-in-out infinite 0.5s"}}>✦</div>
      </div>

      {/* 버튼 영역 */}
      <div style={{padding:"24px 20px 28px",background:"linear-gradient(180deg,#050608 0%,#0b0d13 100%)"}}>
        <div style={{marginBottom:16,textAlign:"center",fontSize:10,color:C.t3,letterSpacing:".22em"}}>— 모험을 시작하라 —</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* 캐릭터 생성 */}
          <button onClick={onNew} style={{width:"100%",background:"linear-gradient(135deg,#1a1508,#0f0e08)",
            border:`1px solid ${C.goldD}88`,borderRadius:6,padding:"18px 20px",
            cursor:"pointer",display:"flex",alignItems:"center",gap:16,color:C.t1,textAlign:"left",
            boxShadow:"0 4px 20px rgba(200,168,74,.08)",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${C.gold}`;e.currentTarget.style.boxShadow=`0 0 20px rgba(200,168,74,.2)`;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${C.goldD}88`;e.currentTarget.style.boxShadow="0 4px 20px rgba(200,168,74,.08)";}}>
            <div style={{width:44,height:44,borderRadius:6,flexShrink:0,
              background:`linear-gradient(135deg,${C.gold},${C.goldD})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,color:"#050608",fontWeight:700,boxShadow:`0 2px 10px ${C.goldD}66`}}>✦</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:C.goldL,letterSpacing:".05em",marginBottom:4}}>캐릭터 생성</div>
              <div style={{fontSize:11,color:C.t2}}>새로운 영웅으로 전설을 써내려가라</div>
            </div>
            <div style={{fontSize:18,color:C.gold}}>›</div>
          </button>
          {/* 이어하기 */}
          <button onClick={onLoad} style={{width:"100%",background:"linear-gradient(135deg,#0f121a,#0a0b10)",
            border:"1px solid rgba(255,255,255,.07)",borderRadius:6,padding:"18px 20px",
            cursor:"pointer",display:"flex",alignItems:"center",gap:16,color:C.t1,textAlign:"left",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.border="1px solid rgba(255,255,255,.18)";e.currentTarget.style.background="#141824";}}
            onMouseLeave={e=>{e.currentTarget.style.border="1px solid rgba(255,255,255,.07)";e.currentTarget.style.background="linear-gradient(135deg,#0f121a,#0a0b10)";}}>
            <div style={{width:44,height:44,borderRadius:6,flexShrink:0,background:"#1b2030",
              border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.t2}}>↺</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:C.t1,letterSpacing:".04em",marginBottom:4}}>기존 게임 불러오기</div>
              <div style={{fontSize:11,color:C.t2}}>마지막 저장 데이터 불러오기</div>
            </div>
            <div style={{fontSize:18,color:C.t3}}>›</div>
          </button>
        </div>
        {/* 인트로 다시보기 */}
        <div style={{textAlign:"center",marginTop:14}}>
          <span onClick={()=>{setVidIdx(0);setPhase("intro");setCapVis(true);}}
            style={{fontSize:10,color:C.t3,cursor:"pointer",textDecoration:"underline",letterSpacing:".04em"}}>
            ▶ 인트로 영상 다시 보기
          </span>
        </div>
        <div style={{textAlign:"center",marginTop:8,fontSize:10,color:C.t3}}>v1.1 · 데이터는 이 브라우저에 저장됩니다</div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-8px) rotate(12deg);}}`}</style>
    </Phone>
  );
}



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 화면 01 — 캐릭터 선택
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

      {/* 캐릭터 프리뷰 */}
      <div style={{height:260,background:"linear-gradient(160deg,#1a1230,#0d0e12)",
        position:"relative",overflow:"hidden",borderBottom:`1px solid ${C.bdr1}`}}>
        <div style={{position:"absolute",inset:0,opacity:.04,pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(200,168,74,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(200,168,74,.5) 1px,transparent 1px)",
          backgroundSize:"30px 30px"}}/>
        {char?(
          <div style={{position:"absolute",inset:0,display:"flex",gap:0}}>
            {/* 캐릭터 모션 영상 + 이미지 — 전신 표시 */}
            <div style={{flex:1,position:"relative",overflow:"hidden",background:C.bg0}}>

              {/* 이미지 — 기본으로 항상 표시 (영상 로드 전/실패 시 보임) */}
              <img
                src={char.img} alt={char.name}
                style={{
                  width:"100%",height:"100%",
                  objectFit:"contain",objectPosition:"center bottom",
                  position:"absolute",inset:0,display:"block",
                }}
                onError={e=>{e.target.style.visibility="hidden";}}
              />

              {/* 모션 영상 — 이미지 위에 겹쳐서 재생 */}
              <video
                key={char.id}
                autoPlay loop muted playsInline
                style={{
                  width:"100%",height:"100%",
                  objectFit:"contain",objectPosition:"center bottom",
                  position:"absolute",inset:0,display:"block",
                  zIndex:2,
                }}
                onError={e=>{e.target.style.display="none";}}
              >
                <source src={char.motion} type="video/mp4"/>
              </video>

              {/* 하단 그라디언트 */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,zIndex:3,
                background:"linear-gradient(transparent,rgba(13,9,30,.9))",pointerEvents:"none"}}/>
            </div>
            {/* 캐릭터 정보 오버레이 — 우측 하단 */}
            <div style={{
              position:"absolute",bottom:0,right:0,width:160,
              padding:"12px 14px",
              background:"linear-gradient(135deg,transparent,rgba(0,0,0,.8))",
            }}>
              <div style={{fontSize:17,fontWeight:800,color:C.goldL,marginBottom:2}}>{char.name}</div>
              <div style={{fontSize:11,color:C.t2,marginBottom:4}}>{char.role}</div>
              <div style={{fontSize:9,color:C.t3,lineHeight:1.5,marginBottom:8}}>{char.desc}</div>
              <div style={{fontSize:9,color:"#4caf50",background:"rgba(76,175,80,.12)",
                border:"1px solid rgba(76,175,80,.3)",borderRadius:99,padding:"3px 8px",display:"inline-block"}}>
                ▶ 모션 재생 중
              </div>
            </div>
          </div>
        ):(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:6}}>
            <div style={{fontSize:30,opacity:.15}}>👤</div>
            <div style={{fontSize:11,color:C.t3}}>캐릭터를 선택하면 모션이 재생됩니다</div>
          </div>
        )}
      </div>

      {/* 캐릭터 그리드 */}
      <div style={{padding:"12px 14px",background:C.bg1}}>
        <div style={{fontSize:10,color:C.t3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10}}>영웅 목록</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:14}}>
          {CHARS.map(c=>(
            <button key={c.id} onClick={()=>{setSel(c.id);setNaming(false);}} style={{
              cursor:"pointer",borderRadius:6,overflow:"hidden",border:"none",padding:0,
              outline:`1.5px solid ${sel===c.id?C.gold:C.bdr1}`,
              background:sel===c.id?C.bg3:C.bg2,
              boxShadow:sel===c.id?`0 0 12px ${C.goldD}88`:"none",
            }}>
              <div style={{height:64,background:C.bg0,display:"flex",alignItems:"center",
                justifyContent:"center",position:"relative",overflow:"hidden"}}>
                <img src={c.img} alt={c.name}
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}
                  onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
                <div style={{display:"none",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:26}}>{c.emoji}</div>
                {sel===c.id&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,
                  background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>}
              </div>
              <div style={{padding:"5px 4px 6px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:sel===c.id?C.goldL:C.t1}}>{c.name}</div>
                <div style={{fontSize:8,color:C.t3,marginTop:1}}>{c.role}</div>
              </div>
            </button>
          ))}
          <div style={{borderRadius:6,border:`1.5px dashed ${C.bdr0}`,display:"flex",
            alignItems:"center",justifyContent:"center",opacity:.2,minHeight:90}}>
            <span style={{fontSize:16,color:C.t3}}>＋</span>
          </div>
        </div>
        {!naming?(
          <button onClick={()=>sel&&setNaming(true)} disabled={!sel} style={{
            width:"100%",padding:"13px",borderRadius:4,border:"none",
            background:sel?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,
            color:sel?"#000":C.t3,fontSize:14,fontWeight:800,cursor:sel?"pointer":"default",
          }}>{sel?`${char?.name} 선택 → 이름 정하기`:"캐릭터를 먼저 선택하세요"}</button>
        ):(
          <div>
            <div style={{fontSize:11,color:C.t2,marginBottom:8}}>캐릭터 이름 입력</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="닉네임..."
              autoFocus
              style={{width:"100%",padding:"11px 12px",borderRadius:4,background:C.bg0,
                border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:14,outline:"none",
                marginBottom:8,fontFamily:"inherit"}}/>
            <button onClick={()=>name.trim()&&onSelect(sel,name.trim())} disabled={!name.trim()} style={{
              width:"100%",padding:"13px",borderRadius:4,border:"none",
              background:name.trim()?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,
              color:name.trim()?"#000":C.t3,fontSize:14,fontWeight:800,
              cursor:name.trim()?"pointer":"default",
            }}>게임 시작 ›</button>
          </div>
        )}
      </div>
    </Phone>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 화면 02 — 인벤토리 (메인)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function InvScreen({charId,charName,gold,scrolls,dailyLeft,onChest,onShop,onRank,onEnhance,inventory,equipped,onEquip}){
  const [tab,setTab]=useState("weapon");
  const [selItem,setSelItem]=useState(null);
  const [sold,setSold]=useState([]);
  const char=CHARS.find(c=>c.id===charId)||CHARS[0];

  // 탭별 아이템
  const tabItems=useMemo(()=>{
    const all=inventory.filter(i=>!sold.includes(i.uid));
    if(tab==="weapon") return all.filter(i=>i.type==="weapon");
    if(tab==="armor")  return all.filter(i=>i.type==="armor");
    return all.filter(i=>i.type==="accessory");
  },[inventory,sold,tab]);

  // 장착 아이템 정보
  const eqWeapon =inventory.find(i=>i.uid===equipped.weapon);
  const eqArmor  =inventory.find(i=>i.uid===equipped.armor);
  const eqAcc    =inventory.find(i=>i.uid===equipped.accessory);

  // 합산 스탯
  const totalStats=useMemo(()=>{
    const items=[eqWeapon,eqArmor,eqAcc].filter(Boolean);
    return items.reduce((acc,it)=>{
      const st=calcStat(it.atk||it.def||0,it.grade,it.enhance||0,it.type);
      return {atk:acc.atk+st.atk,def:acc.def+st.def,mdef:acc.mdef+st.mdef,
        crit:Math.min(80,acc.crit+st.crit),eva:Math.min(60,acc.eva+st.eva)};
    },{atk:0,def:0,mdef:0,crit:0,eva:0});
  },[eqWeapon,eqArmor,eqAcc]);

  const totalScore=Math.round(totalStats.atk*3+totalStats.def*2+totalStats.mdef*2+totalStats.crit*100+totalStats.eva*100);

  return(
    <Phone>
      {/* ━━ 상단 HUD ━━ */}
      <div style={{background:C.bg0,borderBottom:`1px solid ${C.bdr1}`,
        padding:"6px 8px",display:"flex",alignItems:"stretch",gap:4}}>
        <button onClick={onChest} style={{flex:1,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:1,
          background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,
          padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16,lineHeight:1}}>📦</span>
          <span style={{fontSize:8,color:C.t3,lineHeight:1.2}}>보물상자</span>
          <span style={{fontSize:10,fontWeight:800,color:dailyLeft>0?C.goldL:C.fail,lineHeight:1}}>{dailyLeft}회</span>
        </button>
        <button onClick={onShop} style={{flex:1,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:1,
          background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,
          padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16,lineHeight:1}}>🛒</span>
          <span style={{fontSize:8,color:C.t3,lineHeight:1.2}}>상점</span>
          <span style={{fontSize:10,fontWeight:800,color:C.t1,lineHeight:1}}>구매</span>
        </button>
        <div style={{flex:1.3,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:1,
          background:`${C.goldD}22`,border:`1px solid ${C.goldD}55`,borderRadius:5,padding:"5px 2px"}}>
          <span style={{fontSize:16,lineHeight:1}}>💰</span>
          <span style={{fontSize:8,color:C.t3,lineHeight:1.2}}>골드</span>
          <span style={{fontSize:10,fontWeight:800,color:C.goldL,lineHeight:1}}>{gold.toLocaleString()}</span>
        </div>
        <button onClick={onShop} style={{flex:1.7,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:1,
          background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,
          padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16,lineHeight:1}}>📜</span>
          <span style={{fontSize:8,color:C.t3,lineHeight:1.2}}>주문서</span>
          <span style={{fontSize:9,fontWeight:700,lineHeight:1.3}}>
            <span style={{color:C.goldL}}>일반{scrolls.normal}</span>
            <span style={{color:C.bdr2}}> · </span>
            <span style={{color:C.e}}>고급{scrolls.adv}</span>
          </span>
        </button>
        <button onClick={onRank} style={{flex:1,display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:1,
          background:C.bg2,border:`1px solid ${C.bdr2}`,borderRadius:5,
          padding:"5px 2px",cursor:"pointer",color:C.t1}}>
          <span style={{fontSize:16,lineHeight:1}}>🏆</span>
          <span style={{fontSize:8,color:C.t3,lineHeight:1.2}}>랭킹</span>
          <span style={{fontSize:10,fontWeight:800,color:C.goldL,lineHeight:1}}>#247</span>
        </button>
      </div>

      <div style={{overflowY:"auto",maxHeight:640}}>
        {/* ━━ 캐릭터(좌) + 장착현황(우) ━━ */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:`1px solid ${C.bdr1}`}}>
          {/* 좌: 캐릭터 + 스탯 */}
          <div style={{borderRight:`1px solid ${C.bdr0}`,background:`linear-gradient(180deg,${C.bg0},${C.bg1})`}}>
            <div style={{height:150,display:"flex",alignItems:"center",justifyContent:"center",
              position:"relative",overflow:"hidden",background:C.bg0}}>
              <img src={char.img} alt={char.name}
                style={{height:"100%",width:"100%",objectFit:"contain",objectPosition:"center bottom"}}
                onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
              <div style={{display:"none",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:55}}>{char.emoji}</div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,
                background:"linear-gradient(transparent,rgba(0,0,0,.6))",pointerEvents:"none"}}/>
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
              <div style={{marginTop:6,background:C.bg2,borderRadius:4,padding:"4px 6px",fontSize:9,color:C.gold,fontWeight:700}}>
                총점: {totalScore.toLocaleString()} pt
              </div>
            </div>
          </div>

          {/* 우: 장착현황 */}
          <div style={{background:C.bg1,padding:"10px"}}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>◆ 장착 현황</div>
            {[
              ["weapon","⚔","무기",eqWeapon],
              ["armor","🛡","방어구",eqArmor],
              ["accessory","💍","장신구",eqAcc],
            ].map(([slot,ic,lb,it])=>{
              const g=gradeMap[it?.grade]||"n";
              return(
                <div key={slot} style={{background:C.bg2,border:`1px solid ${it?GC[g]+"33":C.bdr0}`,
                  borderRadius:4,padding:"7px 8px",marginBottom:6}}>
                  <div style={{fontSize:8,color:C.t3,marginBottom:3}}>{lb}</div>
                  {it?(
                    <>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                        <div style={{width:28,height:28,background:C.bg0,borderRadius:3,flexShrink:0,
                          border:`1px solid ${GC[g]}44`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <img src={it.img} alt={it.name} style={{width:"90%",height:"90%",objectFit:"contain"}}
                            onError={e=>{e.target.style.display="none";}}/>
                        </div>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontSize:10,fontWeight:700,color:GC[g],overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {it.name}{(it.enhance||0)>0&&<span style={{color:C.goldL}}> +{it.enhance}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <Pill grade={it.grade} sm/>
                        {(it.enhance||0)>0&&<EnhTag n={it.enhance}/>}
                      </div>
                    </>
                  ):(
                    <div style={{fontSize:10,color:C.t3,display:"flex",alignItems:"center",gap:5}}>
                      <span style={{opacity:.3}}>{ic}</span> 미장착
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ━━ 인벤토리 ━━ */}
        <div style={{background:C.bg1,padding:"10px 12px 20px"}}>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {[["weapon","⚔ 무기"],["armor","🛡 방어구"],["accessory","💍 장신구"]].map(([t,lb])=>(
              <button key={t} onClick={()=>{setTab(t);setSelItem(null);}} style={{
                flex:1,padding:"7px 0",borderRadius:3,fontSize:10,fontWeight:700,border:"none",
                background:tab===t?C.bg3:C.bg2,
                outline:`1px solid ${tab===t?C.gold+"66":C.bdr1}`,
                color:tab===t?C.goldL:C.t2,cursor:"pointer",
                borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",
              }}>{lb}</button>
            ))}
          </div>

          {/* 30칸 그리드 (5열) */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
            {[...tabItems,...Array(Math.max(0,30-tabItems.length)).fill(null)].slice(0,30).map((item,i)=>(
              <ItemSlot key={item?.uid||`e${i}`} item={item}
                selected={selItem?.uid===item?.uid}
                onClick={it=>setSelItem(selItem?.uid===it.uid?null:it)}/>
            ))}
          </div>

          {/* 선택된 아이템 상세 */}
          {selItem&&(
            <CBox gold style={{padding:"12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:52,height:52,background:C.bg0,borderRadius:4,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:`1px solid ${GC[gradeMap[selItem.grade]||"n"]}55`,overflow:"hidden"}}>
                  <img src={selItem.img} alt={selItem.name} style={{width:"90%",height:"90%",objectFit:"contain"}}
                    onError={e=>{e.target.style.display="none";}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:GC[gradeMap[selItem.grade]||"n"],marginBottom:4}}>
                    {selItem.name}
                    {(selItem.enhance||0)>0&&<span style={{color:C.goldL,marginLeft:5}}>+{selItem.enhance}</span>}
                  </div>
                  <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
                    <Pill grade={selItem.grade} sm/>
                    {(selItem.enhance||0)>0&&<EnhTag n={selItem.enhance}/>}
                  </div>
                  {/* 스탯 미리보기 */}
                  <div style={{fontSize:9,color:C.t2}}>
                    {selItem.type==="weapon"?`⚔ 공격력 +${selItem.atk||0}`:`🛡 방어력 +${selItem.def||0}`}
                    {` | 치명타 ${calcStat(selItem.atk||selItem.def||0,selItem.grade,selItem.enhance||0,selItem.type).crit}%`}
                  </div>
                </div>
              </div>
              <Divider/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <button onClick={()=>onEnhance(selItem)} style={{
                  padding:"10px 0",borderRadius:4,border:"none",
                  background:`linear-gradient(135deg,${C.goldD},${C.gold})`,
                  color:"#000",fontSize:12,fontWeight:800,cursor:"pointer"}}>⚡ 강화</button>
                <button onClick={()=>{onEquip(selItem);setSelItem(null);}} style={{
                  padding:"10px 0",borderRadius:4,background:C.bg3,
                  border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:12,fontWeight:700,cursor:"pointer"}}>🎒 장착</button>
                <button onClick={()=>{
                  if(window.confirm(`[${selItem.name}]을(를) ${(selItem.sell||0).toLocaleString()}G에 판매하시겠습니까?`)){
                    setSold(s=>[...s,selItem.uid]);setSelItem(null);
                  }
                }} style={{
                  padding:"10px 0",borderRadius:4,background:`${C.fail}18`,
                  border:`1px solid ${C.fail}44`,color:C.fail,fontSize:12,fontWeight:700,cursor:"pointer"}}>💰 판매</button>
              </div>
            </CBox>
          )}
        </div>
      </div>
    </Phone>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 보물상자 팝업
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ChestModal({onClose,charId,onAddItem,onAddGold,dailyLeft,setDailyLeft}){
  const [result,setResult]=useState(null);
  const [opening,setOpening]=useState(false);
  const [hist,setHist]=useState([]);
  const char=CHARS.find(c=>c.id===charId)||CHARS[0];

  const PROBS=[
    {g:"n",l:"일반",p:40},{g:"m",l:"매직",p:28},{g:"r",l:"레어",p:18},
    {g:"e",l:"에픽",p:9},{g:"l",l:"레전드",p:4},{g:"my",l:"신화",p:1}
  ];
  const GOLD_TIERS=[{min:200,max:999,w:40},{min:1000,max:4999,w:30},{min:5000,max:14999,w:15},
    {min:15000,max:29999,w:8},{min:30000,max:49999,w:4},{min:50000,max:79999,w:2},{min:80000,max:100000,w:1}];

  const wRand=arr=>{let r=Math.random()*arr.reduce((s,i)=>s+(i.w||i.p),0);for(const i of arr){r-=(i.w||i.p);if(r<=0)return i;}return arr[arr.length-1];};

  const rollItem=()=>{
    const gw=wRand(PROBS);
    // 캐릭터 전용 무기 + 공통 방어구/장신구 중 선택
    const charWeapons=rawWeapons.filter(w=>w.cls===char.weaponClass&&gradeMap[w.grade]===gw.g);
    const commonArmors=rawArmors.filter(a=>gradeMap[a.grade]===gw.g);
    const commonAccs=rawAccs.filter(a=>gradeMap[a.grade]===gw.g);
    const allPool=[...charWeapons.map(w=>({...w,type:"weapon"})),
                   ...commonArmors.map(a=>({...a,type:"armor"})),
                   ...commonAccs.map(a=>({...a,type:"accessory"}))];
    if(!allPool.length) return null;
    const picked=allPool[Math.floor(Math.random()*allPool.length)];
    return {...picked,uid:`${picked.id}_${Date.now()}`,enhance:0};
  };

  const doOpen=(count=1)=>{
    if(opening||dailyLeft<=0)return;
    const times=Math.min(count,dailyLeft);
    setOpening(true);
    setTimeout(()=>{
      const results=[];
      for(let i=0;i<times;i++){
        const isGold=Math.random()<.45;
        if(isGold){
          const tier=wRand(GOLD_TIERS);
          const amount=Math.floor(Math.random()*(tier.max-tier.min+1))+tier.min;
          results.push({type:"gold",amount});
          onAddGold(amount);
        } else {
          const item=rollItem();
          if(item){results.push({type:"item",item});onAddItem(item);}
        }
      }
      setDailyLeft(d=>d-times);
      const last=results[results.length-1];
      setResult(last);
      setHist(h=>[...results.map(r=>({...r,time:new Date().toLocaleTimeString("ko",{hour:"2-digit",minute:"2-digit"})})).reverse(),...h].slice(0,8));
      setOpening(false);
    },700);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",maxHeight:"88vh",
        overflow:"hidden",display:"flex",flexDirection:"column",border:`1px solid ${C.bdr1}`,borderBottom:"none"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:`1px solid ${C.bdr1}`,background:C.bg0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>📦</span>
            <span style={{fontSize:15,fontWeight:700}}>전설의 보물상자</span>
          </div>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:4,background:C.bg2,
            border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"16px"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <button onClick={()=>doOpen(1)} disabled={opening||dailyLeft<=0} style={{
              width:120,height:120,background:C.bg2,borderRadius:8,fontSize:60,
              border:`2px solid ${opening?C.gold:dailyLeft>0?C.bdr2:C.t3}`,
              cursor:dailyLeft>0&&!opening?"pointer":"default",
              boxShadow:opening?`0 0 30px ${C.goldD}88`:"0 4px 20px rgba(0,0,0,.4)",
              transform:opening?"scale(1.08)":"scale(1)",transition:"all .2s",
              display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
              {opening?"✨":"📦"}
            </button>
            <div style={{marginTop:10,fontSize:12,color:C.t2}}>
              오늘 남은 횟수 <strong style={{color:dailyLeft>0?C.goldL:C.fail,fontSize:15}}>{dailyLeft}</strong> / 30
            </div>
            <div style={{height:4,background:C.bg2,borderRadius:99,margin:"8px 20px",overflow:"hidden"}}>
              <div style={{width:`${(dailyLeft/30)*100}%`,height:"100%",background:`linear-gradient(90deg,${C.goldD},${C.gold})`,borderRadius:99,transition:"width .3s"}}/>
            </div>
          </div>

          {result&&(
            <CBox gold style={{padding:"14px",textAlign:"center",marginBottom:14}}>
              {result.type==="gold"
                ?<><div style={{fontSize:36,marginBottom:6}}>💰</div>
                  <div style={{fontSize:24,fontWeight:800,color:C.goldL}}>{result.amount.toLocaleString()} G</div>
                  <div style={{fontSize:11,color:C.t2}}>골드 획득!</div></>
                :<><div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                    <img src={result.item.img} alt={result.item.name} style={{width:60,height:60,objectFit:"contain"}}
                      onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:40px'>⚔</span>");}}/>
                  </div>
                  <Pill grade={result.item.grade}/>
                  <div style={{fontSize:14,fontWeight:700,marginTop:6,color:GC[gradeMap[result.item.grade]||"n"]}}>{result.item.name}</div></>}
            </CBox>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            <button onClick={()=>doOpen(1)} disabled={opening||dailyLeft<=0} style={{
              padding:"12px",borderRadius:4,border:"none",
              background:dailyLeft>0&&!opening?`linear-gradient(135deg,${C.goldD},${C.gold})`:C.bg2,
              color:dailyLeft>0&&!opening?"#000":C.t3,fontSize:13,fontWeight:800,cursor:dailyLeft>0&&!opening?"pointer":"default"}}>
              {opening?"열는 중...":"📦 1회 열기"}</button>
            <button onClick={()=>doOpen(10)} disabled={opening||dailyLeft<=0} style={{
              padding:"12px",borderRadius:4,background:C.bg2,
              border:`1px solid ${C.bdr2}`,color:dailyLeft>0?C.t1:C.t3,fontSize:13,fontWeight:600,
              cursor:dailyLeft>0&&!opening?"pointer":"default"}}>🎯 10회 연속</button>
          </div>

          <div style={{fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:7}}>◆ 드랍 확률</div>
          <div style={{background:C.bg2,borderRadius:4,padding:"10px 12px",marginBottom:14,border:`1px solid ${C.bdr1}`}}>
            {PROBS.map(x=>(
              <div key={x.g} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:GC[x.g],flexShrink:0}}/>
                <span style={{fontSize:10,color:C.t2,minWidth:38}}>{x.l}</span>
                <div style={{flex:1,height:4,background:C.bg0,borderRadius:99,overflow:"hidden"}}>
                  <div style={{width:`${x.p*1.8}%`,height:"100%",background:GC[x.g],borderRadius:99}}/>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:GC[x.g],minWidth:28,textAlign:"right"}}>{x.p}%</span>
              </div>
            ))}
          </div>

          {hist.length>0&&(
            <>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:7}}>◆ 오픈 이력</div>
              {hist.map((h,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.bdr0}`}}>
                  <div style={{width:30,height:30,background:C.bg2,borderRadius:4,display:"flex",
                    alignItems:"center",justifyContent:"center",fontSize:14,overflow:"hidden",
                    border:`1px solid ${h.type==="gold"?C.goldD+"55":GC[gradeMap[h.item?.grade||"n"]||"n"]+"44"}`}}>
                    {h.type==="gold"?"💰":
                      <img src={h.item?.img} alt="" style={{width:"90%",height:"90%",objectFit:"contain"}}
                        onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span>⚔</span>");}}/>}
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 강화 팝업
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function EnhModal({item:initItem,onClose,gold,onSpendGold,scrolls,onUseScroll,onUpdateItem}){
  const [item,setItem]=useState({...initItem,enhance:initItem.enhance||0});
  const [scroll,setScroll]=useState("normal");
  const [outcome,setOutcome]=useState(null);
  const lv=item.enhance; const prob=lv<15?SP[lv]:0;
  const g=gradeMap[item.grade]||"n"; const gc=GC[g];
  const OC={
    success:{bg:C.succ+"22",border:C.succ,text:"강화 성공!",tc:C.succ},
    stay:{bg:C.warn+"18",border:C.warn,text:"단계 유지",tc:C.warn},
    fail:{bg:C.fail+"18",border:C.fail,text:"강화 실패 -1",tc:C.fail},
  };
  const cost=scroll==="normal"?500:2000;
  const stockKey=scroll==="normal"?"normal":"adv";

  const doEnh=()=>{
    if(gold<cost){alert("골드가 부족합니다!");return;}
    if((scrolls[stockKey]||0)<=0){alert("주문서가 없습니다!");return;}
    if(lv>=15)return;
    onSpendGold(cost); onUseScroll(stockKey);
    const r=Math.random()*100; let oc;
    if(r<prob){setItem(i=>({...i,enhance:i.enhance+1}));oc="success";}
    else if(lv>=9){oc=Math.random()*100<FK[lv]?"stay":"fail";if(oc==="fail")setItem(i=>({...i,enhance:Math.max(0,i.enhance-1)}));}
    else oc="stay";
    setOutcome(oc);
    setTimeout(()=>{
      onUpdateItem({...item,enhance:oc==="success"?lv+1:oc==="fail"?Math.max(0,lv-1):lv});
      setOutcome(null);
    },1400);
  };

  const st=calcStat(item.atk||item.def||0,item.grade,item.enhance,"weapon"===item.type?"weapon":"armor");

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
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
          {/* 연출 */}
          <div style={{background:`radial-gradient(circle at 50% 60%,${gc}18,${C.bg2} 70%)`,
            border:`2px solid ${outcome?OC[outcome]?.border:gc}`,borderRadius:8,padding:"16px",
            textAlign:"center",marginBottom:14,position:"relative",
            display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"border-color .3s"}}>
            <img src={item.img} alt={item.name}
              style={{width:70,height:70,objectFit:"contain"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div style={{fontSize:16,fontWeight:800,color:gc}}>
              {item.name} <span style={{color:C.goldL}}>+{item.enhance}</span>
            </div>
            <Pill grade={item.grade}/>
            <div style={{fontSize:10,color:C.t2}}>
              {item.type==="weapon"?`⚔ 공격력 ${st.atk} | 💥 치명타 ${st.crit}%`:`🛡 방어력 ${st.def} | 💨 회피 ${st.eva}%`}
            </div>
            {outcome&&<div style={{position:"absolute",inset:0,background:OC[outcome]?.bg,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,fontWeight:800,color:OC[outcome]?.tc,borderRadius:6}}>{OC[outcome]?.text}</div>}
          </div>

          {/* 단계 칩 */}
          <div style={{overflowX:"auto",display:"flex",gap:4,paddingBottom:6,marginBottom:12}}>
            {SP.map((p,i)=>(
              <div key={i} style={{flexShrink:0,padding:"4px 8px",borderRadius:3,fontSize:9,fontWeight:700,
                whiteSpace:"nowrap",background:i===lv?C.bg3:C.bg2,color:i===lv?C.goldL:C.t3,
                border:`1px solid ${i===lv?C.gold+"66":C.bdr1}`}}>+{i+1}·{p}%</div>
            ))}
          </div>

          {/* 성공률 */}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:11,color:C.t2}}>성공 확률</span>
              <span style={{fontSize:18,fontWeight:800,color:prob>=70?C.succ:prob>=40?C.warn:C.fail}}>{lv<15?`${prob}%`:"MAX"}</span>
            </div>
            <div style={{height:6,background:C.bg2,borderRadius:99,overflow:"hidden"}}>
              <div style={{width:`${prob}%`,height:"100%",borderRadius:99,transition:"width .4s",
                background:prob>=70?C.succ:prob>=40?C.warn:C.fail}}/>
            </div>
          </div>

          {lv>=9&&<div style={{background:C.bg2,borderRadius:4,padding:"7px 10px",marginBottom:12,
            fontSize:10,color:C.t2,border:`1px solid ${C.bdr0}`}}>
            실패 시: <span style={{color:C.succ,fontWeight:700}}>{FK[lv]}% 유지</span> / <span style={{color:C.fail,fontWeight:700}}>{100-FK[lv]}% -1 하락</span>
          </div>}

          {/* 주문서 선택 */}
          <div style={{fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:7}}>◆ 주문서 선택</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[["normal","일반","500 G","일반~레어"],["adv","고급","2,000 G","에픽~신화"]].map(([t,nm,pr,rng])=>(
              <button key={t} onClick={()=>setScroll(t)} style={{
                border:`2px solid ${scroll===t?C.gold:C.bdr1}`,borderRadius:5,padding:"10px 8px",
                textAlign:"center",cursor:"pointer",background:scroll===t?C.bg3:C.bg2}}>
                <div style={{fontSize:20,marginBottom:3,filter:t==="adv"?"hue-rotate(240deg)":"none"}}>📜</div>
                <div style={{fontSize:11,fontWeight:700,color:scroll===t?C.goldL:C.t1,marginBottom:1}}>{nm} 주문서</div>
                <div style={{fontSize:9,color:scroll===t?C.t2:C.t3,marginBottom:3}}>{rng}</div>
                <div style={{fontSize:13,fontWeight:800,color:scroll===t?C.goldL:C.gold}}>{pr}</div>
                <div style={{fontSize:9,color:C.t3,marginTop:1}}>보유 {scrolls[t]||0}개</div>
              </button>
            ))}
          </div>

          <button onClick={doEnh} disabled={lv>=15||!!outcome} style={{
            width:"100%",padding:"14px",borderRadius:4,border:"none",
            background:lv>=15||outcome?C.bg2:`linear-gradient(135deg,${C.goldD},${C.gold})`,
            color:lv>=15||outcome?C.t3:"#000",fontSize:15,fontWeight:800,
            cursor:lv>=15||outcome?"default":"pointer"}}>
            {lv>=15?"◆ 최대 강화 완료":`⚡ 강화 (${cost.toLocaleString()} G)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 상점 팝업
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ShopModal({onClose,gold,onSpendGold,onAddScrolls}){
  const [tab,setTab]=useState("weapon");
  const [qty,setQty]=useState({normal:1,adv:1});
  const [toast,setToast]=useState(null);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2000);};

  const ITEMS={
    weapon:[
      {nm:"무기 강화 주문서",img:CONSUMABLES[0].img,sub:"일반~레어 무기 강화",price:500,type:"normal"},
      {nm:"고급 무기 강화 주문서",img:CONSUMABLES[0].img,sub:"에픽~신화 무기 강화",price:2000,type:"adv"},
    ],
    armor:[
      {nm:"방어구 강화 주문서",img:CONSUMABLES[1].img,sub:"일반~레어 방어구 강화",price:500,type:"normal"},
      {nm:"고급 방어구 강화 주문서",img:CONSUMABLES[1].img,sub:"에픽~신화 방어구 강화",price:2000,type:"adv"},
    ],
    accessory:[
      {nm:"장신구 강화 주문서",img:CONSUMABLES[2].img,sub:"일반~레어 장신구 강화",price:500,type:"normal"},
      {nm:"고급 장신구 강화 주문서",img:CONSUMABLES[2].img,sub:"에픽~신화 장신구 강화",price:2000,type:"adv"},
    ],
  };

  const buy=(item)=>{
    const q=qty[item.type];
    const total=item.price*q;
    if(gold<total){showToast("골드가 부족합니다!");return;}
    onSpendGold(total);
    onAddScrolls(item.type,q);
    showToast(`${item.nm} ${q}개 구매 완료!`);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:390,background:C.bg1,borderRadius:"16px 16px 0 0",maxHeight:"88vh",
        overflow:"hidden",display:"flex",flexDirection:"column",border:`1px solid ${C.bdr1}`,borderBottom:"none"}}>
        <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:`1px solid ${C.bdr1}`,background:C.bg0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🛒</span>
            <span style={{fontSize:15,fontWeight:700}}>강화 주문서 상점</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,color:C.goldL,fontWeight:700}}>💰 {gold.toLocaleString()} G</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:4,background:C.bg2,
              border:`1px solid ${C.bdr1}`,color:C.t2,fontSize:14,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"14px"}}>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            {[["weapon","⚔ 무기"],["armor","🛡 방어구"],["accessory","💍 장신구"]].map(([t,lb])=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 0",borderRadius:3,
                fontSize:10,fontWeight:700,border:"none",
                background:tab===t?C.bg3:C.bg2,
                outline:`1px solid ${tab===t?C.gold+"55":C.bdr1}`,
                color:tab===t?C.goldL:C.t2,cursor:"pointer",
                borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent"}}>{lb}</button>
            ))}
          </div>
          {(ITEMS[tab]||[]).map((it,i)=>(
            <CBox key={i} gold={it.type==="adv"} style={{padding:"14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:48,height:48,background:C.bg0,borderRadius:5,overflow:"hidden",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:`1px solid ${it.type==="adv"?C.e+"44":C.bdr1}`}}>
                  <img src={it.img} alt={it.nm} style={{width:"90%",height:"90%",objectFit:"contain"}}
                    onError={e=>{e.target.style.display="none";e.target.insertAdjacentHTML("afterend","<span style='font-size:24px'>📜</span>");}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:it.type==="adv"?C.e:C.t1,marginBottom:3}}>{it.nm}</div>
                  <div style={{fontSize:10,color:C.t2,marginBottom:4}}>{it.sub}</div>
                </div>
                <div style={{fontSize:18,fontWeight:800,color:it.type==="adv"?C.e:C.goldL,textAlign:"right"}}>
                  {it.price.toLocaleString()}<div style={{fontSize:9,color:C.t3,fontWeight:400}}>G / 개</div>
                </div>
              </div>
              <Divider my={8}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {[-10,-1,1,10].map(d=>(
                    <button key={d} onClick={()=>setQty(q=>({...q,[it.type]:Math.max(1,Math.min(99,(q[it.type]||1)+d))}))}
                      style={{width:d===1||d===-1?28:34,height:28,borderRadius:3,background:C.bg2,
                        border:`1px solid ${C.bdr2}`,color:C.t1,fontSize:d===1||d===-1?16:10,fontWeight:700,cursor:"pointer"}}>
                      {d>0?`+${d}`:d}</button>
                  ))}
                  <span style={{fontSize:16,fontWeight:800,minWidth:28,textAlign:"center",color:C.t1}}>{qty[it.type]||1}</span>
                </div>
                <button onClick={()=>buy(it)} style={{flex:1,padding:"10px",borderRadius:4,border:"none",
                  background:it.type==="adv"?`linear-gradient(135deg,#7722cc,${C.e})`:`linear-gradient(135deg,${C.goldD},${C.gold})`,
                  color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer"}}>
                  구매 {((qty[it.type]||1)*it.price).toLocaleString()} G</button>
              </div>
            </CBox>
          ))}
          {toast&&<div style={{background:C.succ+"18",border:`1px solid ${C.succ}`,borderRadius:5,
            padding:"10px 14px",textAlign:"center",fontSize:12,color:C.succ,fontWeight:700}}>{toast}</div>}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 랭킹 팝업
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
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
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                border:`1px solid ${C.goldD}55`}}>
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

          <div style={{fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>◆ TOP 3</div>
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
                <div style={{fontSize:10,fontWeight:700,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.nick}</div>
                <div style={{fontSize:9,color:C.t2,marginBottom:4}}>{d.char}</div>
                <div style={{fontSize:11,fontWeight:800,color:C.goldL}}>{d.score.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:8}}>◆ 전체 순위</div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {DEMO.filter(d=>!d.isMe).slice(3).concat([myRankData]).filter(Boolean).map(d=>(
              <div key={d.rank} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",
                borderRadius:4,background:d.isMe?C.bg3:C.bg2,
                border:`1px solid ${d.isMe?C.gold+"55":C.bdr0}`,
                boxShadow:d.isMe?`0 0 8px ${C.goldD}55`:"none"}}>
                <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,minWidth:34,
                  color:d.isMe?C.goldL:C.t3}}>#{d.rank}</span>
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 앱 — 전체 상태 관리
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App(){
  const [screen,setScreen]=useState("title");
  const [charId,setCharId]=useState(null);
  const [charName,setCharName]=useState("");
  const [gold,setGold]=useState(5000);
  const [scrolls,setScrolls]=useState({normal:3,adv:1});
  const [dailyLeft,setDailyLeft]=useState(30);
  const [inventory,setInventory]=useState([]);
  const [equipped,setEquipped]=useState({weapon:null,armor:null,accessory:null});
  const [showChest,setShowChest]=useState(false);
  const [enhItem,setEnhItem]=useState(null);
  const [showRank,setShowRank]=useState(false);
  const [showShop,setShowShop]=useState(false);

  const char=CHARS.find(c=>c.id===charId);

  // 총점 계산
  const totalScore=useMemo(()=>{
    const eqW=inventory.find(i=>i.uid===equipped.weapon);
    const eqA=inventory.find(i=>i.uid===equipped.armor);
    const eqC=inventory.find(i=>i.uid===equipped.accessory);
    return [eqW,eqA,eqC].filter(Boolean).reduce((acc,it)=>{
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
    const slot=item.type==="weapon"?"weapon":item.type==="armor"?"armor":"accessory";
    setEquipped(e=>({...e,[slot]:item.uid}));
  };

  return(
    <div style={{background:"#111214",minHeight:"100vh",padding:"0",
      fontFamily:"'Black Han Sans','Apple SD Gothic Neo','Noto Sans KR',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box;} input,button{font-family:inherit;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px;}
      `}</style>

      {/* 개발자 전용 탭 — 플레이어에게 숨김 */}
      <div style={{display:"none"}}>
        <button onClick={()=>setScreen("title")}>타이틀</button>
        <button onClick={()=>setScreen("char")}>캐릭터</button>
        <button onClick={()=>setScreen("inv")}>인벤</button>
      </div>

      <div style={{maxWidth:390,margin:"0 auto",position:"relative"}}>
        {screen==="title"&&<TitleScreen onNew={()=>setScreen("char")} onLoad={()=>handleSelect("CHR_001","모험가")}/>}
        {screen==="char" &&<CharScreen onBack={()=>setScreen("title")} onSelect={handleSelect}/>}
        {screen==="inv"  &&<InvScreen
          charId={charId||"CHR_001"} charName={charName||"모험가"}
          gold={gold} scrolls={scrolls} dailyLeft={dailyLeft}
          onChest={()=>setShowChest(true)} onShop={()=>setShowShop(true)}
          onRank={()=>setShowRank(true)} onEnhance={i=>setEnhItem(i)}
          inventory={inventory} equipped={equipped} onEquip={equipItem}/>}

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