import { useState } from 'react'

export default function useLogin() {
    const [token, setToken] = useState<string>(
        sessionStorage.getItem('firebaseToken') || ""
    )

    const [uid, setUid] = useState<string>(
        sessionStorage.getItem('uid') || ""
    )

    const [name, setName] = useState<string>(
        sessionStorage.getItem('name') || ""
    )

    const saveInfo = (uid: string, name: string, token: string) => {
        sessionStorage.setItem('firebaseToken', token)
        sessionStorage.setItem('uid', uid)
        sessionStorage.setItem('name', name)
        setToken(token)
        setUid(uid)
        setName(name)
    }

    return {
        token,
        uid,
        name,
        saveInfo
    }
}