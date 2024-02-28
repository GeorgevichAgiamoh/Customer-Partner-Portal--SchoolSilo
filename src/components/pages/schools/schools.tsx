import { useEffect, useRef, useState } from "react";
import useWindowDimensions from "../../../helper/dimension";
import { Btn, ErrorCont, LoadLay, LrText, Mgin, myEles } from "../../../helper/general";
import { SchoolNav } from "../nav";
import { Add, ArrowDropDown, DeveloperModeOutlined, LockOutlined, Menu, NotificationsActiveOutlined, PersonOutline } from "@mui/icons-material";
import { endpoint, getUserId, makeRequest } from "../../../helper/requesthandler";
import { useNavigate } from "react-router-dom";
import { schoolBasicinfo, schoolGeneralinfo } from "../../classes/models";
import { CircularProgress } from "@mui/material";
import Toast from "../../toast/toast";
import { SchoolDashboard } from "./dashbrd";
import { SchoolProfile } from "./schoolprofile";
import { PaySchoolRegFee } from "../register";
import { SchoolMessages } from "./messages/messages";


export function Schools(){
    const[myKey, setMyKey] = useState(Date.now())
    const mye = new myEles(false);
    const navigate = useNavigate()
    const dimen = useWindowDimensions();
    const[showNav, setShowNav] = useState(false)
    const[tabPos, setTabPos] = useState(0)
    const[sbi, setSBI] = useState<schoolBasicinfo>()
    const[sgi, setSGI] = useState<schoolGeneralinfo>()
    const[ppic,setPpic] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const tabs = [
        'Dashboard',
        'Payments',
        'Messages',
        'User Profile',
        'Logout'
    ]

    useEffect(()=>{
        makeRequest.get('checkTokenValidity',{},(task)=>{
          if(task.isSuccessful()){
            //OK
            getSchoolInfo()
          }else{
            navigate('/schoolLogin')
          }
        })
    },[])


    function getSchoolInfo(){
        makeRequest.get(`getSchoolBasicInfo/${getUserId()}`,{},(task)=>{
            if(task.isSuccessful()){
                const sb = new schoolBasicinfo(task.getData())
                setSBI(sb)
                makeRequest.get(`getSchoolGeneralInfo/${getUserId()}`,{},(task)=>{
                    if(task.isSuccessful()){
                        if(task.exists()){
                            setSGI(new schoolGeneralinfo(task.getData()))
                        }
                    }else{
                        setError(true)
                    }
                })
            }else{
                setError(true)
            }
        })
        //Profile pic
        makeRequest.get(`fileExists/dp/${getUserId()}`,{},(task)=>{
            if(task.isSuccessful()){
                setPpic(`${endpoint}/getFile/dp/${getUserId()}`)
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
        width: dimen.width,
        height: dimen.height
    }}>
        <ErrorCont isNgt={false} visible={error} retry={()=>{
            setError(false)
            getSchoolInfo()
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
        <div key={myKey} style={{
            width:'100%',
            height:'100%',
            display:'flex'
        }}>
            <div style={{
                width:250,
                height:'100%',
                display: dimen.dsk?undefined:'none'
            }}>
                <SchoolNav  key={myKey+0.2} currentTab={tabPos} mye={mye} isMobile={!dimen.dsk} ocl={(pos)=>{
                    setTabPos(pos)
                    if(pos==4){
                        makeRequest.get('logout',{},(task)=>{
                            navigate('/schoolLogin')
                        })
                    }
                }} showy={()=>{

                }}  />
            </div>
            <div style={{
                flex:1,
                display:'flex',
                flexDirection:'column',
                height:'100%',
            }}>
                <div style={{
                    width:'100%',
                    padding:'10px 20px',
                    boxSizing:'border-box',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06), 0 2px 5px rgba(0, 0,0,0.1)'
                }}>
                    <LrText
                        left={<div className="hlc">
                            <div style={{
                                display: dimen.dsk?'none':undefined,
                                padding:5,
                                marginRight:10
                            }} onClick={()=>{
                                setShowNav(true)
                            }}>
                                <Menu />
                            </div>
                            <mye.HTv text={tabs[tabPos]} size={16} color={mye.mycol.primarycol} />
                        </div>}
                        right={<div className="hlc">
                            <NotificationsActiveOutlined className="icon" />
                            <Mgin right={15}/>
                            <div style={{
                                width:1,
                                height:20,
                                backgroundColor:mye.mycol.primarycol
                            }}></div>
                            <Mgin right={15}/>
                            <div id="clk" onClick={()=>{
                                    fileInputRef.current?.click()
                                }}>
                                    <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e)=>{
                                        const file = e.target.files?.[0];
                                        if(file){
                                            setLoad(true)
                                            makeRequest.uploadFile('dp',getUserId(),getUserId(),file, (task)=>{
                                                setLoad(false)
                                                if(task.isSuccessful()){
                                                    toast('Profile picture set',1)
                                                    setTimeout(()=>{
                                                        setPpic(`${endpoint}/getFile/dp/${getUserId()}`)
                                                    },2000)
                                                }else{
                                                    if(task.isLoggedOut()){
                                                        navigate('/schoolLogin')
                                                        return
                                                    }
                                                    toast(task.getErrorMsg(),0)
                                                }
                                            })
                                        }else{
                                            toast('Invalid File. Try again',0)
                                        }
                                    }}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                {ppic.length==0?<div  className="ctr" style={{
                                    width:42,
                                    height:42,
                                    backgroundColor:mye.mycol.btnstrip,
                                    borderRadius:50
                                }} >
                                    <Add className="icon" />
                                </div>:<img src={ppic} alt="DP" style={{
                                    objectFit:'cover',
                                    width:42,
                                    height:42,
                                    backgroundColor:mye.mycol.btnstrip,
                                    borderRadius:50
                                }}  />}
                            </div>
                            <Mgin right={5}/>
                            <ArrowDropDown className="icon" />
                        </div>}
                        />
                </div>
                <div style={{
                    flex:1,
                    width:'100%',
                    overflowY:'scroll',
                    backgroundColor:'rgba(0,0,0,0.02)'
                }}>
                    {sbi?tabPos===0?<SchoolDashboard goto={(a)=>{
                        setTabPos(a)
                        setMyKey(Date.now())
                    }}  sbi={sbi!} sgi={sgi}/>:tabPos===1?<PaySchoolRegFee sbi={sbi!}/>:
                    tabPos===2?<SchoolMessages sbi={sbi!}/>:
                    tabPos===3?<SchoolProfile goto={(a)=>{
                        setTabPos(a)
                        setMyKey(Date.now())
                    }}  />:LoadLay():LoadLay()}
                </div>
            </div>
        </div>
        <div style={{
            position:'absolute',
            top:0,
            left:0,
            width:'100%',
            height:'100%',
            display: (!dimen.dsk && showNav) ? undefined:'none'
        }}>
            <SchoolNav key={myKey+0.3} currentTab={tabPos} mye={mye} isMobile={!dimen.dsk} ocl={(pos)=>{
                setShowNav(false)
                setTabPos(pos)
                if(pos==4){
                    makeRequest.get('logout',{},(task)=>{
                        navigate('/schoolLogin')
                    })
                }
            }} showy={()=>{
                setShowNav(false)
            }}  />
        </div>
    </div>

    function AskToVerif() {
        return <div className="ctr" style={{
            width:'100%',
            height:'100%'
        }}>
            <div className="vlc">
                <PersonOutline style={{
                    fontSize:30,
                    color:mye.mycol.primarycol
                }} />
                <Mgin top={20} />
                <mye.HTv text={sgi?"Pending Verification":'Complete Profile'} />
                <Mgin top={10} />
                <mye.Tv text={sgi?'Your profile is pending verification by the admin. Please check back later':'Please click button below to complete your profile'} />
                <div style={{
                    display:sgi?'none':undefined
                }}>
                    <Mgin top={10} />
                    <Btn txt="COMPLETE PROFILE" width={150} onClick={()=>{
                        setTabPos(3)
                        setMyKey(Date.now())
                    }} />
                </div>
            </div>
        </div>
    }

    function ShowProfileDeleted() {
        return <div className="ctr" style={{
            width:'100%',
            height:'100%'
        }}>
            <div className="vlc">
                <LockOutlined style={{
                    fontSize:30,
                    color:mye.mycol.primarycol
                }} />
                <Mgin top={20} />
                <mye.HTv text={'Profile Deleted'} />
                <Mgin top={10} />
                <mye.Tv text={'Your profile has been deleted by the admin. Please reach out to NACDDED HQ to resolve'} center />
            </div>
        </div>
    }


}


export function MsgTBD() {
    const mye = new myEles(false)
    
    return <div className="ctr" style={{
        width:'100%',
        height:'100%'
    }}>
        <div className="vlc">
            <DeveloperModeOutlined style={{
                fontSize:30,
                color:mye.mycol.primarycol
            }} />
            <Mgin top={20} />
            <mye.HTv text={'Coming Soon'} />
            <Mgin top={10} />
            <mye.Tv text={'Messaging is coming soon'} />
        </div>
    </div>
}
