import { PersonOutline, SavingsOutlined, VolumeUpOutlined, ArrowRightOutlined, Close, AttachFile, Mail } from "@mui/icons-material";
import { useState, useEffect } from "react";
import useWindowDimensions from "../../../helper/dimension";
import { myEles, setTitle, appName, Mgin, LrText, BtnIcn, icony, IconBtn, ErrorCont, MyPieChart, hexToRgba, masterID, goUrl,CopyMan } from "../../../helper/general";
import { adminUserEle, annEle, partnerBasicinfo, partnerGeneralinfo, partnerHighlights, payStat } from "../../classes/models";
import { CircularProgress } from "@mui/material";
import Toast from "../../toast/toast";
import { getUserId, makeRequest, resHandler } from "../../../helper/requesthandler";
import { useLocation, useNavigate } from "react-router-dom";
import tabcard from "../../../assets/tabcard.png"
import { PoweredBySSS, getGreeting } from "../../../helper/schoolsilo";
import naira from "../../../assets/naira.png"





export function PartnerDashboard(mainprop:{pbi:partnerBasicinfo,pgi?:partnerGeneralinfo,}){
    const location = useLocation()
    const navigate = useNavigate()
    const mye = new myEles(false)
    const myKey = Date.now()
    const dimen = useWindowDimensions()
    const[anns,setAnns] = useState<annEle[]>([])
    const[hele,setHele] = useState<partnerHighlights>()

    useEffect(()=>{
        setTitle(`Partner Dashboard - ${appName}`)
        getHgl()
    },[])

    function handleError(task:resHandler){
        setLoad(false)
        setError(true)
        if(task.isLoggedOut()){
            navigate(`/adminLogin?rdr=${location.pathname.substring(1)}`)
        }else{
            toast(task.getErrorMsg(),0)
        }
    }

    function getHgl(){
        setError(false)
        getAnns()
        makeRequest.get(`getPartnerHighlights/${getUserId()}`,{},(task)=>{
            if(task.isSuccessful()){
                setHele(new partnerHighlights(task.getData()))
            }else{
                handleError(task)
            }
        })
    }

    function getAnns(){
        setError(false)
        makeRequest.get('getAnnouncements',{},(task)=>{
            if(task.isSuccessful()){
                const tem:annEle[] = []
                for(const key in task.getData()){
                    tem.push(new annEle(task.getData()[key]))
                }
                setAnns(tem)
            }else{
                handleError(task)
            }
        })
    }


    const[load, setLoad]=useState(false)
    const[loadMsg, setLoadMsg]=useState('Just a sec')
    const[error, setError]=useState(false)
    const[toastMeta, setToastMeta] = useState({visible: false,msg: "",action:2,invoked:0})
    const[timy, setTimy] = useState<{timer?:NodeJS.Timeout}>({timer:undefined});
    function toast(msg:string, action:number,delay?:number){
      var _delay = delay || 5000
      setToastMeta({
          action: action,
          msg: msg,
          visible:true,
          invoked: Date.now()
      })
      clearTimeout(timy.timer)
      setTimy({
          timer:setTimeout(()=>{
              if(Date.now()-toastMeta.invoked > 4000){
                  setToastMeta({
                      action:2,
                      msg:"",
                      visible:false,
                      invoked: 0
                  })
              }
          },_delay)
      });
    }

    return <div style={{
        width:'100%',
        boxSizing:'border-box',
        padding:dimen.dsk?40:20
    }}>
        <ErrorCont isNgt={false} visible={error} retry={()=>{
            setError(false)
            getHgl()
        }}/>
        <div className="prgcont" style={{display:load?"flex":"none"}}>
            <div className="hlc" style={{
                backgroundColor:mye.mycol.bkg,
                borderRadius:10,
                padding:20,
            }}>
                <CircularProgress style={{color:mye.mycol.primarycol}}/>
                <Mgin right={20} />
                <mye.Tv text={loadMsg} />
            </div>
        </div>
        <Toast isNgt={false} msg= {toastMeta.msg} action={toastMeta.action} visible={toastMeta.visible} canc={()=>{
                setToastMeta({
                    action:2,
                    msg:"",
                    visible:false,
                    invoked:0,
                })
            }} />
        <Mgin top={20} />
        <mye.BTv text={`Hello ${mainprop.pbi.getFirstName()}`} size={26} color={mye.mycol.primarycol} />
        <Mgin top={20} />
        <mye.Tv text={`Good ${getGreeting()}, welcome to your dashboard`} />
        <Mgin top={30} />
        <div style={{
            display:'flex',
            width:'100%',
            flexWrap:'wrap',
            alignItems:'center'
        }}>
            <Tab1 icon={PersonOutline} title="Customers" value={hele?hele.getTotalSchools():'...'} color={mye.mycol.green} />
            <Tab1  title="Commissions" value={hele?hele.getTotalCommissionsAmt():'...'} color={mye.mycol.green} />
            <Tab1  title="Partner Link" value={`https://portal.schoolsilo.cloud/schoolRegister/${mainprop.pbi.getPartnerID()}`} isLink color={mye.mycol.green} />
            <Tab1  title="Partner Code" value={mainprop.pbi.getPartnerID()} color={mye.mycol.green} />
        </div>
        <Mgin top={20} />
        <div id="lshdw" style={{
            width:'100%',
            padding:20,
            boxSizing:'border-box',
            backgroundColor:mye.mycol.bkg,
            borderRadius:10,
        }}>
            <div className="hlc">
                <VolumeUpOutlined style={{
                    color:mye.mycol.secondarycol,
                    fontSize:20
                }} />
                <Mgin right={10}/>
                <mye.HTv text="Announcement" size={16} color={mye.mycol.secondarycol} />
            </div>
            <Mgin top={20} />
            {
                anns.map((ann,index)=>{
                    return <AnnLay ele={ann} key={index+myKey+1} />
                })
            }
             <Mgin top={20} />
             <LrText 
             left={<div style={{
                display:'none'
             }} id="clk" className="hlc" onClick={()=>{

             }}>
                <mye.HTv text="View All" color={mye.mycol.primarycol} size={12} />
                <Mgin right={10} />
                <ArrowRightOutlined className="icon" />
             </div>}
             right={<div></div>}
             />
        </div>
        <PoweredBySSS />
    </div>

    function AnnLay(prop:{ele:annEle}) {
        return <div style={{
            width:'100%',
            boxSizing:'border-box',
            padding:10
        }}>
            <div style={{
                width:'100%',
                display:'flex',
                alignItems:'center'
            }}>
                <div style={{
                    flex:2,
                    boxSizing:'border-box',
                    paddingRight:dimen.dsk2?100:dimen.dsk?50:20
                }}>
                    <mye.Tv text={prop.ele.getMsg()} color={mye.mycol.imghint} maxLines={2} size={12} />
                </div>
                <div style={{
                    flex:1,
                }}>
                    <LrText 
                    left={<mye.Tv text={prop.ele.getTime()} size={12} color={mye.mycol.primarycol} />}
                    right={<mye.Tv text={'View'} size={12} color={mye.mycol.primarycol} onClick={()=>{

                    }} />}
                    />
                </div>
            </div>
            <Mgin top={10} />
            <div style={{width:'100%',height:1,backgroundColor:'rgba(0,0,0,0.1)'}}></div>
        </div>
    }

    function Tab1(prop:{title:string, value:string, icon?:icony, color:string, isLink?:boolean}) {
        
        return <div id="lshdw" style={{
            width: dimen.dsk?300:'100%',
            margin: dimen.dsk?20:'10px 0px',
            height:150,
            boxSizing:'border-box',
            position:'relative',
            borderRadius:10,
            backgroundImage: `url(${tabcard})`,
            backgroundSize: 'cover',
        }}>
            <div className="ctr" style={{
                width:70,
                height:70,
                backgroundColor:hexToRgba(prop.color,0.1),
                borderRadius:'50%',
                position:'absolute',
                top:20,
                right:20
            }}>
                {prop.icon?<prop.icon style={{
                    fontSize:20,
                    color: prop.color
                }} />:<img src={naira} height={20} alt="." color={prop.color} />}
            </div>
            <div style={{
                position:'absolute',
                left:20,
                bottom:20
            }}>
                <mye.Tv text={prop.title} color={mye.mycol.primarycol} />
                <Mgin top={10}/>
                {prop.isLink?<div className="hlc">
                    <mye.Tv text={prop.value} color={mye.mycol.primarycol } onClick={()=>{
                        goUrl(prop.value)
                    }} />
                    <Mgin right={2} />    
                    <CopyMan text={prop.value} toast={()=>{
                        toast('Link Copied',2)
                    }}  />
                </div>:<mye.BTv text={prop.value} size={20}  />}
            </div>
        </div>
    }
}