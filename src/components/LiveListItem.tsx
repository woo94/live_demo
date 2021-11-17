import {useEffect, useState, useContext} from 'react'
import {Grid, Box, Typography} from '@mui/material'
import {httpsCallable, getFunctions} from 'firebase/functions'
import {} from 'firebase/storage'
import {getDatabase, ref, get} from 'firebase/database'
import {appId, agoraClient} from 'src/AgoraClient'
import useLogin from 'src/hooks/useLogin'
import {useHistory} from 'react-router-dom'
import {LiveData} from 'src/types/live'
import LiveStreamingContext from 'src/context/LiveStreamingContext'

interface Props {
    liveData: LiveData
}

const functions = getFunctions()
const database = getDatabase()

export default function LiveListItem(props: Props) {
    // const [downloadURL, setDownloadURL] = useState('')

    const history = useHistory()
    const {uid} = useLogin()
    const {liveData} = props
    const {channel, title, name, start_at} = liveData

    const {deleteLiveData} = useContext(LiveStreamingContext)

    const handleItemClick = async () => {
        const generate_agora_auth_token = httpsCallable(functions, 'generate_agora_auth_token')
        sessionStorage.setItem('clientRole', 'audience')
        const generateTokenResult = await generate_agora_auth_token({
            name: "",
            grade: "",
            title: "",
            description: "",
            totalTime: 0,
            role: "subscriber",
            channelName: channel,
            uid: sessionStorage.getItem('uid')
        }).then(res => {
            return res.data as { token: string }
        })
        
        await agoraClient.setClientRole('audience').then(() => {
            sessionStorage.setItem('clientRole', 'audience')
        })

        await agoraClient.join(appId, channel, generateTokenResult.token as string)
        
        history.push('/live')
    }

    return (
        <Grid key={channel} xs={6} item>
            {
                liveData.url ?
                <img 
                    width="100%"
                    height="150px"
                    src={liveData.url}
                    style={{cursor: 'pointer'}}
                    onClick={handleItemClick}
                /> :
                <Box
                    onClick={handleItemClick}
                    sx={{ bgcolor: 'black', width: '100%', height: '150px', cursor: 'pointer' }}
                >
                </Box>
            }
            
            <Typography variant="subtitle1">
                {liveData.title}
                {/* {(liveMap.get(channelName) as LiveData).title} */}
            </Typography>
            <Typography variant="subtitle2">
                {liveData.name}
                {/* {(liveMap.get(channelName) as LiveData).name} */}
            </Typography>
            <Typography variant="body1">
                {liveData.start_at}
            </Typography>
        </Grid>
    )
}