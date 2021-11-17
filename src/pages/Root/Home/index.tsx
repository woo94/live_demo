import {Container, Grid, Box, Typography, Button} from '@mui/material'
import {FiberManualRecord, Upload, Refresh, Add} from '@mui/icons-material'
import React, {useEffect, useState, useRef, useContext, useCallback} from 'react'
import {ref, onChildAdded, getDatabase, query, orderByChild, equalTo, get, endAt, orderByValue, limitToLast} from 'firebase/database'
import _ from 'lodash'
import {LiveData, LiveMap} from 'src/types/live'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import StartLiveDialog from './StartLiveDialog'
import {useHistory} from 'react-router-dom'
import {agoraClient, appId} from 'src/AgoraClient'
import {getFunctions, httpsCallable} from 'firebase/functions'
import useLogin from 'src/hooks/useLogin'
import LiveListItem from 'src/components/LiveListItem'
import {getAuth, onAuthStateChanged} from 'firebase/auth'

const database = getDatabase()
const functions = getFunctions()
const auth = getAuth()

interface Props {
    // str: string;
    // setStr: React.Dispatch<React.SetStateAction<string>>;
}

export default function Home(props: Props) {
    const [openStartLiveDialog, setOpenStartLiveDialog] = useState(false)
    const [scrollEventEnable, setScrollEventEnable] = useState(true)

    const {liveDataList, addLiveData, refreshLiveData, updateLiveData} = useContext(LiveStreamingContext)
    const history = useHistory()

    const handleStartLive = () => {
        setOpenStartLiveDialog(true)
    }

    const handleUploadVideo = () => {

    }

    const handleRefreshBtn = () => {
        history.go(0)
    }
    
    const handleAddBtn = async () => {
        if(liveDataList.length === 0) {
            return
        }
        
        const lastData = liveDataList[liveDataList.length - 1]
        const queryReferenceTime = lastData.start_at
        const queryReferenceKey = lastData.channel
        const queryResultList: Array<LiveData> = []

        // const additionalQuery = query(ref(database, 'live'), orderByChild('start_at'), endBefore(queryReferenceTime), limitToLast(10))
        const additionalQuery = query(ref(database, 'live'), orderByChild('start_at'), endAt(queryReferenceTime, 'start_at'), equalTo(true, 'active'), limitToLast(11))
        const queryResult = await get(additionalQuery)

        queryResult.forEach(snapshot => {
            if(snapshot.key !== queryReferenceKey) {
                const data = snapshot.val()
                queryResultList.unshift(data)
            }
        })

        addLiveData(...queryResultList)
    }

    useEffect(() => {
        const timeout = setInterval(() => {
            const queryPromises = liveDataList.map(async liveData => {
                const {channel} = liveData
                const channelRef = ref(database, `live/${channel}`)
                const recentChannelSnapshot = await get(channelRef)
                const recentChannelData = recentChannelSnapshot.val()
                if(recentChannelData !== null) {
                    updateLiveData(recentChannelData)
                }
            })

            Promise.all(queryPromises).catch(err => {
                console.log(err)
            })
        }, 1000 * 20)

        return () => {
            clearInterval(timeout)
        }

    }, [liveDataList])

    useEffect(() => {
        if(liveDataList.length === 0) {
            const initQuery = query(ref(database, 'live'), orderByChild('active'), equalTo(true),  orderByChild('start_at'), limitToLast(10))
            const queryResultList: Array<LiveData> = []
            get(initQuery).then(snapshot => {
                snapshot.forEach(child => {
                    const liveData = child.val()
                    queryResultList.unshift(liveData)
                })

                console.log(queryResultList)
                addLiveData(...queryResultList)
            })
        }   
        
    }, [])

    const scrollHandler = () => {
        // if((window.innerHeight + window.scrollY >= document.body.offsetHeight) && scrollEventEnable) {
        //     console.log('condition true')
        //     setScrollEventEnable(false)

        //     console.log(liveDataList.length)
        //     console.log(liveDataList[liveDataList.length - 1])

        //     const additionalQuery = query(ref(database, 'live'), orderByChild('start_at'), endBefore(liveDataList[liveDataList.length - 1].start_at), limitToLast(10))

        //     get(additionalQuery).then(snapshot => {
        //         snapshot.forEach(child => {
                    
        //             const channelName = child.key
        //             const liveData = child.val()
        //             console.log(liveData)
        //             upsertLiveData(channelName as string, liveData)
        //         })

        //         setScrollEventEnable(true)
        //     })
        // }
    }

    useEffect(() => {
        window.addEventListener('scroll', scrollHandler)
        
        return () => {
            window.removeEventListener('scroll', scrollHandler)
        }

    }, [liveDataList])

    return (
        <>
            <Grid py={2} columnGap={3} alignItems="center" container>
                <Grid flexGrow={1} item>
                    <Grid columnGap={1} onClick={handleStartLive} py={2} justifyContent="center" sx={{ border: '1px solid black', borderRadius: '20px', cursor: 'pointer' }} alignItems="center" container>
                        <Grid item>
                            <FiberManualRecord fontSize="large" color="error" />
                        </Grid>
                        <Grid item>
                            <Typography variant="h5">Start Live</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid flexGrow={1} item>
                    <Grid columnGap={1} onClick={handleUploadVideo} py={2} justifyContent="center" sx={{ border: '1px solid black', borderRadius: '20px', cursor: 'pointer' }} alignItems="center" container>
                        <Grid item>
                            <Upload fontSize="large" />
                        </Grid>
                        <Grid item>
                            <Typography variant="h5">Upload Video</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Box>
                <Button onClick={handleRefreshBtn} startIcon={<Refresh />}>refresh</Button>
                <Button onClick={handleAddBtn} startIcon={<Add />}>add</Button>
            </Box>

            <Grid columnSpacing={2} container>
                {
                    liveDataList.map(data => (
                        <LiveListItem key={data.channel} liveData={data} />
                    ))
                }
            </Grid>
            <StartLiveDialog open={openStartLiveDialog} setOpen={setOpenStartLiveDialog} />
        </>
    )
}