import { Box, Button, Typography } from '@mui/material'
import { useEffect, useRef, useState, useContext } from 'react'
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser} from 'agora-rtc-sdk-ng'
import {agoraClient} from 'src/AgoraClient'
import { getDatabase, ref, onValue, update } from 'firebase/database'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import { LiveData } from 'src/types/live'
import {useHistory} from 'react-router-dom'
import LiveWidget from 'src/components/LiveWidget'
import {uploadString, getStorage, ref as storageRef} from 'firebase/storage'
import useLogin from 'src/hooks/useLogin'
import {v4 as uuidv4} from 'uuid'
import {AcUnit} from '@mui/icons-material'

const database = getDatabase()
const storage = getStorage()

const extractMin = (time: number) => {
    return Math.floor(time / 60).toString()
}

const extractSec = (time: number) => {
    return Math.floor(time % 60).toString()
}

export default function HostRoom() {
    const localVideoTrack = useRef<ICameraVideoTrack | null>(null)
    const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [expireTime, setExpireTime] = useState(0)
    const [startTime, setStartTime] = useState(0)
    const [intervalTimeout, setIntervalTimeout] = useState<NodeJS.Timeout | null>(null)
    const [thumbnailTimeout, setThumbnailTimeout] = useState<NodeJS.Timeout | null>(null)
    const [isLiveStreaming, setIsLiveStreaming] = useState(true)
    
    const {liveDataList, deleteLiveData} = useContext(LiveStreamingContext)
    const [channelName] = useState(agoraClient.channelName as string)
    const liveData = liveDataList.find(val => val.channel === channelName) as LiveData

    const {uid} = useLogin()

    const onUserJoined = (user: IAgoraRTCRemoteUser) => {
        console.log(user.hasVideo, 'user.hasVideo')
        console.log(user.uid, 'user.uid')
    }

    const onUserLeft = (user: IAgoraRTCRemoteUser) => {
        alert(user.uid)
    }

    const captureImage = async () => {
        const imageData = (localVideoTrack.current as ICameraVideoTrack).getCurrentFrameData()
        const ctx = (canvasRef.current as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D
        const b = await createImageBitmap(imageData, {
            resizeQuality: 'medium',
            resizeHeight: 240,
            resizeWidth: 320
        })
        ctx.drawImage(b, 0, 0)
    }

    const uploadImage = async () => {
        await captureImage()

        const fileRef = storageRef(storage, `${uid}/${channelName}/${uuidv4()}`)
        const imageURL = (canvasRef.current as HTMLCanvasElement).toDataURL()
        // console.log(imageURL)
        await uploadString(fileRef, imageURL, 'data_url').then(res => {
            console.log(res)
        })
    }

    const endLive = () => {
        console.log('endLive')
        setIsLiveStreaming(false)
        
        agoraClient.unpublish()
        agoraClient.leave()
        
        localVideoTrack.current?.close()
        localAudioTrack.current?.close()

        agoraClient.off('user-joined', onUserJoined)
        agoraClient.off('user-left', onUserLeft)

        const channelRef = ref(database, `live/${channelName}`)
        update(channelRef, {
            active: false
        })

        deleteLiveData(channelName)
        clearInterval(thumbnailTimeout as NodeJS.Timeout)
    }

    useEffect(() => {
        AgoraRTC.createMicrophoneAndCameraTracks().then(([audioTrack, videoTrack]) => {
            localAudioTrack.current = audioTrack
            localVideoTrack.current = videoTrack
            videoTrack.play('local-player')

            agoraClient.publish([audioTrack, videoTrack])
        })

        const timeout = setInterval(() => {
            uploadImage()
        }, 1000 * 60 * 0.5)

        setThumbnailTimeout(timeout)

        const liveRef = ref(database, `live/${channelName}`)
        const removeOnvalue = onValue(liveRef, (snapshot) => {
            const data = snapshot.val()
            if(data === null) {
                endLive()
                return
            }
            setExpireTime(data['expire_at'])
            setElapsedTime(Math.floor(Date.now() / 1000) - data['start_at'])
            setStartTime(data['start_at'])
        })

        agoraClient.on('user-joined', onUserJoined)
        agoraClient.on('user-left', onUserLeft)

        window.addEventListener('beforeunload', endLive)

        return () => {
            window.removeEventListener('beforeunload', endLive)
            endLive()
            clearInterval(timeout)
            removeOnvalue()
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

    return (
        <>
            {
                isLiveStreaming ?
                    <>
                        <Box my={2} sx={{ position: 'relative', width: '100%', height: '400px' }} id="local-player">
                            {/* <Box sx={{width: '100%', height: '100%', position: 'relative'}}> */}
                                <AcUnit sx={{ zIndex: 1000, position: 'absolute', top: "50%", left: "50%"}} />
                            {/* </Box> */}
                        </Box>
                        <LiveWidget liveData={liveData} min={extractMin(elapsedTime)} sec={extractSec(elapsedTime)} />
                        
                        {/* <Box sx={{ width: '100%', height: '400px' }}> */}
                            <canvas style={{display: 'none'}} width="320px" height="240px" ref={canvasRef}></canvas>
                            {/* <Button onClick={captureImage} variant="contained">Capture screen</Button>
                            <Button onClick={uploadImage} variant="contained">Use capture as thumbnail </Button>
                        </Box> */}
                        <Box textAlign="center">
                            <Button onClick={endLive} sx={{ width: '60%', py: 1 }} variant="contained">
                                End live Can Study
                            </Button>
                        </Box>
                    </> :
                    <Typography py={2} variant="h4">
                        This live is no longer streaming🥲
                    </Typography>
            }
        </>
    )
}