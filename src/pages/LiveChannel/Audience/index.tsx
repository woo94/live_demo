import { agoraClient, appId } from 'src/AgoraClient'
import AgoraRTC, { IAgoraRTCRemoteUser, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng'
import { useEffect, useRef, useState, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import {getDatabase, ref, remove, onValue} from 'firebase/database'
import LiveStreamingContext from 'src/context/LiveStreamingContext'

const database = getDatabase()

export default function AudienceRoom() {
    const remoteVideoTrack = useRef<IRemoteVideoTrack | null>(null)
    const remoteAudioTrack = useRef<IRemoteAudioTrack | null>(null)
    const [isLiveStreaming, setIsLiveStreaming] = useState(true)
    const [channelName] = useState(agoraClient.channelName as string)

    const {liveMap} = useContext(LiveStreamingContext)

    useEffect(() => {
        agoraClient.on('user-published', async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType)

            if(mediaType === "audio") {
                const audioTrack = user.audioTrack
                remoteAudioTrack.current = audioTrack || null
                audioTrack?.play()
            }
            else {
                const videoTrack = user.videoTrack
                remoteVideoTrack.current = videoTrack || null
                videoTrack?.play('local-player')
            }
        })

        const onUserJoined = (user: IAgoraRTCRemoteUser) => {
        
        }

        agoraClient.on('user-joined', onUserJoined)

        const channelRef = ref(database, `live/${channelName}`)

        onValue(channelRef, (snapshot) => {
            const data = snapshot.val()
            if(data === null) {
                // ref is removed
                agoraClient.leave()
                agoraClient.off('user-joind', onUserJoined)
                setIsLiveStreaming(false)
            }
        })

        return () => {
            agoraClient.leave()
            agoraClient.off('user-joined', onUserJoined)
        }
    }, [])

    return(
        <>
            <Box sx={{ width: '100%', height: '480px' }} id="local-player">

            </Box>
            {
                isLiveStreaming ? 
                null :
                <Typography variant="h4">
                    This live is no longer streaming🥲
                </Typography>
            }
        </>
    )
}