import { agoraClient, appId } from 'src/AgoraClient'
import AgoraRTC, { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng'
import { useEffect, useRef, useState, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import {getDatabase, ref, remove, onValue} from 'firebase/database'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import LiveWidget from 'src/components/LiveWidget'
import { LiveData } from 'src/types/live'

const database = getDatabase()

const extractMin = (time: number) => {
    return Math.floor(time / 60).toString()
}

const extractSec = (time: number) => {
    return Math.floor(time % 60).toString()
}

export default function AudienceRoom() {
    const remoteVideoTrack = useRef<IRemoteVideoTrack | null>(null)
    const remoteAudioTrack = useRef<IRemoteAudioTrack | null>(null)
    const [isLiveStreaming, setIsLiveStreaming] = useState(true)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [expireTime, setExpireTime] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [intervalTimeout, setIntervalTimeout] = useState<NodeJS.Timeout | null>(null)
    const [channelName] = useState(agoraClient.channelName as string)

    const {liveDataList} = useContext(LiveStreamingContext)
    const liveData = liveDataList.find(val => val.channel === channelName) as LiveData

    const closeLive = () => {
        agoraClient.leave()
        setIsLiveStreaming(false)
    }

    useEffect(() => {
        agoraClient.on('user-published', async (user, mediaType) => {
            console.log('user-published!!!!!!')
            await agoraClient.subscribe(user, mediaType)

            if(mediaType === "audio") {
                const audioTrack = user.audioTrack
                remoteAudioTrack.current = audioTrack || null
                audioTrack?.play()
            }
            if (mediaType === "video") {
                const videoTrack = user.videoTrack
                remoteVideoTrack.current = videoTrack || null
                videoTrack?.play('local-player')
            }
        })

        agoraClient.on('user-unpublished', async(user, mediaType) => {
            console.log('user-unpublished!!!!!!')
            // await agoraClient.unsubscribe(user, mediaType)

            if(mediaType === "audio") {
                const audioTrack = user.audioTrack
                remoteAudioTrack.current = null
                audioTrack?.stop()
            }
            if(mediaType === "video") {
                const videoTrack = user.videoTrack
                remoteVideoTrack.current = null
                videoTrack?.stop()
            }

            setIsLiveStreaming(false)
        })

        const channelRef = ref(database, `live/${channelName}`)

        const removeOnValue = onValue(channelRef, (snapshot) => {
            const data = snapshot.val() as LiveData
            if(!data['active']) {
                closeLive()
                return;
            }

            setExpireTime(data['expire_at'])
            setElapsedTime(Math.floor(Date.now() / 1000) - data['start_at'])
            setStartTime(data['start_at'])
        })

        return () => {
            agoraClient.leave()
            removeOnValue()
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
        if(elapsedTime >= (expireTime - startTime)) {
            clearInterval(intervalTimeout as NodeJS.Timeout)
        }
        
    }, [elapsedTime])

    return(
        <>
            {
                isLiveStreaming ? 
                    <>
                        <Box my={2} sx={{ width: '100%', height: '400px' }} id="local-player"></Box>

                        <LiveWidget liveData={liveData} min={extractMin(elapsedTime)} sec={extractSec(elapsedTime)} />
                    </> :
                    <Typography py={2} variant="h4">
                        This live is no longer streaming🥲
                    </Typography>
            }
        </>
    )
}