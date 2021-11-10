import { Box, Typography, Grid, Divider, Button } from '@mui/material'
import { AccountCircle, Favorite, People, Timer } from '@mui/icons-material'
import { useEffect, useRef, useState, useContext } from 'react'
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser} from 'agora-rtc-sdk-ng'
import {agoraClient} from 'src/AgoraClient'
import { getDatabase, ref, onValue, remove } from 'firebase/database'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import { LiveData } from 'src/types/live'
import {useHistory} from 'react-router-dom'

const database = getDatabase()

export default function HostRoom() {
    const localVideoTrack = useRef<ICameraVideoTrack | null>(null)
    const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [expireTime, setExpirationTime] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [intervalTimeout, setIntervalTimeout] = useState<NodeJS.Timeout | null>(null)
    
    const {liveMap} = useContext(LiveStreamingContext)
    const [channelName] = useState(agoraClient.channelName as string)
    const liveData = liveMap.get(channelName) as LiveData

    const history = useHistory()

    const onUserJoined = (user: IAgoraRTCRemoteUser) => {
        console.log(user.hasVideo, 'user.hasVideo')
        console.log(user.uid, 'user.uid')
    }

    const onUserLeft = (user: IAgoraRTCRemoteUser) => {
        alert(user.uid)
    }

    const endLive = () => {
        agoraClient.unpublish()
        agoraClient.leave()
        
        localVideoTrack.current?.close()
        localAudioTrack.current?.close()

        agoraClient.off('user-joined', onUserJoined)
        agoraClient.off('user-left', onUserLeft)

        const channelRef = ref(database, `live/${channelName}`)
        remove(channelRef)
    }

    useEffect(() => {
        AgoraRTC.createMicrophoneAndCameraTracks().then(([audioTrack, videoTrack]) => {
            localAudioTrack.current = audioTrack
            localVideoTrack.current = videoTrack
            videoTrack.play('local-player')

            agoraClient.publish([audioTrack, videoTrack])
        })

        const liveRef = ref(database, `live/${channelName}`)
        onValue(liveRef, (snapshot) => {
            const data = snapshot.val()
            if(data === null) {
                return
            }
            setExpirationTime(data['expire_at'])
            setElapsedTime(Math.floor(Date.now() / 1000) - data['start_at'])
            setStartTime(data['start_at'])
        })

        agoraClient.on('user-joined', onUserJoined)
        agoraClient.on('user-left', onUserLeft)

        return () => {
            endLive()
        }

    }, [])

    useEffect(() => {
        if(expireTime === 0) {
            return
        }

        const timeout = setInterval(() => {
            setElapsedTime(prev => prev+1)
        }, 1000)

        setIntervalTimeout(timeout)

        return () => {
            clearInterval(timeout)
        }

    }, [expireTime])

    useEffect(() => {
        if(startTime === 0) {
            return
        }

        if(elapsedTime >= (expireTime - startTime)) {
            clearInterval(intervalTimeout as NodeJS.Timeout)
        }
    }, [elapsedTime, startTime])

    const extractMin = (time: number) => {
        return Math.floor(time / 60).toString()
    }
    
    const extractSec = (time: number) => {
        return Math.floor(time % 60).toString()
    }

    return (
        <>       
            <Box my={2} sx={{width: '100%', height: '400px'}} id="local-player"></Box>

            <Grid alignItems="center" container>
                <Grid xs={1} item>
                    <AccountCircle />
                </Grid>
                <Grid xs={8} item>
                    <Typography variant="subtitle1">
                        {liveData.name || ""}
                    </Typography>
                </Grid>
                <Grid textAlign="end" xs={2} item>
                    10
                </Grid>
                <Grid textAlign="end" xs={1} item>
                    <Favorite />
                </Grid>
            </Grid>

            <Divider sx={{my: 1}} />

            <Typography variant="subtitle1">
                {liveData.title}
            </Typography>

            <Divider sx={{my: 1}} />
            
            {
                liveData.description ?
                <>
                <Typography variant="subtitle2">
                    {liveData.description}
                </Typography> 
                <Divider sx={{my: 1}} /> 
                </> :
                null
            }
            
            

            <Grid mb={10} alignItems="center" container>
                <Grid xs={1} item>
                    <People />
                </Grid>
                <Grid xs={7} item>
                    65
                </Grid>
                <Grid textAlign="end" xs={1} item>
                    <Timer />
                </Grid>
                <Grid textAlign="end" xs={2} item>
                    {`${extractMin(elapsedTime)}:${extractSec(elapsedTime)}`}
                </Grid>
            </Grid>

            <Box textAlign="center">
                <Button onClick={endLive} sx={{width: '60%', py: 1}} variant="contained">
                    End live Can Study
                </Button>
            </Box>
        </>
    )
}