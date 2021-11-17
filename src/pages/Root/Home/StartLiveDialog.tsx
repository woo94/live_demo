import {Dialog, DialogTitle, DialogContent, TextField, Box, Button, Select, MenuItem, Grid, Typography} from '@mui/material'
import React, {useState, useContext} from 'react'
import {agoraClient, appId} from 'src/AgoraClient'
import {getFunctions, httpsCallable} from 'firebase/functions'
import {v4 as uuidv4} from 'uuid'
import {useHistory} from 'react-router-dom'
import useLogin from 'src/hooks/useLogin'
import LiveStreamingContext from 'src/context/LiveStreamingContext'
import {ref, get, getDatabase} from 'firebase/database'

interface Props {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const functions = getFunctions()
const database = getDatabase()

export default function StartLiveDialog(props: Props) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [totalTime, setTotalTime] = useState(30)
    const {uid, name} = useLogin()

    const {addLiveData} = useContext(LiveStreamingContext)

    const history = useHistory()

    const closeDialog = () => {
        setTitle('')
        setDescription('')
        setTotalTime(30)
        props.setOpen(false)
    }

    const onClickStartLive = async () => {
        const generate_agora_auth_token = httpsCallable(functions, 'generate_agora_auth_token')
        const channelName = uuidv4()
        const generateTokenResult = await generate_agora_auth_token({
            uid,
            name,
            grade: "grade9",
            title,
            description,
            totalTime,
            role: "publisher",
            channelName
        }).then(res => {
            return res.data as { token: string }
        })

        const agoraAuthToken = generateTokenResult.token as string

        await agoraClient.setClientRole('host').then(() => {
            sessionStorage.setItem('clientRole', 'host')
        })

        try {
            await agoraClient.join(appId, channelName, agoraAuthToken, uid)
            const snapshot = await get(ref(database, `live/${channelName}`))
            const liveData = snapshot.val()
            addLiveData(liveData)
            closeDialog()
            history.push('/live')
        }
        catch(e) {
            console.log(e)
        }
    }

    const onClickEndLive = async () => {
        agoraClient.leave()
    }

    return (
        <Dialog fullWidth open={props.open} onClose={closeDialog}>
            <DialogTitle>
                Start Live
            </DialogTitle>
            <DialogContent>
                <Box py={2}>
                    <TextField value={title} onChange={(e) => {setTitle(e.target.value)}} fullWidth label="Title" />
                </Box>
                <Box py={2}>
                    <TextField value={description} onChange={(e) => {setDescription(e.target.value)}} fullWidth multiline minRows={4} maxRows={4} label="Description (optional)" />
                </Box>
                <Grid columnGap={3} alignItems="center" container justifyContent="end">
                    <Grid item>
                        <Typography variant="h6">Total Time</Typography>
                    </Grid>
                    <Grid item>
                        <Select value={totalTime} onChange={(e) => { setTotalTime(e.target.value as number) }}>
                            <MenuItem value={30}>30 min</MenuItem>
                            <MenuItem value={60}>60 min</MenuItem>
                            <MenuItem value={90}>90 min</MenuItem>
                            <MenuItem value={120}>120 min</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
                <Box py={2}>
                    <Button onClick={onClickStartLive} variant="outlined" color="secondary">
                        Start Live
                    </Button>
                </Box>
                <Box py={2}>
                    <Button onClick={onClickEndLive}>
                        End Live
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    )
}