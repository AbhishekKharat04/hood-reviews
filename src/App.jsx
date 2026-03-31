import { useState, useEffect, useRef } from "react";
import { auth, googleProvider, db } from "./firebase.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, setDoc, deleteDoc, doc } from "firebase/firestore";

const FontLink = () => {
  useEffect(() => {
    if (document.getElementById("hr-fonts")) return;
    const l = document.createElement("link");
    l.id = "hr-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
};

const COUNTRIES = [
  { code:"IN", flag:"🇮🇳", name:"India",           label:"Pincode",       ph:"411001"        },
  { code:"US", flag:"🇺🇸", name:"United States",    label:"ZIP Code",      ph:"10001"         },
  { code:"GB", flag:"🇬🇧", name:"United Kingdom",   label:"Postcode",      ph:"SW1A 1AA"      },
  { code:"CA", flag:"🇨🇦", name:"Canada",           label:"Postal Code",   ph:"K1A 0A6"       },
  { code:"AU", flag:"🇦🇺", name:"Australia",        label:"Postcode",      ph:"2000"          },
  { code:"DE", flag:"🇩🇪", name:"Germany",          label:"PLZ",           ph:"10115"         },
  { code:"FR", flag:"🇫🇷", name:"France",           label:"Code Postal",   ph:"75001"         },
  { code:"JP", flag:"🇯🇵", name:"Japan",            label:"Postal Code",   ph:"100-0001"      },
  { code:"SG", flag:"🇸🇬", name:"Singapore",        label:"Postal Code",   ph:"018956"        },
  { code:"AE", flag:"🇦🇪", name:"UAE",              label:"Area/Zone",     ph:"Downtown Dubai"},
  { code:"BR", flag:"🇧🇷", name:"Brazil",           label:"CEP",           ph:"01310-100"     },
  { code:"MX", flag:"🇲🇽", name:"Mexico",           label:"C.P.",          ph:"06600"         },
  { code:"ZA", flag:"🇿🇦", name:"South Africa",     label:"Postal Code",   ph:"2000"          },
  { code:"NG", flag:"🇳🇬", name:"Nigeria",          label:"Postal Code",   ph:"100001"        },
  { code:"PK", flag:"🇵🇰", name:"Pakistan",         label:"Postal Code",   ph:"75500"         },
  { code:"BD", flag:"🇧🇩", name:"Bangladesh",       label:"Postal Code",   ph:"1000"          },
  { code:"NL", flag:"🇳🇱", name:"Netherlands",      label:"Postcode",      ph:"1011 AB"       },
  { code:"IT", flag:"🇮🇹", name:"Italy",            label:"CAP",           ph:"00100"         },
  { code:"ES", flag:"🇪🇸", name:"Spain",            label:"C.P.",          ph:"28001"         },
  { code:"KR", flag:"🇰🇷", name:"South Korea",      label:"우편번호",        ph:"03000"         },
  { code:"CN", flag:"🇨🇳", name:"China",            label:"邮编",           ph:"100000"        },
  { code:"ID", flag:"🇮🇩", name:"Indonesia",        label:"Kode Pos",      ph:"10110"         },
  { code:"TH", flag:"🇹🇭", name:"Thailand",         label:"Postal Code",   ph:"10100"         },
  { code:"MY", flag:"🇲🇾", name:"Malaysia",         label:"Poskod",        ph:"50000"         },
  { code:"PH", flag:"🇵🇭", name:"Philippines",      label:"ZIP Code",      ph:"1000"          },
  { code:"LK", flag:"🇱🇰", name:"Sri Lanka",        label:"Postal Code",   ph:"10350"         },
  { code:"NP", flag:"🇳🇵", name:"Nepal",            label:"Postal Code",   ph:"44600"         },
  { code:"SE", flag:"🇸🇪", name:"Sweden",           label:"Postnummer",    ph:"111 20"        },
  { code:"NO", flag:"🇳🇴", name:"Norway",           label:"Postnummer",    ph:"0010"          },
  { code:"OTHER", flag:"🌍", name:"Other",           label:"Postal Code",   ph:"Enter code"    },
];

const CAT_GROUPS = [
  { group:"🍽 Food & Drink", cats:[
    { id:"street_food", label:"Street Food",     icon:"🍢", color:"#FF6B35", bg:"#2A1200" },
    { id:"restaurant",  label:"Restaurant",       icon:"🍽",  color:"#FF3B6B", bg:"#280010" },
    { id:"cafe",        label:"Café / Coffee",    icon:"☕", color:"#E8A838", bg:"#241800" },
    { id:"bar_pub",     label:"Bar / Pub",        icon:"🍺", color:"#BF5AF2", bg:"#1A0028" },
    { id:"bakery",      label:"Bakery",           icon:"🥐", color:"#FF9500", bg:"#2A1800" },
    { id:"fast_food",   label:"Fast Food",        icon:"🍔", color:"#FF6B35", bg:"#2A1000" },
    { id:"food_stall",  label:"Food Stall/Truck", icon:"🍜", color:"#32D74B", bg:"#001A07" },
  ]},
  { group:"🛍 Shopping", cats:[
    { id:"local_shop",  label:"Local Shop",       icon:"🛍",  color:"#3B9EFF", bg:"#001A2E" },
    { id:"market",      label:"Market / Bazaar",  icon:"🏪", color:"#E8A838", bg:"#241800" },
    { id:"supermarket", label:"Supermarket",      icon:"🛒", color:"#32D74B", bg:"#001A07" },
    { id:"pharmacy",    label:"Pharmacy",         icon:"💊", color:"#FF3B6B", bg:"#280010" },
    { id:"electronics", label:"Electronics",      icon:"📱", color:"#3B9EFF", bg:"#001A2E" },
    { id:"clothing",    label:"Clothing",         icon:"👗", color:"#BF5AF2", bg:"#1A0028" },
    { id:"grocery",     label:"Grocery Store",    icon:"🧺", color:"#32D74B", bg:"#001A07" },
  ]},
  { group:"🏥 Health & Wellness", cats:[
    { id:"gym",         label:"Gym / Fitness",    icon:"🏋", color:"#32D74B", bg:"#001A07" },
    { id:"hospital",    label:"Hospital",         icon:"🏥", color:"#FF453A", bg:"#280000" },
    { id:"clinic",      label:"Clinic / Doctor",  icon:"🩺", color:"#3B9EFF", bg:"#001A2E" },
    { id:"dental",      label:"Dental",           icon:"🦷", color:"#98989E", bg:"#1A1A1A" },
    { id:"barbershop",  label:"Barber / Salon",   icon:"💇", color:"#BF5AF2", bg:"#1A0028" },
    { id:"spa",         label:"Spa / Wellness",   icon:"💆", color:"#E8A838", bg:"#241800" },
    { id:"medical_store",label:"Medical Store",   icon:"🏪", color:"#FF3B6B", bg:"#280010" },
  ]},
  { group:"🎓 Education", cats:[
    { id:"school",      label:"School",           icon:"🏫", color:"#3B9EFF", bg:"#001A2E" },
    { id:"college",     label:"College / Uni",    icon:"🎓", color:"#BF5AF2", bg:"#1A0028" },
    { id:"library",     label:"Library",          icon:"📚", color:"#E8A838", bg:"#241800" },
    { id:"coaching",    label:"Coaching / Tutor", icon:"✏️", color:"#32D74B", bg:"#001A07" },
    { id:"preschool",   label:"Preschool",        icon:"🧒", color:"#FF9500", bg:"#2A1800" },
  ]},
  { group:"🔧 Services", cats:[
    { id:"repair",      label:"Repair Shop",      icon:"🔧", color:"#98989E", bg:"#1A1A1A" },
    { id:"auto",        label:"Auto / Garage",    icon:"🚗", color:"#FF6B35", bg:"#2A1000" },
    { id:"bank",        label:"Bank / ATM",       icon:"🏦", color:"#32D74B", bg:"#001A07" },
    { id:"petrol",      label:"Petrol / Gas",     icon:"⛽", color:"#FF9500", bg:"#2A1800" },
    { id:"laundry",     label:"Laundry",          icon:"👔", color:"#3B9EFF", bg:"#001A2E" },
    { id:"post",        label:"Post Office",      icon:"📮", color:"#E8A838", bg:"#241800" },
    { id:"tailoring",   label:"Tailoring",        icon:"🪡", color:"#BF5AF2", bg:"#1A0028" },
  ]},
  { group:"🎬 Lifestyle & Recreation", cats:[
    { id:"hotel",       label:"Hotel / Stay",     icon:"🏨", color:"#E8A838", bg:"#241800" },
    { id:"park",        label:"Park / Garden",    icon:"🌳", color:"#32D74B", bg:"#001A07" },
    { id:"cinema",      label:"Cinema",           icon:"🎬", color:"#BF5AF2", bg:"#1A0028" },
    { id:"cowork",      label:"Co-working",       icon:"💻", color:"#3B9EFF", bg:"#001A2E" },
    { id:"religious",   label:"Religious Place",  icon:"⛪", color:"#E8A838", bg:"#241800" },
    { id:"sports",      label:"Sports / Stadium", icon:"⚽", color:"#32D74B", bg:"#001A07" },
    { id:"nightclub",   label:"Club / Nightlife", icon:"🪩", color:"#BF5AF2", bg:"#1A0028" },
  ]},
  { group:"📍 Other", cats:[
    { id:"other",       label:"Other",            icon:"📍", color:"#98989E", bg:"#1A1A1A" },
  ]},
];

const ALL_CATS = CAT_GROUPS.flatMap(g => g.cats);

const SOCIAL = [
  { id:"google",   label:"Google",      textColor:"#F0EFE8", bg:"#1E1E1E", border:"#333",    icon:"G"  },
  { id:"facebook", label:"Facebook",    textColor:"#F0EFE8", bg:"#1877F2", border:"#1877F2", icon:"f"  },
  { id:"instagram",label:"Instagram",   textColor:"#F0EFE8", bg:"#C13584", border:"#C13584", icon:"◈"  },
  { id:"github",   label:"GitHub",      textColor:"#0C0C0C", bg:"#F0EFE8", border:"#F0EFE8", icon:"⌥"  },
  { id:"twitter",  label:"X / Twitter", textColor:"#F0EFE8", bg:"#000",    border:"#333",    icon:"✕"  },
];

const INIT_FORM = { placeName:"", category:"", rating:0, recommend:null, review:"", postalCode:"", countryCode:"IN", videoUrl:"" };

// ── utils ──
function ratingColor(r) { return r>=4?"#32D74B":r>=3?"#E8A838":"#FF453A"; }
function catInfo(id)     { return ALL_CATS.find(c=>c.id===id)||ALL_CATS[ALL_CATS.length-1]; }
function countryInfo(code){ return COUNTRIES.find(c=>c.code===code)||COUNTRIES[COUNTRIES.length-1]; }
function timeAgo(ts)     {
  const d=Math.floor((Date.now()-ts)/86400000);
  if(d===0) return "today"; if(d===1) return "yesterday";
  if(d<7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined,{day:"numeric",month:"short"});
}
function getYtId(url) {
  const m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m?m[1]:null;
}
async function compressImage(file) {
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=520, ratio=Math.min(MAX/img.width,MAX/img.height,1);
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(img.width*ratio);
        canvas.height=Math.round(img.height*ratio);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.62));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Stars ──
function Stars({value,onChange,size=22,readonly}){
  const [h,setH]=useState(0);
  return(
    <div style={{display:"flex",gap:3}}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} onClick={()=>!readonly&&onChange?.(s)}
          onMouseEnter={()=>!readonly&&setH(s)} onMouseLeave={()=>!readonly&&setH(0)}
          style={{fontSize:size,lineHeight:1,cursor:readonly?"default":"pointer",
            color:s<=(h||value)?"#FF9500":"#2A2A2A",transition:"color 0.1s,transform 0.12s",
            transform:!readonly&&s<=h?"scale(1.25)":"scale(1)",display:"inline-block"}}>★</span>
      ))}
    </div>
  );
}

// ── CatChip ──
function CatChip({id,selected,onClick}){
  const c=catInfo(id);
  return(
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",
      borderRadius:99,border:selected?`1.5px solid ${c.color}`:"1.5px solid #222",
      background:selected?c.bg:"transparent",color:selected?c.color:"#666",cursor:"pointer",
      fontSize:12,fontFamily:"'Outfit',sans-serif",fontWeight:selected?600:400,
      transition:"all 0.15s",whiteSpace:"nowrap"}}>
      <span style={{fontSize:13}}>{c.icon}</span>{c.label}
    </button>
  );
}

// ── ReviewCard ──
function ReviewCard({r,onDelete}){
  const [images,setImages]=useState([]);
  const [activeImg,setActiveImg]=useState(null);
  const [exp,setExp]=useState(false);
  const cat=catInfo(r.category);
  const rc=ratingColor(r.rating);
  const cn=countryInfo(r.countryCode||"OTHER");
  const ytId=r.videoUrl?getYtId(r.videoUrl):null;

  useEffect(()=>{
    if(!r.imageCount)return;
    (async()=>{
      const imgs=[];
      for(let i=0;i<r.imageCount;i++){
        try{ const res=await window.storage.get(`img_${r.id}_${i}`); if(res)imgs.push(res.value); }catch(_){}
      }
      setImages(imgs);
    })();
  },[r.id,r.imageCount]);

  return(
    <div style={{background:"#141414",borderRadius:16,border:"1px solid #1E1E1E",overflow:"hidden"}}>
      <div style={{height:3,background:rc}}/>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div>
            <p style={{margin:0,fontSize:16,fontWeight:600,color:"#F0EFE8",fontFamily:"'Outfit',sans-serif",lineHeight:1.2}}>{r.placeName}</p>
            <p style={{margin:"3px 0 0",fontSize:12,color:"#555",fontFamily:"'Outfit',sans-serif"}}>
              {cn.flag} {r.postalCode} · {timeAgo(r.createdAt)}
            </p>
          </div>
          <span style={{padding:"4px 10px",borderRadius:99,background:cat.bg,color:cat.color,
            fontSize:12,fontWeight:600,border:`1px solid ${cat.color}33`,whiteSpace:"nowrap",
            fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{cat.icon} {cat.label}</span>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:24,fontWeight:800,color:rc,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{r.rating}.0</span>
            <Stars value={r.rating} size={13} readonly/>
          </div>
          {r.recommend!==null&&(
            <span style={{padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:600,
              background:r.recommend?"#00280E":"#280000",color:r.recommend?"#32D74B":"#FF453A",
              border:`1px solid ${r.recommend?"#32D74B33":"#FF453A33"}`,fontFamily:"'Outfit',sans-serif"}}>
              {r.recommend?"✓ Recommend":"✗ Avoid"}
            </span>
          )}
        </div>

        {r.review&&(
          <p style={{margin:0,fontSize:14,color:"#888",lineHeight:1.65,fontFamily:"'Outfit',sans-serif"}}>
            {r.review.length>130&&!exp?r.review.slice(0,130)+"…":r.review}
            {r.review.length>130&&(
              <button onClick={()=>setExp(!exp)} style={{background:"none",border:"none",
                color:"#FF9500",fontSize:13,cursor:"pointer",padding:"0 0 0 5px",
                fontFamily:"'Outfit',sans-serif"}}>{exp?"less":"read more"}</button>
            )}
          </p>
        )}

        {images.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
              {images.map((img,i)=>(
                <img key={i} src={img} alt="" onClick={()=>setActiveImg(activeImg===i?null:i)}
                  style={{height:76,width:76,objectFit:"cover",borderRadius:8,
                    cursor:"pointer",flexShrink:0,border:"1px solid #2A2A2A",
                    outline:activeImg===i?"2px solid #FF9500":"none"}}/>
              ))}
            </div>
            {activeImg!==null&&images[activeImg]&&(
              <div style={{borderRadius:10,overflow:"hidden"}}>
                <img src={images[activeImg]} alt=""
                  style={{width:"100%",maxHeight:260,objectFit:"cover",display:"block"}}/>
              </div>
            )}
          </div>
        )}

        {r.videoUrl&&(
          <div style={{borderRadius:10,overflow:"hidden"}}>
            {ytId?(
              <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}>
                <iframe src={`https://www.youtube.com/embed/${ytId}`}
                  style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  allowFullScreen/>
              </div>
            ):(
              <a href={r.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                display:"inline-flex",alignItems:"center",gap:6,color:"#FF9500",
                fontSize:13,textDecoration:"none",fontFamily:"'Outfit',sans-serif",
                background:"#2A1800",padding:"8px 12px",borderRadius:8,
                border:"1px solid #FF950033"}}>🎥 Watch video →</a>
            )}
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          borderTop:"1px solid #1E1E1E",paddingTop:10}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:22,height:22,borderRadius:99,background:"#FF9500",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,fontWeight:700,color:"#0C0C0C"}}>
              {(r.author||"A")[0].toUpperCase()}
            </div>
            <span style={{fontSize:12,color:"#555",fontFamily:"'Outfit',sans-serif"}}>{r.author||"Anonymous"}</span>
          </div>
          <button onClick={()=>onDelete(r.id)} style={{background:"none",border:"none",color:"#333",
            fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>remove</button>
        </div>
      </div>
    </div>
  );
}

// ── ImageUploadRow ──
function ImageUploadRow({images,setImages}){
  const ref=useRef();
  async function handleFiles(e){
    const files=Array.from(e.target.files).slice(0,3-images.length);
    const compressed=await Promise.all(files.map(compressImage));
    setImages(prev=>[...prev,...compressed].slice(0,3));
    e.target.value="";
  }
  return(
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <input type="file" accept="image/*" multiple ref={ref} style={{display:"none"}} onChange={handleFiles}/>
      {images.map((img,i)=>(
        <div key={i} style={{position:"relative",width:72,height:72}}>
          <img src={img} alt="" style={{width:72,height:72,objectFit:"cover",borderRadius:10,
            border:"1px solid #2A2A2A",display:"block"}}/>
          <button onClick={()=>setImages(prev=>prev.filter((_,j)=>j!==i))}
            style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:99,
              background:"#FF453A",border:"none",color:"#fff",fontSize:12,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
        </div>
      ))}
      {images.length<3&&(
        <button onClick={()=>ref.current?.click()} style={{width:72,height:72,borderRadius:10,
          border:"1.5px dashed #333",background:"#141414",color:"#555",cursor:"pointer",
          fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",
          flexDirection:"column",gap:2}}>
          <span style={{fontSize:22,lineHeight:1}}>+</span>
          <span style={{fontSize:9,color:"#444",fontFamily:"'Outfit',sans-serif"}}>photo</span>
        </button>
      )}
    </div>
  );
}

// ── Main App ──
export default function App(){
  const [user,setUser]                 = useState(null);
  const [authStep,setAuthStep]         = useState("splash");
  const [authProvider,setAuthProvider] = useState(null);
  const [nameInput,setNameInput]       = useState("");
  const [tab,setTab]                   = useState("home");
  const [reviews,setReviews]           = useState([]);
  const [browsePC,setBrowsePC]         = useState("");
  const [browseCo,setBrowseCo]         = useState("ALL");
  const [filterCat,setFilterCat]       = useState("all");
  const [form,setForm]                 = useState(INIT_FORM);
  const [uploadedImgs,setUploadedImgs] = useState([]);
  const [formErr,setFormErr]           = useState("");
  const [toastMsg,setToastMsg]         = useState("");
  const [homePC,setHomePC]             = useState("");
  const [loading,setLoading]           = useState(true);

  // Firebase auth — keeps user logged in across sessions
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (fu)=>{
      if(fu){
        setUser({ name: fu.displayName || fu.email || "User", provider:"google", uid: fu.uid });
      } else {
        try{ const g=localStorage.getItem("hoodrev_guest"); if(g) setUser(JSON.parse(g)); }catch(_){}
      }
      setLoading(false);
    });
    return ()=>unsub();
  },[]);

  // Firestore real-time reviews — all users see the same reviews instantly
  useEffect(()=>{
    const q = query(collection(db,"reviews"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, (snap)=>{
      setReviews(snap.docs.map(d=>({ ...d.data(), id: d.id })));
    }, ()=>{});
    return ()=>unsub();
  },[]);

  function toast(msg){ setToastMsg(msg); setTimeout(()=>setToastMsg(""),2800); }

  async function pickProvider(pid){
    if(pid==="google"){
      try{
        await signInWithPopup(auth, googleProvider);
        toast("Welcome! 🔥");
      } catch(e){
        if(e.code!=="auth/popup-closed-by-user") toast("Sign-in failed, try again.");
      }
    } else {
      setAuthProvider(pid); setAuthStep("name");
    }
  }

  function confirmName(){
    if(!nameInput.trim())return;
    const u={name:nameInput.trim(),provider:authProvider||"guest"};
    setUser(u);
    try{ localStorage.setItem("hoodrev_guest", JSON.stringify(u)); }catch(_){}
    setAuthStep("splash"); setNameInput(""); toast(`Welcome, ${u.name}! 🔥`);
  }

  function logout(){
    if(user?.provider==="google"){ signOut(auth); }
    else { try{ localStorage.removeItem("hoodrev_guest"); }catch(_){} }
    setUser(null); setTab("home");
  }

  async function deleteReview(id){
    const r=reviews.find(rv=>rv.id===id);
    if(r?.imageCount){ for(let i=0;i<r.imageCount;i++) try{ await window.storage.delete(`img_${id}_${i}`); }catch(_){} }
    try{ await deleteDoc(doc(db,"reviews",id)); }catch(_){}
  }

  async function submitReview(){
    if(!form.placeName.trim())  return setFormErr("Give the place a name.");
    if(!form.category)          return setFormErr("Pick a category.");
    if(!form.rating)            return setFormErr("Star rating required.");
    if(!form.postalCode.trim()) return setFormErr("Enter your postal/ZIP code.");
    setFormErr("");
    const id=Date.now().toString();
    const nr={...form,id,createdAt:Date.now(),author:user?.name||"You",imageCount:uploadedImgs.length};
    for(let i=0;i<uploadedImgs.length;i++) try{ await window.storage.set(`img_${id}_${i}`,uploadedImgs[i]); }catch(_){}
    try{ await setDoc(doc(db,"reviews",id), nr); }catch(_){}
    setForm(INIT_FORM); setUploadedImgs([]);
    setBrowsePC(form.postalCode); setBrowseCo(form.countryCode);
    setTab("browse"); toast("Review posted! 🔥");
  }

  const pcMap={};
  reviews.forEach(r=>{ const key=`${r.countryCode||"?"}::${r.postalCode}`; pcMap[key]=(pcMap[key]||0)+1; });
  const topAreas=Object.entries(pcMap).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const filteredReviews=reviews.filter(r=>{
    const pc = browsePC  ? r.postalCode===browsePC       : true;
    const co = browseCo!=="ALL" ? (r.countryCode||"OTHER")===browseCo : true;
    const cat= filterCat!=="all" ? r.category===filterCat : true;
    return pc&&co&&cat;
  });

  const base={background:"#0C0C0C",minHeight:"100vh",fontFamily:"'Outfit',sans-serif",
    color:"#F0EFE8",maxWidth:480,margin:"0 auto"};

  if(loading) return <div style={{...base,display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
    <span style={{color:"#333",fontSize:13}}>Loading…</span>
  </div>;

  // ── AUTH SCREEN ──
  if(!user) return(
    <>
      <FontLink/>
      <div style={{...base,padding:"0 0 48px"}}>
        <div style={{padding:"56px 28px 32px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",
            background:"radial-gradient(circle,#FF950018 0%,transparent 65%)",pointerEvents:"none"}}/>
          <div style={{display:"inline-block",padding:"4px 12px",background:"#FF950015",
            border:"1px solid #FF950033",borderRadius:99,marginBottom:18}}>
            <span style={{fontSize:11,color:"#FF9500",letterSpacing:"0.15em",
              fontWeight:600,textTransform:"uppercase"}}>Global · Hyperlocal · Free</span>
          </div>
          <h1 style={{margin:"0 0 6px",fontSize:60,fontFamily:"'Syne',sans-serif",fontWeight:800,
            lineHeight:0.9,letterSpacing:"-3px",color:"#F0EFE8"}}>HOOD<br/>
            <span style={{color:"#FF9500"}}>★ REV</span>
          </h1>
          <p style={{margin:"20px 0 0",fontSize:15,color:"#555",lineHeight:1.65,maxWidth:300}}>
            Street food, gyms, schools, hospitals, shops — reviewed honestly by real people, everywhere on Earth.
          </p>
        </div>

        {reviews.length>0&&(
          <div style={{padding:"0 28px 24px",display:"flex",gap:10}}>
            {[{n:reviews.length,l:"reviews"},{n:Object.keys(pcMap).length,l:"areas covered"}].map(({n,l})=>(
              <div key={l} style={{flex:1,background:"#141414",border:"1px solid #1E1E1E",
                borderRadius:12,padding:"12px 16px"}}>
                <p style={{margin:0,fontSize:26,fontWeight:800,color:"#FF9500",fontFamily:"'Syne',sans-serif"}}>{n}</p>
                <p style={{margin:0,fontSize:12,color:"#555"}}>{l}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{padding:"0 28px",display:"flex",flexDirection:"column"}}>
          {authStep==="splash"&&(
            <>
              <p style={{margin:"0 0 14px",fontSize:13,color:"#444"}}>Sign in to post reviews</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {SOCIAL.map(p=>(
                  <button key={p.id} onClick={()=>pickProvider(p.id)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                      padding:"13px 20px",borderRadius:12,border:`1.5px solid ${p.border}`,
                      background:p.bg,color:p.textColor,cursor:"pointer",fontSize:14,fontWeight:500,
                      fontFamily:"'Outfit',sans-serif",transition:"opacity 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.82"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <span style={{fontSize:16,fontWeight:800,width:22,textAlign:"center",fontFamily:"monospace"}}>{p.icon}</span>
                    Continue with {p.label}
                  </button>
                ))}
              </div>
              <button onClick={()=>{setUser({name:"Guest",provider:"guest"});toast("Browsing as guest 👀");}}
                style={{background:"none",border:"none",color:"#444",fontSize:13,
                  cursor:"pointer",marginTop:20,fontFamily:"'Outfit',sans-serif",padding:0}}>
                Just browse (no account) →
              </button>
            </>
          )}
          {authStep==="name"&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <p style={{margin:"0 0 4px",fontSize:15,color:"#999"}}>What should we call you?</p>
              <input type="text" placeholder="Your display name" value={nameInput}
                onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&confirmName()}
                autoFocus style={{background:"#141414",border:"1px solid #333",borderRadius:10,
                  padding:"13px 16px",fontSize:16,color:"#F0EFE8",fontFamily:"'Outfit',sans-serif",
                  outline:"none",width:"100%",boxSizing:"border-box"}}/>
              <button onClick={confirmName} disabled={!nameInput.trim()} style={{
                padding:"13px",borderRadius:12,border:"none",
                background:nameInput.trim()?"#FF9500":"#1E1E1E",
                color:nameInput.trim()?"#0C0C0C":"#444",fontSize:14,fontWeight:800,
                cursor:nameInput.trim()?"pointer":"default",fontFamily:"'Syne',sans-serif",
                letterSpacing:"0.03em"}}>LET'S GO →</button>
              <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",
                color:"#444",fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",padding:0}}>← Back</button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ── MAIN APP ──
  const cn = countryInfo(form.countryCode);

  return(
    <>
      <FontLink/>
      {toastMsg&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",
          background:"#1A1A1A",border:"1px solid #2A2A2A",borderRadius:10,
          padding:"10px 18px",fontSize:13,color:"#F0EFE8",zIndex:999,
          whiteSpace:"nowrap",fontFamily:"'Outfit',sans-serif"}}>
          {toastMsg}
        </div>
      )}

      <div style={{...base,paddingBottom:80}}>
        {/* top bar */}
        <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",
          justifyContent:"space-between",position:"sticky",top:0,
          background:"#0C0C0Cdd",backdropFilter:"blur(12px)",
          borderBottom:"1px solid #181818",zIndex:10}}>
          <span style={{fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",
            letterSpacing:"-0.5px",color:"#F0EFE8"}}>HOOD <span style={{color:"#FF9500"}}>★</span></span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:"#444"}}>{user.name}</span>
            <div onClick={logout} title="Tap to sign out" style={{width:32,height:32,borderRadius:99,
              background:"#FF9500",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13,fontWeight:700,color:"#0C0C0C",cursor:"pointer"}}>
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── HOME ── */}
        {tab==="home"&&(
          <div style={{padding:"22px 20px 0"}}>
            <p style={{margin:"0 0 2px",fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#F0EFE8"}}>
              Yo, {user.name.split(" ")[0]} 👋
            </p>
            <p style={{margin:"0 0 22px",fontSize:14,color:"#555"}}>
              What's the word in your area today?
            </p>

            {/* search */}
            <div style={{display:"flex",gap:8,marginBottom:22}}>
              <input type="text" placeholder="Search postal/ZIP code…" value={homePC}
                onChange={e=>setHomePC(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&homePC.trim()){setBrowsePC(homePC);setBrowseCo("ALL");setTab("browse");}}}
                style={{flex:1,background:"#141414",border:"1px solid #222",borderRadius:12,
                  padding:"12px 16px",fontSize:15,color:"#F0EFE8",fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
              <button onClick={()=>{if(homePC.trim()){setBrowsePC(homePC);setBrowseCo("ALL");setTab("browse");}}}
                style={{padding:"0 18px",borderRadius:12,border:"none",
                  background:homePC.trim()?"#FF9500":"#1A1A1A",
                  color:homePC.trim()?"#0C0C0C":"#444",fontSize:14,fontWeight:800,
                  cursor:homePC.trim()?"pointer":"default",fontFamily:"'Syne',sans-serif"}}>GO</button>
            </div>

            {/* stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:26}}>
              {[{n:reviews.length,l:"Reviews"},{n:Object.keys(pcMap).length,l:"Areas"},{n:reviews.filter(r=>r.recommend).length,l:"Hot picks"}].map(({n,l})=>(
                <div key={l} style={{background:"#141414",border:"1px solid #1E1E1E",
                  borderRadius:12,padding:"12px",textAlign:"center"}}>
                  <p style={{margin:0,fontSize:26,fontWeight:800,color:"#FF9500",fontFamily:"'Syne',sans-serif"}}>{n}</p>
                  <p style={{margin:0,fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:"0.08em"}}>{l}</p>
                </div>
              ))}
            </div>

            {/* top areas */}
            {topAreas.length>0&&(
              <div style={{marginBottom:26}}>
                <p style={{margin:"0 0 10px",fontSize:11,color:"#444",letterSpacing:"0.12em",
                  textTransform:"uppercase",fontWeight:600}}>🔥 Active areas worldwide</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {topAreas.map(([key,cnt])=>{
                    const [co,pc]=key.split("::");
                    const c=countryInfo(co);
                    return(
                      <button key={key} onClick={()=>{setBrowsePC(pc);setBrowseCo(co);setTab("browse");}}
                        style={{background:"#141414",border:"1px solid #222",borderRadius:99,
                          padding:"7px 12px",color:"#F0EFE8",cursor:"pointer",
                          fontSize:13,fontFamily:"'Outfit',sans-serif",
                          display:"flex",alignItems:"center",gap:6}}>
                        <span>{c.flag}</span>
                        <span style={{fontWeight:600}}>{pc}</span>
                        <span style={{background:"#FF950022",color:"#FF9500",
                          padding:"1px 7px",borderRadius:99,fontSize:11}}>{cnt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* recent */}
            {reviews.length>0?(
              <>
                <p style={{margin:"0 0 10px",fontSize:11,color:"#444",letterSpacing:"0.12em",
                  textTransform:"uppercase",fontWeight:600}}>Recent activity</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {reviews.slice(0,3).map(r=><ReviewCard key={r.id} r={r} onDelete={deleteReview}/>)}
                  {reviews.length>3&&(
                    <button onClick={()=>{setBrowsePC("");setBrowseCo("ALL");setTab("browse");}}
                      style={{background:"#141414",border:"1px solid #222",borderRadius:12,
                        padding:"12px",color:"#FF9500",cursor:"pointer",
                        fontSize:14,fontFamily:"'Outfit',sans-serif",fontWeight:500}}>
                      View all {reviews.length} reviews →
                    </button>
                  )}
                </div>
              </>
            ):(
              <div style={{background:"#141414",border:"1px dashed #222",borderRadius:16,
                padding:"36px 24px",textAlign:"center"}}>
                <p style={{margin:"0 0 8px",fontSize:36}}>🌍</p>
                <p style={{margin:"0 0 6px",fontSize:16,fontWeight:600,color:"#F0EFE8",fontFamily:"'Syne',sans-serif"}}>No reviews yet</p>
                <p style={{margin:"0 0 18px",fontSize:13,color:"#555"}}>
                  Drop the first review — anywhere on Earth.
                </p>
                <button onClick={()=>setTab("write")} style={{background:"#FF9500",color:"#0C0C0C",
                  border:"none",borderRadius:10,padding:"10px 22px",
                  fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>
                  WRITE FIRST →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE ── */}
        {tab==="browse"&&(
          <div style={{padding:"20px 20px 0"}}>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <select value={browseCo} onChange={e=>setBrowseCo(e.target.value)}
                style={{background:"#141414",border:"1px solid #222",borderRadius:10,
                  padding:"10px 10px",fontSize:14,color:"#F0EFE8",
                  fontFamily:"'Outfit',sans-serif",outline:"none",minWidth:0}}>
                <option value="ALL">🌍 All countries</option>
                {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
              <input type="text" placeholder="Postal code" value={browsePC}
                onChange={e=>setBrowsePC(e.target.value)}
                style={{flex:1,background:"#141414",border:"1px solid #222",borderRadius:10,
                  padding:"10px 14px",fontSize:15,color:"#F0EFE8",fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
              {(browsePC||browseCo!=="ALL")&&(
                <button onClick={()=>{setBrowsePC("");setBrowseCo("ALL");}}
                  style={{background:"#1A1A1A",border:"1px solid #222",borderRadius:10,
                    padding:"0 12px",color:"#666",cursor:"pointer",fontSize:14,
                    fontFamily:"'Outfit',sans-serif"}}>✕</button>
              )}
            </div>

            {/* category filter */}
            <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:6,
              marginBottom:14,scrollbarWidth:"none"}}>
              <button onClick={()=>setFilterCat("all")} style={{padding:"6px 14px",borderRadius:99,cursor:"pointer",
                border:filterCat==="all"?"1.5px solid #FF9500":"1.5px solid #222",
                background:filterCat==="all"?"#2A1800":"transparent",
                color:filterCat==="all"?"#FF9500":"#666",fontSize:13,whiteSpace:"nowrap",
                fontFamily:"'Outfit',sans-serif",fontWeight:filterCat==="all"?600:400}}>All</button>
              {ALL_CATS.map(c=>(
                <CatChip key={c.id} id={c.id} selected={filterCat===c.id}
                  onClick={()=>setFilterCat(c.id)}/>
              ))}
            </div>

            <p style={{margin:"0 0 12px",fontSize:12,color:"#444"}}>
              {filteredReviews.length} review{filteredReviews.length!==1?"s":""}
              {browsePC?` · ${browsePC}`:""}
              {browseCo!=="ALL"?` · ${countryInfo(browseCo).flag} ${countryInfo(browseCo).name}`:""}
            </p>

            {filteredReviews.length===0?(
              <div style={{background:"#141414",border:"1px dashed #222",borderRadius:16,
                padding:"36px 24px",textAlign:"center"}}>
                <p style={{margin:"0 0 6px",fontSize:30}}>🔍</p>
                <p style={{margin:"0 0 6px",fontSize:15,fontWeight:600,color:"#F0EFE8",fontFamily:"'Syne',sans-serif"}}>Nothing found</p>
                <p style={{margin:"0 0 18px",fontSize:13,color:"#555"}}>Be the first to review this area.</p>
                <button onClick={()=>{setForm({...INIT_FORM,postalCode:browsePC});setTab("write");}}
                  style={{background:"#FF9500",color:"#0C0C0C",border:"none",borderRadius:10,
                    padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>
                  BE THE FIRST
                </button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filteredReviews.map(r=><ReviewCard key={r.id} r={r} onDelete={deleteReview}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── WRITE ── */}
        {tab==="write"&&(
          <div style={{padding:"20px 20px 0"}}>
            <h2 style={{margin:"0 0 6px",fontSize:26,fontFamily:"'Syne',sans-serif",
              fontWeight:800,color:"#F0EFE8",letterSpacing:"-0.5px"}}>
              Drop a <span style={{color:"#FF9500"}}>review</span>
            </h2>
            <p style={{margin:"0 0 22px",fontSize:12,color:"#444",lineHeight:1.5}}>
              🔓 Free speech — say what you actually think. Be honest, be real.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:20}}>

              {/* LOCATION FIRST */}
              <div style={{background:"#141414",border:"1px solid #1E1E1E",borderRadius:14,padding:"14px"}}>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Location *</label>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <select value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value,postalCode:""})}
                    style={{background:"#0C0C0C",border:"1px solid #2A2A2A",borderRadius:10,
                      padding:"11px 12px",fontSize:14,color:"#F0EFE8",
                      fontFamily:"'Outfit',sans-serif",outline:"none",width:"100%"}}>
                    {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.flag}  {c.name}</option>)}
                  </select>
                  <input type="text" placeholder={cn.ph} value={form.postalCode}
                    onChange={e=>setForm({...form,postalCode:e.target.value})}
                    style={{background:"#0C0C0C",border:"1px solid #2A2A2A",borderRadius:10,
                      padding:"11px 12px",fontSize:15,letterSpacing:"0.05em",color:"#F0EFE8",
                      fontFamily:"'Outfit',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
                  <p style={{margin:0,fontSize:11,color:"#444"}}>{cn.flag} {cn.name} · Enter your {cn.label.toLowerCase()}</p>
                </div>
              </div>

              {/* PLACE NAME */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Place Name *</label>
                <div style={{display:"flex",gap:8}}>
                  <input type="text" placeholder="e.g. Planet Fitness, Westfield Mall, St. Mary's Hospital…"
                    value={form.placeName} onChange={e=>setForm({...form,placeName:e.target.value})}
                    style={{flex:1,background:"#141414",border:"1px solid #222",borderRadius:10,
                      padding:"12px 14px",fontSize:15,color:"#F0EFE8",
                      fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
                  {form.placeName.trim()&&(
                    <button onClick={()=>{
                      const q=encodeURIComponent(`${form.placeName} ${form.postalCode} ${cn.name}`);
                      window.open(`https://www.google.com/maps/search/${q}`,"_blank");
                    }} title="Search on Google Maps"
                      style={{padding:"0 12px",background:"#141414",border:"1px solid #333",
                        borderRadius:10,cursor:"pointer",fontSize:16,color:"#888",
                        transition:"color 0.15s",whiteSpace:"nowrap"}}>🗺</button>
                  )}
                </div>
                {form.placeName.trim()&&(
                  <p style={{margin:"6px 0 0",fontSize:11,color:"#555"}}>
                    Tap 🗺 to verify the location on Google Maps
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Category *</label>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {CAT_GROUPS.map(grp=>(
                    <div key={grp.group}>
                      <p style={{margin:"0 0 7px",fontSize:11,color:"#555",fontWeight:600}}>{grp.group}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {grp.cats.map(c=>(
                          <CatChip key={c.id} id={c.id} selected={form.category===c.id}
                            onClick={()=>setForm({...form,category:c.id})}/>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RATING */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Rating *</label>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <Stars value={form.rating} onChange={v=>setForm({...form,rating:v})} size={30}/>
                  {form.rating>0&&(
                    <span style={{fontSize:30,fontWeight:800,fontFamily:"'Syne',sans-serif",
                      color:ratingColor(form.rating)}}>{form.rating}.0</span>
                  )}
                </div>
              </div>

              {/* RECOMMEND */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Would you recommend it?</label>
                <div style={{display:"flex",gap:10}}>
                  {[{v:true,l:"Yes, go for it!"},{v:false,l:"Nah, skip it"}].map(({v,l})=>(
                    <button key={String(v)} onClick={()=>setForm({...form,recommend:v})} style={{
                      flex:1,padding:"11px",borderRadius:10,cursor:"pointer",
                      border:form.recommend===v?`1.5px solid ${v?"#32D74B":"#FF453A"}`:"1.5px solid #222",
                      background:form.recommend===v?(v?"#00280E":"#280000"):"#141414",
                      color:form.recommend===v?(v?"#32D74B":"#FF453A"):"#555",
                      fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",transition:"all 0.15s"}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* REVIEW TEXT */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Your take</label>
                <textarea placeholder="What'd you get? Was it worth it? Staff behaviour? Cleanliness? Anything people should know — say it."
                  value={form.review} onChange={e=>setForm({...form,review:e.target.value})} rows={5}
                  style={{width:"100%",boxSizing:"border-box",background:"#141414",border:"1px solid #222",
                    borderRadius:10,padding:"12px 14px",fontSize:14,color:"#F0EFE8",lineHeight:1.65,
                    fontFamily:"'Outfit',sans-serif",outline:"none",resize:"vertical"}}/>
              </div>

              {/* PHOTOS */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>
                  Photos <span style={{color:"#444",fontWeight:400,textTransform:"none"}}>(up to 3, auto-compressed)</span>
                </label>
                <ImageUploadRow images={uploadedImgs} setImages={setUploadedImgs}/>
              </div>

              {/* VIDEO URL */}
              <div>
                <label style={{display:"block",fontSize:11,color:"#555",letterSpacing:"0.12em",
                  textTransform:"uppercase",marginBottom:8,fontWeight:600}}>
                  Video URL <span style={{color:"#444",fontWeight:400,textTransform:"none"}}>(YouTube or any link)</span>
                </label>
                <input type="url" placeholder="https://youtube.com/watch?v=…"
                  value={form.videoUrl} onChange={e=>setForm({...form,videoUrl:e.target.value})}
                  style={{width:"100%",boxSizing:"border-box",background:"#141414",border:"1px solid #222",
                    borderRadius:10,padding:"12px 14px",fontSize:14,color:"#F0EFE8",
                    fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
                {form.videoUrl&&getYtId(form.videoUrl)&&(
                  <p style={{margin:"6px 0 0",fontSize:12,color:"#32D74B"}}>✓ YouTube detected — will embed in review</p>
                )}
              </div>

              {formErr&&<p style={{margin:0,fontSize:13,color:"#FF453A"}}>⚠ {formErr}</p>}

              <button onClick={submitReview}
                style={{padding:"14px",borderRadius:12,border:"none",background:"#FF9500",color:"#0C0C0C",
                  fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Syne',sans-serif",
                  letterSpacing:"0.05em",transition:"opacity 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                POST REVIEW 🔥
              </button>
            </div>
          </div>
        )}

        {/* ── BOTTOM NAV ── */}
        <div style={{position:"sticky",bottom:0,background:"#0C0C0Cee",backdropFilter:"blur(12px)",
          borderTop:"1px solid #181818",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
          padding:"8px 0 14px",marginTop:36}}>
          {[{id:"home",icon:"⌂",label:"Home"},{id:"browse",icon:"◉",label:"Browse"},{id:"write",icon:"+",label:"Review"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",
              color:tab===t.id?"#FF9500":"#444",transition:"color 0.15s"}}>
              <span style={{fontSize:t.id==="write"?20:18,lineHeight:1,
                background:t.id==="write"?(tab==="write"?"#FF9500":"#1A1A1A"):"none",
                color:t.id==="write"?(tab==="write"?"#0C0C0C":"#555"):"inherit",
                width:t.id==="write"?36:"auto",height:t.id==="write"?36:"auto",
                borderRadius:t.id==="write"?99:0,display:"flex",alignItems:"center",
                justifyContent:"center",border:t.id==="write"&&tab!=="write"?"1px solid #2A2A2A":"none"}}>
                {t.icon}
              </span>
              <span style={{fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",
                fontWeight:600,fontFamily:"'Outfit',sans-serif"}}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
