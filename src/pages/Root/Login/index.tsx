import {Container, Button, TextField, Typography, Box, Snackbar} from '@mui/material'
import React, {useState, useContext} from 'react'
import {getAuth, signInWithEmailAndPassword, setPersistence, browserSessionPersistence} from 'firebase/auth'
import {getFirestore, doc, getDoc, DocumentData} from 'firebase/firestore'

const auth = getAuth()
const firestore = getFirestore()

interface Props {
    saveInfo: (uid: string, name: string, token: string) => void;
}

export default function Login(props: Props) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [openSnackbar, setOpenSnackbar] = useState(false)

    const handleLogin = async () => {
        try {
            await setPersistence(auth, browserSessionPersistence)
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid

            const userDocRef = doc(firestore, 'user', uid)
            const userDoc = await getDoc(userDocRef)
            const userData = userDoc.data() as DocumentData
            const name = userData['name']

            const idToken = await userCredential.user.getIdToken()

            props.saveInfo(uid, name, idToken)
        }
        catch(e) {
            console.log(e)
            setOpenSnackbar(true)
        }
    }

    return (
        <Container maxWidth="sm">
            <Typography py={2} textAlign="center" variant="h2">
                Live Demo
            </Typography>
            <Typography py={2} textAlign="end" variant="h5">
                powered by agora
            </Typography>
            <Box py={1} sx={{textAlign: 'center', width: '50%', margin: '0 auto'}}>
                <TextField value={email} onChange={(e) => {setEmail(e.currentTarget.value)}} fullWidth label="Email" type="text" />
            </Box>
            <Box py={1} sx={{textAlign: 'center', width: '50%', margin: '0 auto'}}>
                <TextField value={password} onChange={(e) => {setPassword(e.currentTarget.value)}} fullWidth label="Password" type="password" />
            </Box>
            <Box sx={{textAlign: 'center', width: '50%', margin: '0 auto'}}>
                <Button onClick={handleLogin} fullWidth sx={{height: '50px'}} variant="contained" color="secondary" >
                    Login
                </Button>
            </Box>
            <Snackbar open={openSnackbar} message="Login fail! - check out the email and password" onClose={() => {setOpenSnackbar(false)}} autoHideDuration={3000} />
        </Container>
    )
}