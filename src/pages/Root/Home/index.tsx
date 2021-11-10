import {Container, Grid, Box, Typography} from '@mui/material'
import {FiberManualRecord, Upload} from '@mui/icons-material'
import React, {useEffect, useState, useRef, useContext} from 'react'
import {Switch, Route} from 'react-router-dom'
import {ref, onChildAdded, getDatabase} from 'firebase/database'
import _ from 'lodash'
import {LiveData, LiveMap} from 'src/types/live'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import StartLiveDialog from './StartLiveDialog'
import {useHistory} from 'react-router-dom'
import {agoraClient, appId} from 'src/AgoraClient'
import {getFunctions, httpsCallable} from 'firebase/functions'
import useLogin from 'src/hooks/useLogin'

const database = getDatabase()
const functions = getFunctions()

interface Props {
    // str: string;
    // setStr: React.Dispatch<React.SetStateAction<string>>;
}

export default function Home(props: Props) {
    const [openStartLiveDialog, setOpenStartLiveDialog] = useState(false)

    const {liveMap, upsertLiveData} = useContext(LiveStreamingContext)

    const history = useHistory()

    const {uid} = useLogin()

    const handleStartLive = () => {
        setOpenStartLiveDialog(true)
    }

    const handleUploadVideo = () => {

    }

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

            <Grid columnSpacing={2} container>
                {
                    Array.from(liveMap.keys()).map(channelName => (
                        <Grid key={channelName} xs={6} item>
                            <Box 
                                onClick={async () => {
                                    const generate_agora_auth_token = httpsCallable(functions, 'generate_agora_auth_token')
                                    console.log(sessionStorage.getItem('uid'))
                                    const generateTokenResult = await generate_agora_auth_token({
                                        name: "",
                                        grade: "",
                                        title: "",
                                        description: "",
                                        totalTime: 0,
                                        role: "subscriber",
                                        channelName,
                                        uid: sessionStorage.getItem('uid')
                                    })
                                    console.log(generateTokenResult)
                                    await agoraClient.join(appId, channelName, generateTokenResult.data as string, uid)
                                    sessionStorage.setItem('clientRole', 'audience')
                                    history.push('/live')
                                }} 
                                sx={{bgcolor: 'black', width: '100%', height: '150px', cursor: 'pointer'}}
                            >

                            </Box>
                            <Typography variant="subtitle1">
                                {(liveMap.get(channelName) as LiveData).title}
                            </Typography>
                            <Typography variant="subtitle2">
                                {(liveMap.get(channelName) as LiveData).name}
                            </Typography>
                        </Grid>
                    ))
                }
            </Grid>
            <StartLiveDialog open={openStartLiveDialog} setOpen={setOpenStartLiveDialog} />
        </>
    )
}